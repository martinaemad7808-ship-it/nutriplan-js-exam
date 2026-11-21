import * as store from "../state.js";
import { showNotification } from "../components.js";
import { getOrCreateSection } from "./utils.js";

const ACTIVITY_LEVELS = {
  sedentary: "fa-couch",
  light: "fa-person-walking",
  moderate: "fa-person-running",
  active: "fa-person-biking",
  very_active: "fa-person-swimming",
};

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

function field(id, label, value) {
  return `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1" for="${id}">${label}</label>
      <input type="number" id="${id}" value="${value}" class="${inputClass}"/>
    </div>`;
}

function card(title, subtitle, body) {
  return `
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-lg font-bold text-gray-900 mb-1">${title}</h3>
      <p class="text-sm text-gray-500 mb-4">${subtitle}</p>
      ${body}
    </div>`;
}

export function renderSettingsPage() {
  const section = getOrCreateSection("settings-section", "px-8 py-8 bg-gray-50 min-h-screen");
  const s = store.getState().userSettings;

  section.innerHTML = `
    <div class="max-w-3xl mx-auto">
      <div class="space-y-6">
        ${card("Profile", "Your personal information", `
          <div class="grid grid-cols-2 gap-4">
            ${field("setting-age", "Age", s.age)}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="setting-gender">Gender</label>
              <select id="setting-gender" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                ${["male", "female", "other"].map((g) => `<option value="${g}" ${s.gender === g ? "selected" : ""}>${g[0].toUpperCase() + g.slice(1)}</option>`).join("")}
              </select>
            </div>
            ${field("setting-weight", "Weight (kg)", s.weight)}
            ${field("setting-height", "Height (cm)", s.height)}
          </div>`)}

        ${card("Nutrition Goals", "Set your daily nutrition targets", `
          <div class="grid grid-cols-2 gap-4">
            ${field("setting-calories", "Daily Calories", s.calorieGoal)}
            ${field("setting-protein", "Protein (g)", s.proteinGoal)}
            ${field("setting-carbs", "Carbs (g)", s.carbsGoal)}
            ${field("setting-fat", "Fat (g)", s.fatGoal)}
          </div>`)}

        ${card("Hydration", "Set your water intake goals", `
          <div class="grid grid-cols-2 gap-4">
            ${field("setting-water", "Daily Water Goal (ml)", s.waterGoal)}
            ${field("setting-glass", "Glass Size (ml)", s.waterGlassSize)}
          </div>`)}

        ${card("Activity Level", "How active are you on a typical day?", `
          <div class="grid grid-cols-5 gap-3" id="activity-level-selector">
            ${Object.entries(ACTIVITY_LEVELS).map(([level, icon]) => `
              <button class="activity-level-btn px-4 py-3 rounded-xl text-center transition-all ${s.activityLevel === level ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}" data-level="${level}">
                <i class="fa-solid ${icon} text-lg mb-1"></i>
                <p class="text-xs font-medium capitalize">${level.replace("_", " ")}</p>
              </button>`).join("")}
          </div>`)}

        <button id="save-settings-btn" class="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
          <i class="fa-solid fa-check"></i>
          Save Settings
        </button>

        <div class="bg-red-50 rounded-2xl p-6 border border-red-200">
          <h3 class="text-lg font-bold text-red-700 mb-1">Danger Zone</h3>
          <p class="text-sm text-red-600 mb-4">These actions cannot be undone</p>
          <button id="reset-data-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  `;

  const buttons = section.querySelectorAll(".activity-level-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.remove("bg-emerald-600", "text-white");
        b.classList.add("bg-gray-100", "text-gray-700");
      });
      btn.classList.add("bg-emerald-600", "text-white");
      btn.classList.remove("bg-gray-100", "text-gray-700");
    });
  });

  const num = (id, fallback) => parseInt(document.getElementById(id)?.value) || fallback;

  section.querySelector("#save-settings-btn").addEventListener("click", () => {
    store.updateUserSettings({
      age: num("setting-age", 30),
      gender: document.getElementById("setting-gender").value || "male",
      weight: num("setting-weight", 70),
      height: num("setting-height", 170),
      calorieGoal: num("setting-calories", 2000),
      proteinGoal: num("setting-protein", 50),
      carbsGoal: num("setting-carbs", 250),
      fatGoal: num("setting-fat", 65),
      waterGoal: num("setting-water", 2000),
      waterGlassSize: num("setting-glass", 250),
      activityLevel: section.querySelector(".activity-level-btn.bg-emerald-600")?.dataset.level || "moderate",
    });
    showNotification("Settings saved successfully!", "success");
  });

  section.querySelector("#reset-data-btn").addEventListener("click", () => {
    Swal.fire({
      title: "Reset all data?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, reset",
    }).then((r) => {
      if (r.isConfirmed) {
        localStorage.clear();
        window.location.reload();
      }
    });
  });
}
