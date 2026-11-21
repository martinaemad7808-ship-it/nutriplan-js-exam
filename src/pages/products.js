import * as productsApi from "../api/products.js";
import * as store from "../state.js";
import {
  createProductCard,
  createProductDetailContent,
  createProductCategoryButton,
  createLoadingSpinner,
  showNotification,
} from "../components.js";
import { getOrCreateSection } from "./utils.js";

export function renderProductsPage() {
  const section = getOrCreateSection("products-section", "px-8 py-8 bg-gray-50 min-h-screen");
  if (section.dataset.ready) return; // keep previous results when coming back
  section.dataset.ready = "1";

  section.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <!-- Search Header -->
      <div class="bg-linear-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-6 text-white">
        <h2 class="text-2xl font-bold mb-2">
          <i class="fa-solid fa-barcode mr-2"></i>
          Product Search & Barcode Scanner
        </h2>
        <p class="opacity-90 mb-4">Search for packaged food products to view nutrition information</p>

        <div class="flex gap-3">
          <div class="flex-1 relative">
            <input type="text" id="product-search-input"
              placeholder="Search by product name (e.g., Cheerios, Nutella, Coca-Cola...)"
              class="w-full px-5 py-3.5 pr-12 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"/>
            <i class="fa-solid fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <button id="search-product-btn" class="px-6 py-3.5 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-gray-100 transition-all">
            Search
          </button>
        </div>

        <div class="flex items-center gap-4 mt-4">
          <div class="flex-1 h-px bg-white/30"></div>
          <span class="text-sm opacity-80">or</span>
          <div class="flex-1 h-px bg-white/30"></div>
        </div>

        <div class="mt-4 flex gap-3">
          <div class="flex-1 relative">
            <input type="text" id="barcode-input"
              placeholder="Enter barcode number (e.g., 7613034626844)"
              class="w-full px-5 py-3.5 pr-12 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"/>
            <i class="fa-solid fa-barcode absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <button id="lookup-barcode-btn" class="px-6 py-3.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-all">
            <i class="fa-solid fa-search mr-2"></i>Lookup
          </button>
        </div>
      </div>

      <!-- Nutri-Score filter -->
      <div class="flex items-center gap-4 mb-6">
        <span class="text-sm font-medium text-gray-700">Filter by Nutri-Score:</span>
        <div class="flex gap-2">
          <button class="nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200" data-grade="">All</button>
          <button class="nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-green-100 text-green-700 hover:bg-green-200" data-grade="a">A</button>
          <button class="nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-lime-100 text-lime-700 hover:bg-lime-200" data-grade="b">B</button>
          <button class="nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-yellow-100 text-yellow-700 hover:bg-yellow-200" data-grade="c">C</button>
          <button class="nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-orange-100 text-orange-700 hover:bg-orange-200" data-grade="d">D</button>
          <button class="nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-red-100 text-red-700 hover:bg-red-200" data-grade="e">E</button>
        </div>
      </div>

      <!-- Categories -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Browse by Category</h3>
        <div class="flex gap-3 overflow-x-auto pb-2">
          ${productsApi.PRODUCT_CATEGORIES.map(createProductCategoryButton).join("")}
        </div>
      </div>

      <div class="flex items-center justify-between mb-4">
        <p id="products-count" class="text-sm text-gray-600">Search for products to see results</p>
      </div>

      <div class="grid grid-cols-4 gap-5" id="products-grid"></div>

      <div id="products-loading" class="hidden py-12">${createLoadingSpinner()}</div>

      <div id="products-empty" class="py-12">
        <div class="text-center">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-box-open text-gray-400 text-3xl"></i>
          </div>
          <p class="text-gray-500 text-lg mb-2">No products to display</p>
          <p class="text-gray-400 text-sm">Search for a product or browse by category</p>
        </div>
      </div>
    </div>
  `;

  setupListeners();
}

function setupListeners() {
  const searchInput = document.getElementById("product-search-input");
  const barcodeInput = document.getElementById("barcode-input");

  document.getElementById("search-product-btn").addEventListener("click", () => {
    const q = searchInput.value.trim();
    if (q) searchProducts(q);
  });
  searchInput.addEventListener("keypress", (e) => {
    const q = e.target.value.trim();
    if (e.key === "Enter" && q) searchProducts(q);
  });

  document.getElementById("lookup-barcode-btn").addEventListener("click", () => {
    const code = barcodeInput.value.trim();
    if (code) lookupBarcode(code);
  });
  barcodeInput.addEventListener("keypress", (e) => {
    const code = e.target.value.trim();
    if (e.key === "Enter" && code) lookupBarcode(code);
  });

  document.querySelectorAll(".nutri-score-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nutri-score-filter").forEach((b) => b.classList.remove("ring-2", "ring-gray-900"));
      btn.classList.add("ring-2", "ring-gray-900");
      const q = searchInput.value.trim();
      if (q) searchProducts(q, btn.dataset.grade);
    });
  });

  document.querySelectorAll(".product-category-btn").forEach((btn) => {
    btn.addEventListener("click", () => searchByCategory(btn.dataset.category));
  });

  document.getElementById("products-grid").addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (card) showProductDetail(card.dataset.barcode);
  });
}

function els() {
  return {
    grid: document.getElementById("products-grid"),
    loading: document.getElementById("products-loading"),
    empty: document.getElementById("products-empty"),
    count: document.getElementById("products-count"),
  };
}

function startLoading() {
  const e = els();
  e.loading.classList.remove("hidden");
  e.empty.classList.add("hidden");
  e.grid.innerHTML = "";
  return e;
}

async function searchProducts(query, grade = "") {
  const e = startLoading();
  try {
    const params = { searchTerms: query, pageSize: 24 };
    if (grade) params.nutritionGrade = grade;
    const result = await productsApi.searchProducts(params);
    e.loading.classList.add("hidden");
    if (result.products.length > 0) {
      e.grid.innerHTML = result.products.map(createProductCard).join("");
      e.count.textContent = `Found ${result.count} products for "${query}"`;
    } else {
      e.empty.classList.remove("hidden");
      e.count.textContent = `No products found for "${query}"`;
    }
    store.updateState({ searchedProducts: result.products });
  } catch (err) {
    console.error("Product search error:", err);
    e.loading.classList.add("hidden");
    e.empty.classList.remove("hidden");
    e.count.textContent = "Error searching products";
    showNotification("Failed to search products. Please try again.", "error");
  }
}

async function searchByCategory(category) {
  const e = startLoading();
  const label = category.replace(/_/g, " ");
  try {
    const result = await productsApi.getProductsByCategory(category);
    e.loading.classList.add("hidden");
    if (result.products.length > 0) {
      e.grid.innerHTML = result.products.map(createProductCard).join("");
      e.count.textContent = `Found ${result.count} products in ${label}`;
    } else {
      e.empty.classList.remove("hidden");
      e.count.textContent = `No products found in ${label}`;
    }
    store.updateState({ searchedProducts: result.products });
  } catch (err) {
    console.error("Category search error:", err);
    e.loading.classList.add("hidden");
    e.empty.classList.remove("hidden");
    showNotification("Failed to load category products.", "error");
  }
}

async function lookupBarcode(barcode) {
  const e = startLoading();
  try {
    const product = await productsApi.getProductByBarcode(barcode);
    e.loading.classList.add("hidden");
    if (product) {
      e.grid.innerHTML = createProductCard(product);
      e.count.textContent = `Found product: ${product.name}`;
      store.updateState({ searchedProducts: [product] });
      showProductDetail(barcode);
    } else {
      e.empty.classList.remove("hidden");
      e.count.textContent = `No product found with barcode: ${barcode}`;
      showNotification("Product not found in database", "error");
    }
  } catch (err) {
    console.error("Barcode lookup error:", err);
    e.loading.classList.add("hidden");
    e.empty.classList.remove("hidden");
    showNotification("Failed to lookup barcode.", "error");
  }
}

async function showProductDetail(barcode) {
  let product = store.getState().searchedProducts?.find((p) => p.barcode === barcode);
  if (!product) product = await productsApi.getProductByBarcode(barcode);
  if (!product) {
    showNotification("Product not found", "error");
    return;
  }

  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
  modal.id = "product-detail-modal";
  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      ${createProductDetailContent(product, productsApi.getNutriScoreInfo(product.nutritionGrade), productsApi.getNovaGroupInfo(product.novaGroup))}
    </div>`;
  document.body.appendChild(modal);

  modal.querySelectorAll(".close-product-modal").forEach((b) => b.addEventListener("click", () => modal.remove()));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
  modal.querySelector(".add-product-to-log").addEventListener("click", () => {
    logProduct(product);
    modal.remove();
  });
}

function logProduct(product) {
  store.addLogEntry({
    type: "product",
    name: product.name,
    brand: product.brand,
    barcode: product.barcode,
    serving: "100g",
    nutrition: {
      calories: Math.round(product.nutrition.calories || 0),
      protein: Math.round(product.nutrition.protein || 0),
      carbs: Math.round(product.nutrition.carbs || 0),
      fat: Math.round(product.nutrition.fat || 0),
    },
  });
  showNotification(`${product.name} logged to your daily intake! 📝`, "success");
}
