const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const recipeGrid = document.getElementById('recipeGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const modal = document.getElementById('recipeModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const scrollTopBtn = document.getElementById('scrollTopBtn');


// ================= EVENT LISTENERS ================= //
loadInitialRecipes();

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});


//Modal close
modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});


//Scroll to top button
window.addEventListener('scroll', () => {
    if (document.documentElement.scrollTop > 300) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

//Scroll to top action
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});


// ================= FUNCTIONS ================= //

//Homepage recipes
async function loadInitialRecipes() {
    showLoading();
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken');
    const data = await res.json();
    if (data.meals) {
        displayRecipes(data.meals);
    } else {
        showError('No recipes found.');
    }
}


//Search logic
async function performSearch() {
    const query = searchInput.value.trim();

    if (query === "") {
        loadInitialRecipes();
        return;
    }

    showLoading();
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await res.json();

    if (data.meals) {
        displayRecipes(data.meals);
    } else {
        showError(`No recipes found for "${query}".`);
    }
}


// Render recipe cards
function displayRecipes(recipes) {
    hideLoading();
    recipeGrid.innerHTML = '';

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';

        card.innerHTML = `
            <img src="${recipe.strMealThumb}" class="recipe-image">
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.strMeal}</h3>
                <p class="recipe-description">
                    ${recipe.strInstructions.substring(0, 100)}...
                </p>
                <button class="view-details-btn" onclick="showRecipeDetails('${recipe.idMeal}')">
                    View Details
                </button>
            </div>
        `;

        recipeGrid.appendChild(card);
    });
}


// Modal details
async function showRecipeDetails(id) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    const recipe = data.meals[0];

    document.getElementById('modalImage').src = recipe.strMealThumb;
    document.getElementById('modalTitle').textContent = recipe.strMeal;
    document.getElementById('modalCategory').textContent = `Category: ${recipe.strCategory}`;
    document.getElementById('modalArea').textContent = `Cuisine: ${recipe.strArea}`;
    document.getElementById('modalInstructions').textContent = recipe.strInstructions;

    const ingredientsList = document.getElementById('modalIngredients');
    ingredientsList.innerHTML = '';

    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            const li = document.createElement('li');
            li.textContent = `${measure} ${ingredient}`;
            ingredientsList.appendChild(li);
        }
    }

    const video = document.getElementById('modalVideo');
    if (recipe.strYoutube) {
        video.href = recipe.strYoutube;
        video.style.display = 'inline-block';
    } else {
        video.style.display = 'none';
    }

    modal.style.display = 'block';
}


// UI helpers
function showLoading() {
    recipeGrid.innerHTML = '';
    loadingSpinner.style.display = 'block';
    errorMessage.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showError(message) {
    hideLoading();
    recipeGrid.innerHTML = '';
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}


//expose function
window.showRecipeDetails = showRecipeDetails;
