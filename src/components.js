// Reusable HTML templates

export function createMealCard(meal) {
  return `
    <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${meal.idMeal}">
      <div class="relative h-48 overflow-hidden">
        <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
             src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" />
        <div class="absolute bottom-3 left-3 flex gap-2">
          ${meal.strCategory ? `
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
              <i class="fa-solid fa-tag text-emerald-600 mr-1"></i>${meal.strCategory}
            </span>` : ""}
          ${meal.strArea ? `
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
              <i class="fa-solid fa-globe text-blue-600 mr-1"></i>${meal.strArea}
            </span>` : ""}
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
          ${meal.strMeal}
        </h3>
        <p class="text-xs text-gray-600 mb-3 line-clamp-2">
          ${meal.strInstructions ? meal.strInstructions.substring(0, 100) + "..." : "Delicious recipe to try!"}
        </p>
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-gray-900">
            <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
            ${meal.strCategory || "Various"}
          </span>
          <span class="font-semibold text-gray-500">
            <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
            ${meal.strArea || "International"}
          </span>
        </div>
      </div>
    </div>
  `;
}

const CATEGORY_STYLES = {
  Beef: { bg: "from-red-50 to-rose-50", border: "border-red-200 hover:border-red-400", icon: "from-red-400 to-rose-500" },
  Chicken: { bg: "from-amber-50 to-orange-50", border: "border-amber-200 hover:border-amber-400", icon: "from-amber-400 to-orange-500" },
  Dessert: { bg: "from-pink-50 to-rose-50", border: "border-pink-200 hover:border-pink-400", icon: "from-pink-400 to-rose-500" },
  Lamb: { bg: "from-orange-50 to-amber-50", border: "border-orange-200 hover:border-orange-400", icon: "from-orange-400 to-amber-500" },
  Miscellaneous: { bg: "from-slate-50 to-gray-50", border: "border-slate-200 hover:border-slate-400", icon: "from-slate-400 to-gray-500" },
  Pasta: { bg: "from-yellow-50 to-amber-50", border: "border-yellow-200 hover:border-yellow-400", icon: "from-yellow-400 to-amber-500" },
  Pork: { bg: "from-rose-50 to-red-50", border: "border-rose-200 hover:border-rose-400", icon: "from-rose-400 to-red-500" },
  Seafood: { bg: "from-cyan-50 to-blue-50", border: "border-cyan-200 hover:border-cyan-400", icon: "from-cyan-400 to-blue-500" },
  Side: { bg: "from-green-50 to-emerald-50", border: "border-green-200 hover:border-green-400", icon: "from-green-400 to-emerald-500" },
  Starter: { bg: "from-teal-50 to-cyan-50", border: "border-teal-200 hover:border-teal-400", icon: "from-teal-400 to-cyan-500" },
  Vegan: { bg: "from-emerald-50 to-green-50", border: "border-emerald-200 hover:border-emerald-400", icon: "from-emerald-400 to-green-500" },
  Vegetarian: { bg: "from-lime-50 to-green-50", border: "border-lime-200 hover:border-lime-400", icon: "from-lime-400 to-green-500" },
  Breakfast: { bg: "from-amber-50 to-orange-50", border: "border-amber-200 hover:border-amber-400", icon: "from-amber-400 to-orange-500" },
  Goat: { bg: "from-stone-50 to-amber-50", border: "border-stone-200 hover:border-stone-400", icon: "from-stone-400 to-amber-500" },
};

const CATEGORY_ICONS = {
  Beef: "fa-drumstick-bite",
  Chicken: "fa-drumstick-bite",
  Dessert: "fa-cake-candles",
  Lamb: "fa-drumstick-bite",
  Pasta: "fa-bowl-food",
  Pork: "fa-bacon",
  Seafood: "fa-fish",
  Side: "fa-plate-wheat",
  Starter: "fa-utensils",
  Vegan: "fa-leaf",
  Vegetarian: "fa-seedling",
  Breakfast: "fa-mug-hot",
  Miscellaneous: "fa-bowl-rice",
  Goat: "fa-drumstick-bite",
};

export function createCategoryCard(category) {
  const style = CATEGORY_STYLES[category.strCategory] || CATEGORY_STYLES.Miscellaneous;
  const icon = CATEGORY_ICONS[category.strCategory] || "fa-utensils";
  return `
    <div class="category-card bg-linear-to-br ${style.bg} rounded-xl p-3 border ${style.border} hover:shadow-md cursor-pointer transition-all group" data-category="${category.strCategory}">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 bg-linear-to-br ${style.icon} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
          <i class="fa-solid ${icon} text-white text-sm"></i>
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-900">${category.strCategory}</h3>
        </div>
      </div>
    </div>
  `;
}

