// TheMealDB API — recipes, categories, areas
const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

async function getJSON(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  return res.json();
}

export async function searchMealsByName(name) {
  try {
    const data = await getJSON(`/search.php?s=${encodeURIComponent(name)}`);
    return data.meals || [];
  } catch (err) {
    console.error("Error searching meals by name:", err);
    return [];
  }
}

export async function filterMealsByCategory(category) {
  try {
    const data = await getJSON(`/filter.php?c=${encodeURIComponent(category)}`);
    return data.meals || [];
  } catch (err) {
    console.error("Error filtering meals by category:", err);
    return [];
  }
}

export async function filterMealsByArea(area) {
  try {
    const data = await getJSON(`/filter.php?a=${encodeURIComponent(area)}`);
    return data.meals || [];
  } catch (err) {
    console.error("Error filtering meals by area:", err);
    return [];
  }
}

export async function getAllCategories() {
  try {
    const data = await getJSON("/categories.php");
    return data.categories || [];
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}

export async function getAreaList() {
  try {
    const data = await getJSON("/list.php?a=list");
    return data.meals || [];
  } catch (err) {
    console.error("Error fetching area list:", err);
    return [];
  }
}

export async function getMealById(id) {
  try {
    const data = await getJSON(`/lookup.php?i=${id}`);
    return data.meals ? data.meals[0] : null;
  } catch (err) {
    console.error("Error fetching meal by ID:", err);
    return null;
  }
}

/** Turns strIngredient1..20 / strMeasure1..20 into [{ingredient, measure}] */
export function extractIngredients(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      list.push({ ingredient: ingredient.trim(), measure: measure ? measure.trim() : "" });
    }
  }
  return list;
}

/** Splits the instructions text into clean steps */
export function parseInstructions(text) {
  if (!text) return [];
  return text
    .split(/(?:\r\n|\r|\n)+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^\d+[.)]\s*/, ""))
    .filter((line) => {
      if (/^step\s*\d+\.?$/i.test(line) || /^\d+\.?$/.test(line)) return false;
      return line.length > 5;
    });
}
