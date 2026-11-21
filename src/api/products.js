// Open Food Facts API — packaged products & barcodes
const BASE_URL = "https://world.openfoodfacts.org";

export async function searchProducts({ searchTerms, nutritionGrade, page = 1, pageSize = 24 } = {}) {
  try {
    const params = new URLSearchParams({
      page,
      page_size: pageSize,
      json: 1,
      ...(searchTerms && { search_terms: searchTerms }),
      ...(nutritionGrade && { nutrition_grades_tags: nutritionGrade }),
    });
    const res = await fetch(`${BASE_URL}/cgi/search.pl?${params}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return {
      count: data.count || 0,
      page: data.page || 1,
      products: (data.products || []).map(normalizeProduct),
    };
  } catch (err) {
    console.error("Error searching products:", err);
    return fallbackSearch({ searchTerms, nutritionGrade, page });
  }
}

export async function getProductByBarcode(barcode) {
  try {
    const res = await fetch(`${BASE_URL}/api/v0/product/${barcode}.json`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.status === 0 ? null : normalizeProduct(data.product);
  } catch (err) {
    console.error("Error fetching product by barcode:", err);
    return null;
  }
}

export async function getProductsByCategory(category, page = 1, pageSize = 24) {
  try {
    const res = await fetch(
      `${BASE_URL}/category/${encodeURIComponent(category)}.json?page=${page}&page_size=${pageSize}`
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return {
      count: data.count || 0,
      page: data.page || 1,
      products: (data.products || []).map(normalizeProduct),
    };
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return { count: 0, page: 1, products: [] };
  }
}

export const PRODUCT_CATEGORIES = [
  { id: "breakfast_cereals", name: "Breakfast Cereals", icon: "fa-wheat-awn" },
  { id: "beverages", name: "Beverages", icon: "fa-bottle-water" },
  { id: "snacks", name: "Snacks", icon: "fa-cookie" },
  { id: "dairy", name: "Dairy Products", icon: "fa-cheese" },
  { id: "fruits", name: "Fruits", icon: "fa-apple-whole" },
  { id: "vegetables", name: "Vegetables", icon: "fa-carrot" },
  { id: "breads", name: "Breads", icon: "fa-bread-slice" },
  { id: "meats", name: "Meats", icon: "fa-drumstick-bite" },
  { id: "frozen_foods", name: "Frozen Foods", icon: "fa-snowflake" },
  { id: "sauces", name: "Sauces & Condiments", icon: "fa-jar" },
];

function normalizeProduct(p) {
  const n = p.nutriments || {};
  return {
    barcode: p.code || p._id,
    name: p.product_name || p.product_name_en || "Unknown Product",
    brand: p.brands || "",
    image: p.image_front_url || p.image_url || null,
    nutritionGrade: p.nutrition_grades || p.nutrition_grade_fr || null,
    novaGroup: p.nova_group || null,
    ingredients: p.ingredients_text || p.ingredients_text_en || "",
    allergens: p.allergens || "",
    quantity: p.quantity || "",
    nutrition: {
      calories: n["energy-kcal_100g"] || n.energy_100g || 0,
      fat: n.fat_100g || 0,
      saturatedFat: n["saturated-fat_100g"] || 0,
      carbs: n.carbohydrates_100g || 0,
      sugar: n.sugars_100g || 0,
      fiber: n.fiber_100g || 0,
      protein: n.proteins_100g || 0,
      salt: n.salt_100g || 0,
      sodium: n.sodium_100g || 0,
    },
  };
}

export function getNutriScoreInfo(grade) {
  const map = {
    a: { label: "Excellent", color: "#038141" },
    b: { label: "Good", color: "#85bb2f" },
    c: { label: "Average", color: "#fecb02" },
    d: { label: "Poor", color: "#ee8100" },
    e: { label: "Bad", color: "#e63e11" },
  };
  return map[grade?.toLowerCase()] || { label: "Unknown", color: "#999" };
}

export function getNovaGroupInfo(group) {
  const map = {
    1: { label: "Unprocessed", color: "#038141" },
    2: { label: "Processed Ingredients", color: "#85bb2f" },
    3: { label: "Processed", color: "#ee8100" },
    4: { label: "Ultra-processed", color: "#e63e11" },
  };
  return map[group] || { label: "Unknown", color: "#999" };
}

// Offline sample data used when the API is unreachable
function fallbackSearch({ searchTerms, nutritionGrade, page }) {
  let items = [
    {
      code: "7613034626844", product_name: "Cheerios Original", brands: "Nestlé",
      image_front_url: "https://images.openfoodfacts.org/images/products/761/303/462/6844/front_en.jpg",
      nutrition_grades: "a", nova_group: 4,
      nutriments: { "energy-kcal_100g": 372, fat_100g: 4.2, "saturated-fat_100g": 0.8, carbohydrates_100g: 74, sugars_100g: 4.8, fiber_100g: 8.6, proteins_100g: 8.4, salt_100g: 1.1 },
    },
    {
      code: "5000159484695", product_name: "Nutella", brands: "Ferrero",
      image_front_url: "https://images.openfoodfacts.org/images/products/500/015/948/4695/front_en.jpg",
      nutrition_grades: "e", nova_group: 4,
      nutriments: { "energy-kcal_100g": 539, fat_100g: 30.9, "saturated-fat_100g": 10.6, carbohydrates_100g: 57.5, sugars_100g: 56.3, fiber_100g: 0, proteins_100g: 6.3, salt_100g: 0.107 },
    },
    {
      code: "8410076472458", product_name: "Greek Yogurt", brands: "Danone",
      nutrition_grades: "a", nova_group: 1,
      nutriments: { "energy-kcal_100g": 97, fat_100g: 5, "saturated-fat_100g": 3.3, carbohydrates_100g: 3.6, sugars_100g: 3.6, proteins_100g: 9, salt_100g: 0.1 },
    },
    {
      code: "5449000000996", product_name: "Coca-Cola Original", brands: "Coca-Cola",
      nutrition_grades: "e", nova_group: 4,
      nutriments: { "energy-kcal_100g": 42, fat_100g: 0, carbohydrates_100g: 10.6, sugars_100g: 10.6, proteins_100g: 0, salt_100g: 0 },
    },
  ];
  if (searchTerms) {
    const q = searchTerms.toLowerCase();
    items = items.filter((p) => p.product_name.toLowerCase().includes(q) || p.brands.toLowerCase().includes(q));
  }
  if (nutritionGrade) {
    items = items.filter((p) => p.nutrition_grades === nutritionGrade.toLowerCase());
  }
  return { count: items.length, page, products: items.map(normalizeProduct) };
}
