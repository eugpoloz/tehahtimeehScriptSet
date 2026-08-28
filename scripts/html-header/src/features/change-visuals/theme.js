import { handleError } from "@teh/utils";

const LOCAL_STORAGE_THEME_KEY = "userTheme";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";
const THEME_CONTROL_SELECTOR = 'input[type="radio"][name="theme-preference"]';

/** @typedef {"light" | "dark" | "system"} ThemePreference */
/** @typedef {"light" | "dark"} ResolvedTheme */
/** @typedef {{ preference: ThemePreference, label: string }} ThemeControl */

/** @type {ThemeControl[]} */
const THEME_CONTROLS = [
  {
    preference: "light",
    label: "Светлая"
  },
  {
    preference: "dark",
    label: "Темная"
  },
  {
    preference: "system",
    label: "Системная"
  }
];

/** @type {MediaQueryList | null} */
let systemThemeMediaQuery = null;
let systemThemeListenerConnected = false;

/** @param {unknown} value @returns {value is ThemePreference} */
const isThemePreference = (value) =>
  value === "light" || value === "dark" || value === "system";

/** @param {ThemeControl} control */
const themeControlMarkup = ({ preference, label }) => {
  const controlId = `theme-${preference}`;

  return `
    <div class="theme__control">
      <input class="theme__radio sr-only" type="radio" id="${controlId}" name="theme-preference" value="${preference}">
      <label class="theme__button" for="${controlId}">${label}</label>
    </div>`;
};

/** @returns {string} */
export const themeControlsMarkup = () => `
  <section class="theme" aria-labelledby="theme-controls-title">
    <h3 id="theme-controls-title">Тема</h3>
    <div class="theme__controls theme__group" id="theme-preference-controls" role="radiogroup" aria-labelledby="theme-controls-title" aria-orientation="horizontal">${THEME_CONTROLS.map(themeControlMarkup).join("")}
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
  const controls = document.querySelectorAll(THEME_CONTROL_SELECTOR);

  controls.forEach((control) => {
    if (!(control instanceof HTMLInputElement)) {
      return;
    }

    control.checked = control.value === preference;
  });
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

/** @param {Event} event */
const selectTheme = (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const control = target.closest(THEME_CONTROL_SELECTOR);
  if (!(control instanceof HTMLInputElement) || !control.checked) {
    return;
  }

  const preference = control.value;
  if (!isThemePreference(preference)) {
    return;
  }

  applyThemePreference(preference, true);
};

const followSystemTheme = () => {
  try {
    const preference = document.documentElement.dataset.themePreference;
    if (preference !== "system") {
      return;
    }

    document.documentElement.dataset.theme = getSystemTheme();
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
    const group = document.getElementById("theme-preference-controls");
    if (!group) {
      return;
    }

    group.addEventListener("change", selectTheme);

    const preference = document.documentElement.dataset.themePreference;
    synchronizeThemeControls(
      isThemePreference(preference) ? preference : "system"
    );
  } catch (e) {
    handleError("html-header/changeVisuals/theme", e);
  }
};
