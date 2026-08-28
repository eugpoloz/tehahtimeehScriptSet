import { handleError } from "@teh/utils";

const LOCAL_STORAGE_SIZE_KEY = "userFontSize";
const CSS_VARIABLE_SIZE_KEY = "--dynamic-font-size";
const CSS_VARIABLE_MIN_SIZE_KEY = "--dynamic-font-size-min";
const CSS_VARIABLE_MAX_SIZE_KEY = "--dynamic-font-size-max";
const FONT_SIZE_VALUE_ID = "font-size-value";

/** @typedef {{ pun: HTMLElement, minFontSize: number, maxFontSize: number }} FontSizeContext */

/** @returns {string} */
export const fontSizeControlsMarkup = () => `
  <section class="theme" aria-labelledby="font-size-controls-title">
    <h3 id="font-size-controls-title">Размер шрифта</h3>
    <div class="theme__font-size-controls">
      <div class="theme__font-size-stepper" role="group" aria-labelledby="font-size-controls-title">
        <button type="button" id="text-decrease" aria-label="Уменьшить шрифт">
          <i class="material-symbols-sharp" aria-hidden="true">remove</i>
        </button>
        <output id="${FONT_SIZE_VALUE_ID}" aria-live="polite">—</output>
        <button type="button" id="text-increase" aria-label="Увеличить шрифт">
          <i class="material-symbols-sharp" aria-hidden="true">add</i>
        </button>
      </div>
      <button class="theme__font-size-reset" type="button" id="text-clear">Сбросить</button>
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

/**
 * @param {HTMLElement} pun
 * @returns {number | null}
 */
const getCurrentFontSize = (pun) => {
  const postFontSize = getComputedFontSizeFromPost();
  if (postFontSize !== null && Number.isFinite(postFontSize)) {
    return postFontSize;
  }

  const dynamicFontSize = cssLengthToPixels(
    window.getComputedStyle(pun).getPropertyValue(CSS_VARIABLE_SIZE_KEY)
  );

  return Number.isFinite(dynamicFontSize) ? dynamicFontSize : null;
};

/** @param {FontSizeContext} context */
const synchronizeFontSizeControls = (context) => {
  const { pun, minFontSize, maxFontSize } = context;

  const resetButton = document.getElementById("text-clear");
  if (resetButton instanceof HTMLButtonElement) {
    resetButton.disabled =
      pun.style.getPropertyValue(CSS_VARIABLE_SIZE_KEY).trim() === "";
  }

  const fontSize = getCurrentFontSize(pun);
  if (fontSize === null) {
    return;
  }

  const value = document.getElementById(FONT_SIZE_VALUE_ID);
  if (value) {
    value.textContent = String(Number(fontSize.toFixed(2)));
  }

  const decreaseButton = document.getElementById("text-decrease");
  if (decreaseButton instanceof HTMLButtonElement) {
    decreaseButton.disabled = fontSize <= minFontSize;
  }

  const increaseButton = document.getElementById("text-increase");
  if (increaseButton instanceof HTMLButtonElement) {
    increaseButton.disabled = fontSize >= maxFontSize;
  }
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
 * @param {FontSizeContext} context
 * @param {number} size
 */
const setDynamicFontSize = (context, size) => {
  const { pun } = context;
  pun.style.setProperty(CSS_VARIABLE_SIZE_KEY, `${size}px`);
  storeFontSize(size);
  synchronizeFontSizeControls(context);
};

/** @param {number} delta */
const adjustFontSize = (delta) => {
  try {
    const context = getFontSizeContext();
    if (!context) {
      return;
    }

    const { pun, minFontSize, maxFontSize } = context;
    const currentFontSize = getCurrentFontSize(pun);
    if (currentFontSize === null) {
      return;
    }

    const updatedFontSize = currentFontSize + delta;

    if (updatedFontSize < minFontSize || updatedFontSize > maxFontSize) {
      return;
    }

    setDynamicFontSize(context, updatedFontSize);
  } catch (e) {
    handleError("html-header/changeVisuals/fontSize", e);
  }
};

const increaseFontSize = () => adjustFontSize(1);
const decreaseFontSize = () => adjustFontSize(-1);

const resetFontSize = () => {
  try {
    const context = getFontSizeContext();
    if (!context) {
      return;
    }

    const { pun } = context;
    pun.style.removeProperty(CSS_VARIABLE_SIZE_KEY);
    removeStoredFontSize();
    synchronizeFontSizeControls(context);
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

    const { minFontSize, maxFontSize } = context;
    const userFontSize = getStoredFontSize();

    if (
      userFontSize !== null &&
      Number.isFinite(userFontSize) &&
      userFontSize >= minFontSize &&
      userFontSize <= maxFontSize
    ) {
      setDynamicFontSize(context, userFontSize);
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

    synchronizeFontSizeControls(context);

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
