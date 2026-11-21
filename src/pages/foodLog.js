import * as store from "../state.js";
import { showNotification } from "../components.js";
import { getOrCreateSection } from "./utils.js";

// Tailwind needs full class names, so colors are spelled out here
const COLORS = {
  emerald: { text: "text-emerald-600", bar: "bg-emerald-500" },
  blue: { text: "text-blue-600", bar: "bg-blue-500" },
  amber: { text: "text-amber-600", bar: "bg-amber-500" },
  purple: { text: "text-purple-600", bar: "bg-purple-500" },
};

export function renderFoodLogPage(app) {
  const section = getOrCreateSection("foodlog-section", "px-8 py-8 bg-gray-50 min-h-screen");
  const today = store.getTodayLog();
  const week = getWeeklyLogData();
  const s = store.getState().userSettings;
  const goals = { calories: s.calorieGoal, protein: s.proteinGoal, carbs: s.carbsGoal, fat: s.fatGoal };
  const weekTotal = week.reduce((sum, d) => sum + d.calories, 0);
  const meals = today.meals || [];

  section.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold mb-2">
              <i class="fa-solid fa-clipboard-list mr-2"></i>
              Daily Food Log
            </h2>
            <p class="opacity-90">Track and monitor your daily nutrition intake</p>
          </div>
          <div class="text-right">
            <p class="text-sm opacity-80">Today</p>
            <p class="text-xl font-bold">${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
          </div>
        </div>
      </div>

      <!-- Today -->
      <div id="foodlog-today-section" class="bg-white rounded-2xl p-6 mb-6 border-2 border-gray-200">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          <i class="fa-solid fa-fire text-orange-500 mr-2"></i>
          Today's Nutrition
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          ${progress("Calories", today.totalCalories, goals.calories, "kcal", "emerald")}
          ${progress("Protein", today.totalProtein, goals.protein, "g", "blue")}
          ${progress("Carbs", today.totalCarbs, goals.carbs, "g", "amber")}
          ${progress("Fat", today.totalFat, goals.fat, "g", "purple")}
        </div>

        <div class="border-t border-gray-200 pt-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-700">Logged Items (${meals.length})</h4>
            ${meals.length > 0 ? `
              <button id="clear-foodlog" class="text-red-500 hover:text-red-600 text-sm font-medium">
                <i class="fa-solid fa-trash mr-1"></i>Clear All
              </button>` : ""}
          </div>
          ${loggedItems(meals)}
        </div>
      </div>

      <!-- Weekly -->
      <div class="bg-white rounded-2xl p-6 mb-6 border-2 border-gray-200">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          <i class="fa-solid fa-calendar-week text-indigo-500 mr-2"></i>
          Weekly Overview
        </h3>
        <div class="grid grid-cols-7 gap-2">
          ${week.map((d) => `
            <div class="text-center ${d.isToday ? "bg-indigo-100 rounded-xl" : ""}">
              <p class="text-xs text-gray-500 mb-1">${d.dayName}</p>
              <p class="text-sm font-medium text-gray-900">${d.date}</p>
              <div class="mt-2 ${d.calories > 0 ? "text-emerald-600" : "text-gray-300"}">
                <p class="text-lg font-bold">${d.calories}</p>
                <p class="text-xs">kcal</p>
              </div>
              ${d.itemCount > 0 ? `<p class="text-xs text-gray-400 mt-1">${d.itemCount} items</p>` : ""}
            </div>`).join("")}
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        ${stat("fa-chart-line", "bg-emerald-100", "text-emerald-600", "Weekly Average", `${weekTotal > 0 ? Math.round(weekTotal / 7) : 0} kcal`)}
        ${stat("fa-utensils", "bg-blue-100", "text-blue-600", "Total Items This Week", `${week.reduce((sum, d) => sum + d.itemCount, 0)} items`)}
        ${stat("fa-bullseye", "bg-purple-100", "text-purple-600", "Days On Goal",
          `${week.filter((d) => d.calories > 0 && d.calories >= goals.calories * 0.8 && d.calories <= goals.calories * 1.2).length} / 7`)}
      </div>
    </div>
  `;

  // Listeners
  section.querySelector("#clear-foodlog")?.addEventListener("click", () => {
    Swal.fire({
      title: "Clear Today's Log?",
      text: "This will remove all logged food items for today.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, clear it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (!result.isConfirmed) return;
      store.clearTodayLog();
      renderFoodLogPage(app);
      Swal.fire({ title: "Cleared!", text: "Your food log has been cleared.", icon: "success", timer: 1500, showConfirmButton: false });
    });
  });

  section.querySelectorAll(".remove-foodlog-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      store.removeLogEntry(parseInt(btn.dataset.index));
      showNotification("Item removed from log", "info");
      renderFoodLogPage(app);
    });
  });

  section.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      app.navigateTo(link.dataset.nav);
    });
  });
}

function progress(label, value, goal, unit, color) {
  const pct = Math.min(Math.round((value / goal) * 100), 100);
  const over = value > goal;
  const c = COLORS[color];
  return `
    <div class="bg-gray-50 rounded-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">${label}</span>
        <span class="text-xs ${over ? "text-red-500" : c.text}">${pct}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div class="h-2.5 rounded-full ${over ? "bg-red-500" : c.bar}" style="width: ${pct}%"></div>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="font-bold ${over ? "text-red-600" : c.text}">${value} ${unit}</span>
        <span class="text-gray-400">/ ${goal} ${unit}</span>
      </div>
    </div>`;
}

function stat(icon, bg, color, label, value) {
  return `
    <div class="bg-white rounded-xl p-4 border-2 border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 ${bg} rounded-xl flex items-center justify-center">
          <i class="fa-solid ${icon} ${color} text-xl"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500">${label}</p>
          <p class="text-xl font-bold text-gray-900">${value}</p>
        </div>
      </div>
    </div>`;
}

function loggedItems(items) {
  if (items.length === 0) {
    return `
      <div class="text-center py-12">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-utensils text-gray-300 text-3xl"></i>
        </div>
        <p class="text-gray-500 font-medium mb-2">No food logged today</p>
        <p class="text-gray-400 text-sm mb-4">Start tracking your nutrition by logging meals or scanning products</p>
        <div class="flex justify-center gap-3">
          <a href="/home" data-nav="meals" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all">
            <i class="fa-solid fa-plus"></i>
            Browse Recipes
          </a>
          <a href="/products" data-nav="products" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
            <i class="fa-solid fa-barcode"></i>
            Scan Product
          </a>
        </div>
      </div>`;
  }

  return `
    <div class="space-y-3 max-h-96 overflow-y-auto">
      ${items.map((item, i) => {
        const isProduct = item.type === "product";
        const n = item.nutrition || {};
        return `
          <div class="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all">
            <div class="flex items-center gap-4">
              ${item.type === "meal" && item.thumbnail
                ? `<img src="${item.thumbnail}" alt="${item.name}" class="w-14 h-14 rounded-xl object-cover"/>`
                : `<div class="w-14 h-14 ${isProduct ? "bg-blue-100" : "bg-emerald-100"} rounded-xl flex items-center justify-center">
                     <i class="fa-solid fa-${isProduct ? "box" : "utensils"} ${isProduct ? "text-blue-600" : "text-emerald-600"} text-xl"></i>
                   </div>`}
              <div>
                <p class="font-semibold text-gray-900">${item.name}</p>
                <p class="text-sm text-gray-500">
                  ${item.type === "meal" ? `${item.servings} serving${item.servings !== 1 ? "s" : ""}` : item.brand || item.serving || "Product"}
                  <span class="mx-1">•</span>
                  <span class="${isProduct ? "text-blue-600" : "text-emerald-600"}">${isProduct ? "Product" : "Recipe"}</span>
                </p>
                <p class="text-xs text-gray-400 mt-1">${new Date(item.loggedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-lg font-bold text-emerald-600">${n.calories || 0}</p>
                <p class="text-xs text-gray-500">kcal</p>
              </div>
              <div class="hidden md:flex gap-2 text-xs text-gray-500">
                <span class="px-2 py-1 bg-blue-50 rounded">${n.protein || 0}g P</span>
                <span class="px-2 py-1 bg-amber-50 rounded">${n.carbs || 0}g C</span>
                <span class="px-2 py-1 bg-purple-50 rounded">${n.fat || 0}g F</span>
              </div>
              <button class="remove-foodlog-item text-gray-400 hover:text-red-500 transition-all p-2" data-index="${i}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>`;
      }).join("")}
    </div>`;
}

function getWeeklyLogData() {
  const log = store.getState().dailyLog;
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = log[store.toDateKey(d)] || { totalCalories: 0, meals: [] };
    days.push({
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      calories: day.totalCalories || 0,
      itemCount: day.meals?.length || 0,
      isToday: i === 0,
    });
  }
  return days;
}
