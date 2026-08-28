import { handleError } from "@teh/utils";

const LOCAL_STORAGE_SIZE_KEY = "userFontSize";
const CSS_VARIABLE_SIZE_KEY = "--dynamic-font-size";
const CSS_VARIABLE_MIN_SIZE_KEY = "--dynamic-font-size-min";
const CSS_VARIABLE_MAX_SIZE_KEY = "--dynamic-font-size-max";

/** @typedef {{ pun: HTMLElement, minFontSize: number, maxFontSize: number }} FontSizeContext */
/** @typedef {{ id: string, icon: string, label: string }} FontSizeControl */

/** @type {FontSizeControl[]} */
const FONT_SIZE_CONTROLS = [
  {
    id: "text-increase",
    icon: "text_increase",
    label: "Увеличить шрифт"
  },
  {
    id: "text-decrease",
    icon: "text_decrease",
    label: "Уменьшить шрифт"
  },
  {
    id: "text-clear",
    icon: "format_clear",
    label: "Скинуть размер шрифта"
  }
];

/** @param {FontSizeControl} control */
const fontSizeControlMarkup = ({ id, icon, label }) => {
  const tooltipId = `${id}-tooltip`;

  return `
    <div class="theme__control">
      <button type="button" id="${id}" interestfor="${tooltipId}" popovertarget="${tooltipId}" aria-labelledby="${tooltipId}">
        <i class="material-symbols-sharp">${icon}</i>
      </button>
      <span class="tooltip" id="${tooltipId}" popover="hint" role="tooltip">${label}</span>
    </div>`;
};

/** @returns {string} */
export const fontSizeControlsMarkup = () => `
  <section class="theme">
    <h3>Размер шрифта</h3>
    <div class="theme__controls">${FONT_SIZE_CONTROLS.map(fontSizeControlMarkup).join("")}
    </div>
  </section>`;

/**
 * Converts a CSS length in pixels or rems to pixels.
 *
 * @param {string} value
 * @returns {number}
 */
const cssLengthToPixels = (value) => {
  const normalizedValue = value.trim();
  const numericValue = Number.parseFloat(normalizedValue);

  if (!Number.isFinite(numericValue)) {
    return Number.NaN;
  }

  if (normalizedValue.endsWith("px")) {
    return numericValue;
  }

  if (normalizedValue.endsWith("rem")) {
    const rootFontSize = Number.parseFloat(
      window.getComputedStyle(document.documentElement).fontSize
    );

    return numericValue * rootFontSize;
  }

  return Number.NaN;
};

/** @returns {FontSizeContext | null} */
const getFontSizeContext = () => {
  const pun = document.getElementById("pun");

  if (!pun) {
    return null;
  }

  const computedPunStyle = window.getComputedStyle(pun);
  const minFontSize = cssLengthToPixels(
    computedPunStyle.getPropertyValue(CSS_VARIABLE_MIN_SIZE_KEY)
  );
  const maxFontSize = cssLengthToPixels(
    computedPunStyle.getPropertyValue(CSS_VARIABLE_MAX_SIZE_KEY)
  );

  if (
    !Number.isFinite(minFontSize) ||
    !Number.isFinite(maxFontSize) ||
    minFontSize > maxFontSize
  ) {
    throw new Error("Invalid dynamic font-size limits");
  }

  return { pun, minFontSize, maxFontSize };
};

/** @returns {number | null} */
const getComputedFontSizeFromPost = () => {
  const postContent = document.querySelector(".post-content");
  if (!postContent) {
    return null;
  }

  return Number.parseFloat(window.getComputedStyle(postContent).fontSize);
};

/** @returns {number | null} */
const getStoredFontSize = () => {
  try {
    const value = localStorage.getItem(LOCAL_STORAGE_SIZE_KEY);

    return value === null ? null : Number(value);
  } catch (e) {
    handleError("html-header/changeVisuals/fontSize/storage", e);

    return null;
  }
};

/** @param {number} size */
const storeFontSize = (size) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_SIZE_KEY, String(size));
  } catch (e) {
    handleError("html-header/changeVisuals/fontSize/storage", e);
  }
};

const removeStoredFontSize = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_SIZE_KEY);
  } catch (e) {
    handleError("html-header/changeVisuals/fontSize/storage", e);
  }
};

/**
 * @param {HTMLElement} pun
 * @param {number} size
 */
const setDynamicFontSize = (pun, size) => {
  pun.style.setProperty(CSS_VARIABLE_SIZE_KEY, `${size}px`);
  storeFontSize(size);
};

/** @param {number} delta */
const adjustFontSize = (delta) => {
  try {
    const context = getFontSizeContext();
    if (!context) {
      return;
    }

    const { pun, minFontSize, maxFontSize } = context;
    const currentFontSize = getComputedFontSizeFromPost();
    if (currentFontSize === null || !Number.isFinite(currentFontSize)) {
      return;
    }

    const updatedFontSize = currentFontSize + delta;

    if (updatedFontSize < minFontSize || updatedFontSize > maxFontSize) {
      return;
    }

    setDynamicFontSize(pun, updatedFontSize);
  } catch (e) {
    handleError("html-header/changeVisuals/fontSize", e);
  }
};

const increaseFontSize = () => adjustFontSize(1);
const decreaseFontSize = () => adjustFontSize(-1);

const resetFontSize = () => {
  try {
    const pun = document.getElementById("pun");
    if (!pun) {
      return;
    }

    pun.style.removeProperty(CSS_VARIABLE_SIZE_KEY);
    removeStoredFontSize();
  } catch (e) {
    handleError("html-header/changeVisuals/fontSize", e);
  }
};

/** Restores the saved font size. */
export const restoreFontSize = () => {
  try {
    const context = getFontSizeContext();
    if (!context) {
      return;
    }

    const { pun, minFontSize, maxFontSize } = context;
    const userFontSize = getStoredFontSize();

    if (
      userFontSize !== null &&
      Number.isFinite(userFontSize) &&
      userFontSize >= minFontSize &&
      userFontSize <= maxFontSize
    ) {
      setDynamicFontSize(pun, userFontSize);
    }
  } catch (e) {
    handleError("html-header/changeVisuals/fontSize", e);
  }
};

/** Connects the font-size controls. */
export const initializeFontSizeControls = () => {
  try {
    const context = getFontSizeContext();
    if (!context) {
      return;
    }

    document
      .getElementById("text-increase")
      ?.addEventListener("click", increaseFontSize);
    document
      .getElementById("text-decrease")
      ?.addEventListener("click", decreaseFontSize);
    document
      .getElementById("text-clear")
      ?.addEventListener("click", resetFontSize);
  } catch (e) {
    handleError("html-header/changeVisuals/fontSize", e);
  }
};
