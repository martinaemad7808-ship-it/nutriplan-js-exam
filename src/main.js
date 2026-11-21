import "./style.css";
import * as mealdb from "./api/mealdb.js";
import * as store from "./state.js";
import {
  createMealCard,
  createCategoryCard,
  createAreaFilters,
  createLoadingSpinner,
  createEmptyState,
} from "./components.js";
import { renderMealDetailPage } from "./pages/mealDetail.js";
import { renderProductsPage } from "./pages/products.js";
import { renderFoodLogPage } from "./pages/foodLog.js";
import { renderSettingsPage } from "./pages/settings.js";

// URL path -> page name
const ROUTES = {
  "": "meals",
  home: "meals",
  meals: "meals",
  products: "products",
  foodlog: "foodlog",
  settings: "settings",
};

// page name -> URL path
const PATHS = {
  meals: "/home",
  products: "/products",
  foodlog: "/foodlog",
  settings: "/settings",
};

const HEADERS = {
  meals: { title: "Meals & Recipes", subtitle: "Discover delicious and nutritious recipes tailored for you" },
  settings: { title: "Settings", subtitle: "Customize your goals and preferences" },
  products: { title: "Product Scanner", subtitle: "Search packaged foods by name or barcode" },
  foodlog: { title: "Food Log", subtitle: "Track your daily nutrition and food intake" },
  "meal-detail": { title: "Recipe Details", subtitle: "View full recipe information and nutrition facts" },
};

const MEALS_SECTIONS = ["search-filters-section", "meal-categories-section", "all-recipes-section"];
const DYNAMIC_SECTIONS = ["meal-detail-section", "products-section", "foodlog-section", "settings-section"];

class NutriPlanApp {
  constructor() {
    store.initializeState();
    this.viewMode = "grid";
    this.debounceTimer = null;
    this.init();
  }

  async init() {
    this.setupEventListeners();

    window.addEventListener("popstate", () => this.handleRoute());

    if (window.location.pathname === "/" || window.location.pathname === "") {
      window.history.replaceState({ page: "meals" }, "", "/home");
    }

    await this.loadInitialData();
    await this.handleRoute();
    this.hideLoadingOverlay();
  }

  // ===================== Routing =====================

  getPageFromURL() {
    const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
    if (path.startsWith("meal/")) {
      return { type: "meal-detail", slug: decodeURIComponent(path.slice(5)) };
    }
    return { type: ROUTES[path] || "meals", slug: null };
  }

  async handleRoute() {
    const page = this.getPageFromURL();
    if (page.type === "meal-detail") {
      await this.loadMealFromSlug(page.slug);
    } else {
      this.renderPage(page.type);
    }
  }

  slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async loadMealFromSlug(slug) {
    try {
      const results = await mealdb.searchMealsByName(slug.replace(/-/g, " "));
      if (results.length > 0) {
        const meal = results.find((m) => this.slugify(m.strMeal) === slug) || results[0];
        store.updateState({ selectedMealId: meal.idMeal });
        this.renderPage("meal-detail");
      } else {
        this.navigateTo("meals");
      }
    } catch (err) {
      console.error("Error loading meal from URL:", err);
      this.navigateTo("meals");
    }
  }

  navigateTo(page) {
    const path = PATHS[page] || "/home";
    if (window.location.pathname !== path) {
      window.history.pushState({ page }, "", path);
    }
    this.renderPage(page);
  }

  renderPage(page) {
    this.updateHeader(page);
    this.updateActiveNavLink(page === "meal-detail" ? "meals" : page);

    // hide everything, then show what this page needs
    this.toggleSections([...MEALS_SECTIONS, ...DYNAMIC_SECTIONS, "recipe-detail-modal"], false);

    switch (page) {
      case "meals":
        this.showMealsPage();
        break;
      case "meal-detail":
        renderMealDetailPage(this);
        break;
      case "products":
        renderProductsPage(this);
        break;
      case "foodlog":
        renderFoodLogPage(this);
        break;
      case "settings":
        renderSettingsPage(this);
        break;
    }
    window.scrollTo({ top: 0 });
  }

