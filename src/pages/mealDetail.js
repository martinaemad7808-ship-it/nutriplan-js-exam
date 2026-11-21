import * as mealdb from "../api/mealdb.js";
import * as nutritionApi from "../api/nutrition.js";
import * as store from "../state.js";
import { createEmptyState } from "../components.js";
import { getOrCreateSection } from "./utils.js";

export async function renderMealDetailPage(app) {
  const section = getOrCreateSection("meal-detail-section", "px-8 py-6 bg-gray-50 min-h-screen");
  const mealId = store.getState().selectedMealId;

  const renderError = (msg, icon) => {
    section.innerHTML = `
      <div class="max-w-6xl mx-auto">
        ${backButton()}
        ${createEmptyState(msg, icon)}
      </div>`;
    section.querySelector("#back-to-meals-btn").addEventListener("click", () => app.navigateTo("meals"));
  };

  if (!mealId) {
    renderError("No recipe selected. Please select a recipe to view details.", "fa-utensils");
    return;
  }

  try {
    const meal = await mealdb.getMealById(mealId);
    if (!meal) throw new Error("Meal not found");
    const ingredients = mealdb.extractIngredients(meal);
    const steps = mealdb.parseInstructions(meal.strInstructions);

    store.updateState({ selectedMeal: meal });
    section.innerHTML = mealDetailTemplate(meal, ingredients, steps);

    section.querySelector("#back-to-meals-btn").addEventListener("click", () => app.navigateTo("meals"));
    section.querySelector("#log-meal-btn").addEventListener("click", (e) => {
      if (!e.currentTarget.disabled) showLogMealModal(app, meal);
    });

    loadNutritionData(meal, ingredients);
  } catch (err) {
    console.error("Error loading meal detail:", err);
    renderError("Failed to load recipe details. Please try again.", "fa-exclamation-circle");
  }
}

function backButton() {
  return `
    <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
      <i class="fa-solid fa-arrow-left"></i>
      <span>Back to Recipes</span>
    </button>`;
}

