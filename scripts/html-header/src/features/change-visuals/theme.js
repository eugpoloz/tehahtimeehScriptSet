import { handleError } from "@teh/utils";
import { spinToggleMarkup } from "./spin-toggle";

const LOCAL_STORAGE_THEME_KEY = "userTheme";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";
const THEME_TOGGLE_ID = "theme-light-dark-toggle";
const SYSTEM_THEME_CONTROL_ID = "theme-system";

/** @typedef {"light" | "dark" | "system"} ThemePreference */
/** @typedef {"light" | "dark"} ResolvedTheme */

/** @type {MediaQueryList | null} */
let systemThemeMediaQuery = null;
let systemThemeListenerConnected = false;

/** @param {unknown} value @returns {value is ThemePreference} */
const isThemePreference = (value) =>
  value === "light" || value === "dark" || value === "system";

/** @param {unknown} value @returns {value is ResolvedTheme} */
const isResolvedTheme = (value) => value === "light" || value === "dark";

/** @returns {string} */
export const themeControlsMarkup = () => `
  <section class="theme" aria-labelledby="theme-controls-title">
    <h3 id="theme-controls-title">Тема</h3>
    <div class="theme__controls theme__group" id="theme-preference-controls" role="group" aria-labelledby="theme-controls-title">
      <div class="theme__control">
        ${spinToggleMarkup(THEME_TOGGLE_ID)}
      </div>
      <div class="theme__control">
        <label class="theme__system-control" for="${SYSTEM_THEME_CONTROL_ID}">
          <input type="checkbox" id="${SYSTEM_THEME_CONTROL_ID}">
          <span>Cистемная</span>
        </label>
      </div>
    </div>
  </section>`;

/** @returns {MediaQueryList} */
const getSystemThemeMediaQuery = () => {
  systemThemeMediaQuery ??= window.matchMedia(SYSTEM_THEME_QUERY);

  return systemThemeMediaQuery;
};

/** @returns {ResolvedTheme} */
const getSystemTheme = () =>
  getSystemThemeMediaQuery().matches ? "dark" : "light";

/** @param {ThemePreference} preference @returns {ResolvedTheme} */
const resolveTheme = (preference) => {
  if (preference === "system") {
    return getSystemTheme();
  }

  return preference;
};

/** @returns {ThemePreference} */
const getStoredThemePreference = () => {
  try {
    const preference = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);

    return isThemePreference(preference) ? preference : "system";
  } catch (e) {
    handleError("html-header/changeVisuals/theme/storage", e);

    return "system";
  }
};

/** @param {ThemePreference} preference */
const storeThemePreference = (preference) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, preference);
  } catch (e) {
    handleError("html-header/changeVisuals/theme/storage", e);
  }
};

/** @param {ThemePreference} preference */
const synchronizeThemeControls = (preference) => {
  const themeToggle = document.getElementById(THEME_TOGGLE_ID);
  const systemThemeControl = document.getElementById(SYSTEM_THEME_CONTROL_ID);
  const currentTheme = document.documentElement.dataset.theme;
  let resolvedTheme = resolveTheme(preference);
  if (isResolvedTheme(currentTheme)) {
    resolvedTheme = currentTheme;
  }

  if (themeToggle instanceof HTMLButtonElement) {
    const usesSystemTheme = preference === "system";
    const usesDarkTheme = resolvedTheme === "dark";
    const themeName = usesDarkTheme ? "тёмная" : "светлая";
    let label = "Включить тёмную тему";
    if (usesSystemTheme) {
      label = `Системная тема: ${themeName}`;
    } else if (usesDarkTheme) {
      label = "Включить светлую тему";
    }

    themeToggle.disabled = usesSystemTheme;
    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("aria-pressed", String(usesDarkTheme));
    themeToggle.title = label;
  }

  if (systemThemeControl instanceof HTMLInputElement) {
    systemThemeControl.checked = preference === "system";
  }
};

/**
 * @param {ThemePreference} preference
 * @param {boolean} persist
 */
const applyThemePreference = (preference, persist) => {
  const root = document.documentElement;

  root.dataset.themePreference = preference;
  root.dataset.theme = resolveTheme(preference);
  synchronizeThemeControls(preference);

  if (persist) {
    storeThemePreference(preference);
  }
};

const toggleTheme = () => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  applyThemePreference(nextTheme, true);
};

const selectSystemTheme = () => {
  const systemThemeControl = document.getElementById(SYSTEM_THEME_CONTROL_ID);
  if (!(systemThemeControl instanceof HTMLInputElement)) {
    return;
  }

  if (systemThemeControl.checked) {
    applyThemePreference("system", true);

    return;
  }

  const currentTheme = document.documentElement.dataset.theme;
  let preference = getSystemTheme();
  if (isResolvedTheme(currentTheme)) {
    preference = currentTheme;
  }

  applyThemePreference(preference, true);
};

const followSystemTheme = () => {
  try {
    const preference = document.documentElement.dataset.themePreference;
    if (preference !== "system") {
      return;
    }

    applyThemePreference("system", false);
  } catch (e) {
    handleError("html-header/changeVisuals/theme", e);
  }
};

/** Restores the saved theme and follows changes to the system theme. */
export const restoreTheme = () => {
  try {
    applyThemePreference(getStoredThemePreference(), false);

    if (!systemThemeListenerConnected) {
      getSystemThemeMediaQuery().addEventListener("change", followSystemTheme);
      systemThemeListenerConnected = true;
    }
  } catch (e) {
    handleError("html-header/changeVisuals/theme", e);
  }
};

/** Connects and synchronizes the theme controls. */
export const initializeThemeControls = () => {
  try {
    const themeToggle = document.getElementById(THEME_TOGGLE_ID);
    const systemThemeControl = document.getElementById(SYSTEM_THEME_CONTROL_ID);
    if (
      !(themeToggle instanceof HTMLButtonElement) ||
      !(systemThemeControl instanceof HTMLInputElement)
    ) {
      return;
    }

    themeToggle.addEventListener("click", toggleTheme);
    systemThemeControl.addEventListener("change", selectSystemTheme);

    const preference = document.documentElement.dataset.themePreference;
    synchronizeThemeControls(
      isThemePreference(preference) ? preference : "system"
    );
  } catch (e) {
    handleError("html-header/changeVisuals/theme", e);
  }
};