  toggleSections(ids, show) {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = show ? "" : "none";
    });
  }

  updateHeader(page) {
    const h = HEADERS[page];
    if (!h) return;
    document.querySelector("#header h1").textContent = h.title;
    document.querySelector("#header p").textContent = h.subtitle;
  }

  /** Works out the page from the nav link text ("Meals & Recipes", "Product Scanner", "Food Log") */
  pageFromNavLink(link) {
    const text = link.querySelector("span")?.textContent.toLowerCase() || "";
    if (text.includes("meals") || text.includes("recipes")) return "meals";
    if (text.includes("settings")) return "settings";
    if (text.includes("product") || text.includes("barcode") || text.includes("scan")) return "products";
    if (text.includes("log")) return "foodlog";
    return "meals";
  }

  updateActiveNavLink(page) {
    document.querySelectorAll("#sidebar nav a").forEach((link) => {
      const span = link.querySelector("span");
      const active = this.pageFromNavLink(link) === page;
      link.classList.toggle("bg-emerald-50", active);
      link.classList.toggle("text-emerald-700", active);
      link.classList.toggle("text-gray-600", !active);
      link.classList.toggle("hover:bg-gray-50", !active);
      span?.classList.toggle("font-semibold", active);
      span?.classList.toggle("font-medium", !active);
    });
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById("app-loading-overlay");
    if (!overlay) return;
    overlay.style.transition = "opacity 0.5s ease-out";
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 500);
  }

  // ===================== Events =====================

  setupEventListeners() {
    document.querySelectorAll("#sidebar nav a").forEach((link) => {
      const page = this.pageFromNavLink(link);
      link.setAttribute("href", PATHS[page]);
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.navigateTo(page);
      });
    });

    const searchInput = document.querySelector('#search-filters-section input[type="text"]');
    searchInput?.addEventListener("input", (e) => this.handleSearch(e));
    searchInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.performSearch(e.target.value.trim());
    });

    document.getElementById("grid-view-btn")?.addEventListener("click", () => this.setViewMode("grid"));
    document.getElementById("list-view-btn")?.addEventListener("click", () => this.setViewMode("list"));

    document.addEventListener("click", (e) => {
      const recipeCard = e.target.closest(".recipe-card");
      if (recipeCard) this.showMealDetail(recipeCard.dataset.mealId);

      const categoryCard = e.target.closest(".category-card");
      if (categoryCard) this.filterByCategory(categoryCard.dataset.category);

      const areaBtn = e.target.closest(".area-filter-btn");
      if (areaBtn) this.filterByArea(areaBtn.dataset.area);
    });
  }

  handleSearch(e) {
    const query = e.target.value.trim();
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (query.length >= 2) this.performSearch(query);
      else if (query.length === 0) this.loadAllRecipes();
    }, 300);
  }

  // ===================== Meals page =====================

  async loadInitialData() {
    try {
      const [categories, areas, meals] = await Promise.all([
        mealdb.getAllCategories(),
        mealdb.getAreaList(),
        mealdb.searchMealsByName("chicken"),
      ]);
      store.updateState({ categories, areas, meals });
    } catch (err) {
      console.error("Error loading initial data:", err);
    }
  }

  showMealsPage() {
    this.toggleSections(MEALS_SECTIONS, true);
    this.renderCategories();
    this.renderRecipeGrid(store.getState().meals);
    this.renderAreaFilters();
  }

  renderCategories() {
    const grid = document.querySelector("#meal-categories-section .grid");
    if (!grid) return;
    grid.className = "grid grid-cols-6 gap-3";
    grid.innerHTML = store.getState().categories.slice(0, 12).map(createCategoryCard).join("");
  }

  renderAreaFilters() {
    const container = document.querySelector("#search-filters-section .flex.items-center.gap-3");
    if (!container) return;
    const { areas, selectedArea } = store.getState();
    container.innerHTML = createAreaFilters(areas.slice(0, 10), selectedArea);
  }

  recipesGrid() {
    return document.querySelector("#all-recipes-section .grid");
  }

  setResultsText(text) {
    const el = document.querySelector("#all-recipes-section p.text-gray-600");
    if (el) el.textContent = text;
  }

  renderRecipeGrid(meals) {
    const grid = this.recipesGrid();
    if (!grid) return;
    if (!meals || meals.length === 0) {
      grid.innerHTML = createEmptyState("No recipes found. Try a different search term.");
      this.setResultsText("Showing 0 recipes");
      return;
    }
    grid.innerHTML = meals.map(createMealCard).join("");
    this.setResultsText(`Showing ${meals.length} recipes`);
    this.applyViewMode();
  }

  async performSearch(query) {
    if (!query) return this.loadAllRecipes();
    const grid = this.recipesGrid();
    if (grid) grid.innerHTML = createLoadingSpinner();
    const meals = await mealdb.searchMealsByName(query);
    store.updateState({ meals, searchQuery: query });
    this.renderRecipeGrid(meals);
    this.setResultsText(`Showing ${meals.length} recipes for "${query}"`);
  }

  async loadAllRecipes() {
    let meals = await mealdb.searchMealsByName("");
    if (meals.length === 0) meals = await mealdb.searchMealsByName("chicken");
    store.updateState({ meals });
    this.renderRecipeGrid(meals);
  }

  /** filter.php only returns id/name/thumb, so we look up full details for the first 20 */
  async fetchFullMeals(list) {
    const full = await Promise.all(list.slice(0, 20).map((m) => mealdb.getMealById(m.idMeal)));
    return full.filter(Boolean);
  }

  async filterByCategory(category) {
    store.updateState({ selectedCategory: category });
    const grid = this.recipesGrid();
    if (grid) grid.innerHTML = createLoadingSpinner();
    const meals = await this.fetchFullMeals(await mealdb.filterMealsByCategory(category));
    store.updateState({ meals });
    this.renderRecipeGrid(meals);
    this.setResultsText(`Showing ${meals.length} ${category} recipes`);
  }

  async filterByArea(area) {
    store.updateState({ selectedArea: area || null });
    document.querySelectorAll(".area-filter-btn").forEach((btn) => {
      const active = btn.dataset.area === area;
      btn.classList.toggle("bg-emerald-600", active);
      btn.classList.toggle("text-white", active);
      btn.classList.toggle("bg-gray-100", !active);
      btn.classList.toggle("text-gray-700", !active);
    });

    const grid = this.recipesGrid();
    if (grid) grid.innerHTML = createLoadingSpinner();

    const meals = area
      ? await this.fetchFullMeals(await mealdb.filterMealsByArea(area))
      : await mealdb.searchMealsByName("chicken");
    store.updateState({ meals });
    this.renderRecipeGrid(meals);
    this.setResultsText(area ? `Showing ${meals.length} ${area} recipes` : `Showing ${meals.length} recipes`);
  }

  setViewMode(mode) {
    this.viewMode = mode;
    const gridBtn = document.getElementById("grid-view-btn");
    const listBtn = document.getElementById("list-view-btn");
    const [on, off] = mode === "grid" ? [gridBtn, listBtn] : [listBtn, gridBtn];
    on.classList.add("bg-white", "shadow-sm");
    on.querySelector("i, svg")?.classList.replace("text-gray-500", "text-gray-700");
    off.classList.remove("bg-white", "shadow-sm");
    off.querySelector("i, svg")?.classList.replace("text-gray-700", "text-gray-500");
    this.applyViewMode();
  }

  applyViewMode() {
    const grid = this.recipesGrid();
    if (!grid) return;
    const list = this.viewMode === "list";
    grid.className = list ? "grid grid-cols-2 gap-4" : "grid grid-cols-4 gap-5";
    grid.querySelectorAll(".recipe-card").forEach((card) => {
      card.classList.toggle("flex", list);
      card.classList.toggle("flex-row", list);
      card.classList.toggle("h-40", list);
      const imgBox = card.querySelector(".relative");
      imgBox?.classList.toggle("w-48", list);
      imgBox?.classList.toggle("shrink-0", list);
      imgBox?.classList.toggle("h-full", list);
      imgBox?.classList.toggle("h-48", !list);
      card.querySelector(".relative > .absolute.bottom-3")?.classList.toggle("hidden", list);
    });
  }

  async showMealDetail(mealId) {
    store.updateState({ selectedMealId: mealId });
    const meal = store.getState().meals.find((m) => m.idMeal === mealId) || (await mealdb.getMealById(mealId));
    if (meal) {
      const path = `/meal/${this.slugify(meal.strMeal)}`;
      if (window.location.pathname !== path) {
        window.history.pushState({ page: "meal-detail", mealId }, "", path);
      }
    }
    this.renderPage("meal-detail");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.nutriPlanApp = new NutriPlanApp();
});