async function loadNutritionData(meal, ingredients) {
  const container = document.getElementById("nutrition-facts-container");
  if (!container) return;

  const logBtn = document.getElementById("log-meal-btn");
  const heroCalories = document.getElementById("hero-calories");
  const heroServings = document.getElementById("hero-servings");

  try {
    const lines = ingredients.map((i) => `${i.measure} ${i.ingredient}`);
    const raw = await nutritionApi.analyzeRecipe(meal.strMeal, lines);
    const nutrition = nutritionApi.formatNutritionForDisplay(raw);

    const cache = store.getState().mealNutritionCache;
    cache[meal.idMeal] = nutrition;
    store.updateState({ mealNutritionCache: cache });

    container.innerHTML = nutritionContent(nutrition);
    if (heroCalories) heroCalories.textContent = `${nutrition.caloriesPerServing} cal/serving`;
    if (heroServings) heroServings.textContent = `${nutrition.servings} servings`;

    if (logBtn) {
      logBtn.disabled = false;
      logBtn.className =
        "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all cursor-pointer";
      logBtn.title = "";
      logBtn.innerHTML = `<i class="fa-solid fa-clipboard-list"></i><span>Log This Meal</span>`;
    }
  } catch (err) {
    console.error("Error loading nutrition data:", err);
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fa-solid fa-exclamation-circle text-3xl text-red-400 mb-3"></i>
        <p class="text-gray-600">Unable to load nutrition data</p>
        <button id="retry-nutrition-btn" class="mt-3 text-emerald-600 hover:text-emerald-700 font-medium text-sm">
          <i class="fa-solid fa-refresh mr-1"></i> Try Again
        </button>
      </div>`;
    if (heroCalories) heroCalories.textContent = "N/A";
    if (logBtn) {
      logBtn.className =
        "flex items-center gap-2 px-6 py-3 bg-red-100 text-red-500 rounded-xl font-semibold cursor-not-allowed transition-all";
      logBtn.title = 'Nutrition data failed to load. Click "Try Again" in the nutrition section.';
      logBtn.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i><span>Unavailable</span>`;
    }
    document.getElementById("retry-nutrition-btn")?.addEventListener("click", () => {
      container.innerHTML = nutritionLoadingState();
      if (heroCalories) heroCalories.textContent = "Calculating...";
      if (logBtn) {
        logBtn.disabled = true;
        logBtn.className =
          "flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed transition-all";
        logBtn.title = "Waiting for nutrition data...";
        logBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Calculating...</span>`;
      }
      loadNutritionData(meal, ingredients);
    });
  }
}

function nutritionLoadingState() {
  return `
    <div class="text-center py-8">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
        <i class="fa-solid fa-calculator text-emerald-600 text-xl animate-pulse"></i>
      </div>
      <p class="text-gray-700 font-medium mb-1">Calculating Nutrition</p>
      <p class="text-sm text-gray-500">Analyzing ingredients...</p>
      <div class="mt-4 flex justify-center">
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
      </div>
    </div>`;
}

function macroRow(label, amount, percent, color) {
  return `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full ${color}"></div>
        <span class="text-gray-700">${label}</span>
      </div>
      <span class="font-bold text-gray-900">${amount}g</span>
    </div>
    <div class="w-full bg-gray-100 rounded-full h-2">
      <div class="${color} h-2 rounded-full" style="width: ${Math.min(percent, 100)}%"></div>
    </div>`;
}

function nutritionContent(n) {
  const m = n.macros;
  return `
    <p class="text-sm text-gray-500 mb-4">Per serving</p>

    <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
      <p class="text-sm text-gray-600">Calories per serving</p>
      <p class="text-4xl font-bold text-emerald-600">${n.caloriesPerServing}</p>
      <p class="text-xs text-gray-500 mt-1">Total: ${n.totalCalories} cal</p>
    </div>

    <div class="space-y-4">
      ${macroRow("Protein", m.protein.amount, m.protein.dailyValue, "bg-emerald-500")}
      ${macroRow("Carbs", m.carbs.amount, m.carbs.dailyValue, "bg-blue-500")}
      ${macroRow("Fat", m.fat.amount, m.fat.dailyValue, "bg-purple-500")}
      ${macroRow("Fiber", m.fiber.amount, m.fiber.dailyValue, "bg-orange-500")}
      ${macroRow("Sugar", m.sugar.amount, Math.round((m.sugar.amount / 50) * 100), "bg-pink-500")}
      ${macroRow("Saturated Fat", m.saturatedFat.amount, m.saturatedFat.dailyValue, "bg-red-500")}
    </div>

    <div class="mt-6 pt-6 border-t border-gray-100">
      <h3 class="text-sm font-semibold text-gray-900 mb-3">Other</h3>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Cholesterol</span>
          <span class="font-medium">${n.other.cholesterol}mg</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Sodium</span>
          <span class="font-medium">${n.other.sodium}mg</span>
        </div>
      </div>
    </div>`;
}

function youtubeId(url) {
  try {
    return new URL(url).searchParams.get("v") || url.split("v=")[1];
  } catch {
    return url.split("v=")[1];
  }
}

function mealDetailTemplate(meal, ingredients, steps) {
  const tags = meal.strTags
    ? meal.strTags.split(",").slice(0, 2)
        .map((t) => `<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">${t.trim()}</span>`)
        .join("")
    : "";

  return `
    <div class="max-w-6xl mx-auto">
      ${backButton()}

      <!-- Hero -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div class="relative h-80 md:h-96">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-full object-cover"/>
          <div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8">
            <div class="flex items-center gap-3 mb-3">
              ${meal.strCategory ? `<span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.strCategory}</span>` : ""}
              ${meal.strArea ? `<span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.strArea}</span>` : ""}
              ${tags}
            </div>
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${meal.strMeal}</h1>
            <div class="flex items-center gap-6 text-white/90">
              <span class="flex items-center gap-2"><i class="fa-solid fa-clock"></i><span>30 min</span></span>
              <span class="flex items-center gap-2"><i class="fa-solid fa-utensils"></i><span id="hero-servings">4 servings</span></span>
              <span class="flex items-center gap-2"><i class="fa-solid fa-fire"></i><span id="hero-calories">Calculating...</span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap gap-3 mb-8">
        <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed transition-all" data-meal-id="${meal.idMeal}" disabled title="Waiting for nutrition data...">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>Calculating...</span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: ingredients + instructions -->
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-list-check text-emerald-600"></i>
              Ingredients
              <span class="text-sm font-normal text-gray-500 ml-auto">${ingredients.length} items</span>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${ingredients.map((i) => `
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                  <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"/>
                  <span class="text-gray-700"><span class="font-medium text-gray-900">${i.measure}</span> ${i.ingredient}</span>
                </div>`).join("")}
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
              Instructions
            </h2>
            <div class="space-y-4">
              ${steps.map((s, idx) => `
                <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${idx + 1}</div>
                  <p class="text-gray-700 leading-relaxed pt-2">${s}</p>
                </div>`).join("")}
            </div>
          </div>

          ${meal.strYoutube ? `
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-video text-red-500"></i>
                Video Tutorial
              </h2>
              <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                <iframe src="https://www.youtube.com/embed/${youtubeId(meal.strYoutube)}"
                  class="absolute inset-0 w-full h-full" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen></iframe>
              </div>
            </div>` : ""}
        </div>

        <!-- Right: nutrition -->
        <div class="space-y-6">
          <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-chart-pie text-emerald-600"></i>
              Nutrition Facts
            </h2>
            <div id="nutrition-facts-container">${nutritionLoadingState()}</div>
          </div>

          ${meal.strSource ? `
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h3 class="text-sm font-semibold text-gray-900 mb-2">Recipe Source</h3>
              <a href="${meal.strSource}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-2">
                <i class="fa-solid fa-external-link"></i>
                View Original Recipe
              </a>
            </div>` : ""}
        </div>
      </div>
    </div>`;
}

function showLogMealModal(app, meal) {
  const n = store.getState().mealNutritionCache[meal.idMeal];
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
  modal.id = "log-meal-modal";
  modal.innerHTML = `
    <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
      <div class="flex items-center gap-4 mb-6">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-16 h-16 rounded-xl object-cover"/>
        <div>
          <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
          <p class="text-gray-500 text-sm">${meal.strMeal}</p>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Number of Servings</label>
        <div class="flex items-center gap-3">
          <button id="decrease-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <i class="fa-solid fa-minus text-gray-600"></i>
          </button>
          <input type="number" id="meal-servings" value="1" min="0.5" max="10" step="0.5"
            class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2"/>
          <button id="increase-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <i class="fa-solid fa-plus text-gray-600"></i>
          </button>
        </div>
      </div>

      ${n ? `
        <div class="bg-emerald-50 rounded-xl p-4 mb-6">
          <p class="text-sm text-gray-600 mb-2">Estimated nutrition per serving:</p>
          <div class="grid grid-cols-4 gap-2 text-center">
            <div><p class="text-lg font-bold text-emerald-600">${n.caloriesPerServing}</p><p class="text-xs text-gray-500">Calories</p></div>
            <div><p class="text-lg font-bold text-blue-600">${n.macros.protein.amount || 0}g</p><p class="text-xs text-gray-500">Protein</p></div>
            <div><p class="text-lg font-bold text-amber-600">${n.macros.carbs.amount || 0}g</p><p class="text-xs text-gray-500">Carbs</p></div>
            <div><p class="text-lg font-bold text-purple-600">${n.macros.fat.amount || 0}g</p><p class="text-xs text-gray-500">Fat</p></div>
          </div>
        </div>` : `
        <div class="bg-gray-50 rounded-xl p-4 mb-6">
          <p class="text-sm text-gray-500 text-center">Nutrition information not available for this meal</p>
        </div>`}

      <div class="flex gap-3">
        <button id="cancel-log-meal" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">Cancel</button>
        <button id="confirm-log-meal" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
          <i class="fa-solid fa-clipboard-list mr-2"></i>Log Meal
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const input = modal.querySelector("#meal-servings");
  modal.querySelector("#decrease-servings").addEventListener("click", () => {
    const v = parseFloat(input.value);
    if (v > 0.5) input.value = (v - 0.5).toFixed(1);
  });
  modal.querySelector("#increase-servings").addEventListener("click", () => {
    const v = parseFloat(input.value);
    if (v < 10) input.value = (v + 0.5).toFixed(1);
  });
  modal.querySelector("#cancel-log-meal").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
  modal.querySelector("#confirm-log-meal").addEventListener("click", () => {
    const servings = parseFloat(input.value) || 1;
    logMeal(meal, servings, n);
    modal.remove();
  });
}

function logMeal(meal, servings, n) {
  const nutrition = {
    calories: n ? Math.round(n.caloriesPerServing * servings) : 0,
    protein: n ? Math.round((n.macros.protein.amount || 0) * servings) : 0,
    carbs: n ? Math.round((n.macros.carbs.amount || 0) * servings) : 0,
    fat: n ? Math.round((n.macros.fat.amount || 0) * servings) : 0,
  };

  store.addLogEntry({
    type: "meal",
    name: meal.strMeal,
    mealId: meal.idMeal,
    category: meal.strCategory,
    thumbnail: meal.strMealThumb,
    servings,
    nutrition,
  });

  Swal.fire({
    title: "Meal Logged!",
    html: `<p class="text-gray-600">${meal.strMeal} (${servings} serving${servings !== 1 ? "s" : ""}) has been added to your daily log.</p>
           ${nutrition.calories > 0 ? `<p class="text-emerald-600 font-semibold mt-2">+${nutrition.calories} calories</p>` : ""}`,
    icon: "success",
    confirmButtonColor: "#10b981",
    timer: 2000,
    showConfirmButton: false,
  });
}
