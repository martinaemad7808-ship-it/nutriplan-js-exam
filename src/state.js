// App state + localStorage persistence
const STORAGE_KEYS = {
  DAILY_LOG: "nutriplan_daily_log",
  USER_SETTINGS: "nutriplan_user_settings",
};

const DEFAULT_SETTINGS = {
  calorieGoal: 2000,
  proteinGoal: 50,
  carbsGoal: 250,
  fatGoal: 65,
  waterGoal: 2000,
  waterGlassSize: 250,
  weight: 70,
  height: 170,
  age: 30,
  gender: "male",
  activityLevel: "moderate",
};

const state = {
  categories: [],
  areas: [],
  meals: [],
  selectedArea: null,
  selectedMealId: null,
  mealNutritionCache: {},
  searchedProducts: [],
  userSettings: { ...DEFAULT_SETTINGS },
  dailyLog: {},
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function initializeState() {
  state.userSettings = { ...DEFAULT_SETTINGS, ...load(STORAGE_KEYS.USER_SETTINGS, {}) };
  state.dailyLog = load(STORAGE_KEYS.DAILY_LOG, {});
  return state;
}

export function getState() {
  return state;
}

/** Merge changes into state; persist=true saves dailyLog/userSettings */
export function updateState(changes, persist = false) {
  Object.assign(state, changes);
  if (persist) {
    if (changes.dailyLog !== undefined) {
      localStorage.setItem(STORAGE_KEYS.DAILY_LOG, JSON.stringify(state.dailyLog));
    }
    if (changes.userSettings !== undefined) {
      localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(state.userSettings));
    }
  }
}

export function updateUserSettings(settings) {
  updateState({ userSettings: { ...state.userSettings, ...settings } }, true);
}

/** Local date as YYYY-MM-DD */
export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodayString() {
  return toDateKey(new Date());
}

export function emptyDay() {
  return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, meals: [] };
}

export function getTodayLog() {
  return state.dailyLog[getTodayString()] || emptyDay();
}

/** Adds an entry to today's log and updates the totals */
export function addLogEntry(entry) {
  const today = getTodayString();
  const log = state.dailyLog;
  if (!log[today]) log[today] = emptyDay();
  const day = log[today];
  const n = entry.nutrition || {};
  day.totalCalories += Math.round(n.calories || 0);
  day.totalProtein += Math.round(n.protein || 0);
  day.totalCarbs += Math.round(n.carbs || 0);
  day.totalFat += Math.round(n.fat || 0);
  day.meals.push({ ...entry, loggedAt: new Date().toISOString() });
  updateState({ dailyLog: log }, true);
}

export function removeLogEntry(index) {
  const today = getTodayString();
  const day = state.dailyLog[today];
  if (!day || !day.meals[index]) return;
  const n = day.meals[index].nutrition || {};
  day.totalCalories = Math.max(0, day.totalCalories - Math.round(n.calories || 0));
  day.totalProtein = Math.max(0, day.totalProtein - Math.round(n.protein || 0));
  day.totalCarbs = Math.max(0, day.totalCarbs - Math.round(n.carbs || 0));
  day.totalFat = Math.max(0, day.totalFat - Math.round(n.fat || 0));
  day.meals.splice(index, 1);
  updateState({ dailyLog: state.dailyLog }, true);
}

export function clearTodayLog() {
  state.dailyLog[getTodayString()] = emptyDay();
  updateState({ dailyLog: state.dailyLog }, true);
}
