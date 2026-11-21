// NutriPlan API — recipe nutrition analysis
const BASE_URL = "https://nutriplan-api.vercel.app/api";
const API_KEY = import.meta.env.VITE_NUTRIPLAN_API_KEY || "";

const cache = new Map();

/**
 * Sends the recipe ingredients to the API and returns nutrition data.
 * Falls back to rough estimates if the request fails.
 */
export async function analyzeRecipe(recipeName, ingredients) {
  const key = `recipe_${recipeName}_${ingredients.join("|")}`;
  if (cache.has(key)) return cache.get(key);

  try {
    const res = await fetch(`${BASE_URL}/nutrition/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
      body: JSON.stringify({ recipeName, ingredients }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("❌ Nutrition API error:", err);
      throw new Error(err.error?.message || `API error: ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      console.error("❌ API returned failure:", json);
      throw new Error(json.error?.message || json.error || "Analysis failed");
    }

    const data = json.data;
    const result = {
      yield: data.servings,
      calories: data.totals.calories,
      totals: data.totals,
      perServing: data.perServing,
      dietLabels: [],
      healthLabels: [],
    };
    cache.set(key, result);
    return result;
  } catch (err) {
    console.error("❌ Error analyzing recipe:", err);
    return fallbackNutrition(ingredients);
  }
}

function fallbackNutrition(ingredients) {
  console.warn("⚠️ Using fallback nutrition data");
  const calories = ingredients.length * 100;
  return {
    yield: 4,
    calories,
    totals: { calories, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, saturatedFat: 0, cholesterol: 0, sodium: 0 },
    perServing: null,
    dietLabels: [],
    healthLabels: [],
  };
}

/** Converts API data into the per-serving shape the UI uses */
export function formatNutritionForDisplay(n) {
  if (!n) return null;
  const servings = n.yield || 4;
  const p = n.perServing || divide(n.totals, servings);
  const dv = (value, daily) => Math.round((value / daily) * 100);

  return {
    servings,
    caloriesPerServing: Math.round(p.calories),
    totalCalories: Math.round(n.totals?.calories ?? n.calories ?? 0),
    macros: {
      protein: { amount: p.protein, dailyValue: dv(p.protein, 50) },
      carbs: { amount: p.carbs, dailyValue: dv(p.carbs, 300) },
      fat: { amount: p.fat, dailyValue: dv(p.fat, 65) },
      fiber: { amount: p.fiber, dailyValue: dv(p.fiber, 25) },
      sugar: { amount: p.sugar, dailyValue: 0 },
      saturatedFat: { amount: p.saturatedFat, dailyValue: dv(p.saturatedFat, 20) },
    },
    other: { cholesterol: p.cholesterol, sodium: p.sodium },
    dietLabels: n.dietLabels || [],
    healthLabels: n.healthLabels || [],
  };
}

function divide(totals = {}, by) {
  const out = {};
  for (const k of ["calories", "protein", "carbs", "fat", "fiber", "sugar", "saturatedFat", "cholesterol", "sodium"]) {
    out[k] = Math.round((totals[k] || 0) / by);
  }
  return out;
}