export function createAreaFilters(areas, selectedArea = null) {
  return `
    <button class="area-filter-btn px-4 py-2 ${selectedArea ? "bg-gray-100 text-gray-700" : "bg-emerald-600 text-white"} rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 hover:text-white transition-all" data-area="">
      All Cuisines
    </button>
    ${areas.map((a) => `
      <button class="area-filter-btn px-4 py-2 ${selectedArea === a.strArea ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"} rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all" data-area="${a.strArea}">
        ${a.strArea}
      </button>
    `).join("")}
  `;
}

export function createLoadingSpinner() {
  return `
    <div class="col-span-full flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  `;
}

export function createEmptyState(message, icon = "fa-search") {
  return `
    <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid ${icon} text-gray-400 text-2xl"></i>
      </div>
      <p class="text-gray-500 text-lg">${message}</p>
    </div>
  `;
}

const NUTRI_BG = { a: "bg-green-500", b: "bg-lime-500", c: "bg-yellow-500", d: "bg-orange-500", e: "bg-red-500" };
const NOVA_BG = { 1: "bg-green-500", 2: "bg-lime-500", 3: "bg-orange-500", 4: "bg-red-500" };

export function createProductCard(p) {
  const nutriBg = NUTRI_BG[p.nutritionGrade?.toLowerCase()] || "bg-gray-400";
  const novaBg = NOVA_BG[p.novaGroup] || "bg-gray-400";
  const placeholder = (hidden) =>
    `<div class="${hidden ? "hidden " : ""}w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center"><i class="fa-solid fa-box text-gray-400 text-2xl"></i></div>`;
  const fmt = (v) => (v || 0).toFixed(1);

  return `
    <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${p.barcode}">
      <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        ${p.image ? `
          <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
               src="${p.image}" alt="${p.name}" loading="lazy"
               onerror="this.nextElementSibling.classList.remove('hidden'); this.remove()" />
          ${placeholder(true)}
        ` : placeholder(false)}

        ${p.nutritionGrade ? `
          <div class="absolute top-2 left-2 ${nutriBg} text-white text-xs font-bold px-2 py-1 rounded uppercase">
            Nutri-Score ${p.nutritionGrade.toUpperCase()}
          </div>` : ""}

        ${p.novaGroup ? `
          <div class="absolute top-2 right-2 ${novaBg} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${p.novaGroup}">
            ${p.novaGroup}
          </div>` : ""}
      </div>

      <div class="p-4">
        <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${p.brand || "Unknown Brand"}</p>
        <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${p.name}</h3>

        <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
          ${p.quantity ? `<span><i class="fa-solid fa-weight-scale mr-1"></i>${p.quantity}</span>` : ""}
          ${p.nutrition?.calories ? `<span><i class="fa-solid fa-fire mr-1"></i>${Math.round(p.nutrition.calories)} kcal/100g</span>` : ""}
        </div>

        <div class="grid grid-cols-4 gap-1 text-center">
          <div class="bg-emerald-50 rounded p-1.5">
            <p class="text-xs font-bold text-emerald-700">${fmt(p.nutrition?.protein)}g</p>
            <p class="text-[10px] text-gray-500">Protein</p>
          </div>
          <div class="bg-blue-50 rounded p-1.5">
            <p class="text-xs font-bold text-blue-700">${fmt(p.nutrition?.carbs)}g</p>
            <p class="text-[10px] text-gray-500">Carbs</p>
          </div>
          <div class="bg-purple-50 rounded p-1.5">
            <p class="text-xs font-bold text-purple-700">${fmt(p.nutrition?.fat)}g</p>
            <p class="text-[10px] text-gray-500">Fat</p>
          </div>
          <div class="bg-orange-50 rounded p-1.5">
            <p class="text-xs font-bold text-orange-700">${fmt(p.nutrition?.sugar)}g</p>
            <p class="text-[10px] text-gray-500">Sugar</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function createProductDetailContent(p, nutri, nova) {
  const n = p.nutrition || {};
  const fmt = (v, d = 1) => (v || 0).toFixed(d);
  const bar = (value, max, color) =>
    `<div class="w-full bg-gray-200 rounded-full h-2 mb-2"><div class="${color} h-2 rounded-full" style="width: ${Math.min(((value || 0) / max) * 100, 100)}%"></div></div>`;

  return `
    <div class="p-6">
      <div class="flex items-start gap-6 mb-6">
        <div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
          ${p.image ? `<img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain"/>` : `<i class="fa-solid fa-box text-gray-400 text-4xl"></i>`}
        </div>
        <div class="flex-1">
          <p class="text-sm text-emerald-600 font-semibold mb-1">${p.brand || "Unknown Brand"}</p>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">${p.name}</h2>
          <p class="text-sm text-gray-500 mb-3">${p.quantity || ""}</p>
          <div class="flex items-center gap-3">
            ${p.nutritionGrade ? `
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${nutri.color}20">
                <span class="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style="background-color: ${nutri.color}">${p.nutritionGrade.toUpperCase()}</span>
                <div>
                  <p class="text-xs font-bold" style="color: ${nutri.color}">Nutri-Score</p>
                  <p class="text-[10px] text-gray-600">${nutri.label}</p>
                </div>
              </div>` : ""}
            ${p.novaGroup ? `
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${nova.color}20">
                <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${nova.color}">${p.novaGroup}</span>
                <div>
                  <p class="text-xs font-bold" style="color: ${nova.color}">NOVA</p>
                  <p class="text-[10px] text-gray-600">${nova.label}</p>
                </div>
              </div>` : ""}
          </div>
        </div>
        <button class="close-product-modal text-gray-400 hover:text-gray-600">
          <i class="fa-solid fa-times text-2xl"></i>
        </button>
      </div>

      <div class="bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
        <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-chart-pie text-emerald-600"></i>
          Nutrition Facts <span class="text-sm font-normal text-gray-500">(per 100g)</span>
        </h3>
        <div class="text-center mb-4 pb-4 border-b border-emerald-200">
          <p class="text-4xl font-bold text-gray-900">${Math.round(n.calories || 0)}</p>
          <p class="text-sm text-gray-500">Calories</p>
        </div>
        <div class="grid grid-cols-4 gap-4">
          <div class="text-center">${bar(n.protein, 50, "bg-emerald-500")}<p class="text-lg font-bold text-emerald-600">${fmt(n.protein)}g</p><p class="text-xs text-gray-500">Protein</p></div>
          <div class="text-center">${bar(n.carbs, 100, "bg-blue-500")}<p class="text-lg font-bold text-blue-600">${fmt(n.carbs)}g</p><p class="text-xs text-gray-500">Carbs</p></div>
          <div class="text-center">${bar(n.fat, 65, "bg-purple-500")}<p class="text-lg font-bold text-purple-600">${fmt(n.fat)}g</p><p class="text-xs text-gray-500">Fat</p></div>
          <div class="text-center">${bar(n.sugar, 50, "bg-orange-500")}<p class="text-lg font-bold text-orange-600">${fmt(n.sugar)}g</p><p class="text-xs text-gray-500">Sugar</p></div>
        </div>
        <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200">
          <div class="text-center"><p class="text-sm font-semibold text-gray-900">${fmt(n.saturatedFat)}g</p><p class="text-xs text-gray-500">Saturated Fat</p></div>
          <div class="text-center"><p class="text-sm font-semibold text-gray-900">${fmt(n.fiber)}g</p><p class="text-xs text-gray-500">Fiber</p></div>
          <div class="text-center"><p class="text-sm font-semibold text-gray-900">${fmt(n.salt, 2)}g</p><p class="text-xs text-gray-500">Salt</p></div>
        </div>
      </div>

      ${p.ingredients ? `
        <div class="bg-gray-50 rounded-xl p-5 mb-6">
          <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2"><i class="fa-solid fa-list text-gray-600"></i>Ingredients</h3>
          <p class="text-sm text-gray-600 leading-relaxed">${p.ingredients}</p>
        </div>` : ""}

      ${p.allergens ? `
        <div class="bg-red-50 rounded-xl p-5 mb-6 border border-red-200">
          <h3 class="font-bold text-red-700 mb-2 flex items-center gap-2"><i class="fa-solid fa-triangle-exclamation"></i>Allergens</h3>
          <p class="text-sm text-red-600">${p.allergens}</p>
        </div>` : ""}

      <div class="flex gap-3">
        <button class="add-product-to-log flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all" data-barcode="${p.barcode}">
          <i class="fa-solid fa-plus mr-2"></i>Log This Food
        </button>
        <button class="close-product-modal flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
          Close
        </button>
      </div>
    </div>
  `;
}

const PRODUCT_CATEGORY_GRADIENTS = {
  breakfast_cereals: "from-amber-500 to-orange-500",
  beverages: "from-blue-500 to-cyan-500",
  snacks: "from-purple-500 to-pink-500",
  dairy: "from-sky-400 to-blue-500",
  fruits: "from-red-500 to-rose-500",
  vegetables: "from-green-500 to-emerald-500",
  breads: "from-amber-600 to-yellow-500",
  meats: "from-red-600 to-rose-600",
  frozen_foods: "from-cyan-500 to-blue-600",
  sauces: "from-orange-500 to-red-500",
};

export function createProductCategoryButton(cat) {
  const gradient = PRODUCT_CATEGORY_GRADIENTS[cat.id] || "from-gray-500 to-gray-600";
  return `
    <button class="product-category-btn shrink-0 px-5 py-3 bg-linear-to-r ${gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all" data-category="${cat.id}">
      <i class="fa-solid ${cat.icon} mr-2"></i>${cat.name}
    </button>
  `;
}

export function showNotification(message, type = "info") {
  const colors = { success: "bg-emerald-500", error: "bg-red-500", info: "bg-blue-500", warning: "bg-amber-500" };
  const toast = document.createElement("div");
  toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 toast-notification`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
