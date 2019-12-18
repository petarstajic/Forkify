//const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes'
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';


/*Global state of the app
* - Search object
* - Current recipe object
* - Shopping list objectThe Complete JavaScript Course 2020: Build Real Projects!
Get certificate
￼Share
￼

* - liked recipes
*/
const state = {};


const controlSearch = async () => {
    // 1) Get query from viewThe Complete JavaScript Course 2020: Build Real Projects!
Get certificate
￼Share
￼

    const query = searchView.getInput();

    if(query) {
        //2) New search object and add to state
        state.search = new Search(query);

        //3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        //4) Search for recipes
        try {
            await state.search.getResults();

            //5 Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Somthing wrong with the search...');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

//testing

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

//recipe controller

const controlRecipe = async () => {
    //get id from url
    const id = window.location.hash.replace('#', '');


    if(id){
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        if(state.search) searchView.highlightSelected(id);

        state.recipe = new Recipe(id);
        try{
            await  state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcTime();
            state.recipe.calcServings();
            
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );   
        }catch (err) {

            alert('Error processing recipe!');

        }
        
    }
};

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load',controlRecipe);

['hashchange','load'].forEach(event => window.addEventListener(event, controlRecipe));

const controlList = () => {
    if(!state.list) state.list = new List();

    state.recipe.ingredients.forEach(el=>{
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        state.list.deleteItem(id);

        listView.deleteItem(id);

    }else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});




const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    if(!state.likes.isLiked(currentID)) {

        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            
        );
        
   

        likesView.toggleLikeBtn(true);

        likesView.renderLike(newLike);

    }else {

        state.likes.deleteLike(currentID);


        likesView.toggleLikeBtn(false);

        likesView.deleteLike(currentID);

    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};



window.addEventListener('load', () => {
    state.likes = new Likes();

    state.likes.readStorage();
   
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    state.likes.likes.forEach( like => likesView.renderLike(like));
});

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
    
        if(state.recipe.calcServings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
            
        }        
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){

        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }

});

