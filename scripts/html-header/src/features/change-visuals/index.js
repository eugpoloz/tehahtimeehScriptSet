import { handleError } from "@teh/utils";

import { insertVisualControls } from "./controls";
import { initializeFontSizeControls, restoreFontSize } from "./font-size";
import { initializeThemeControls, restoreTheme } from "./theme";

/** Inserts and connects controls after the page DOM is available. */
const initializeVisualControls = () => {
  try {
    const controlsAvailable = insertVisualControls();
    if (!controlsAvailable) {
      return;
    }

    initializeFontSizeControls();
    initializeThemeControls();
  } catch (e) {
    handleError("html-header/changeVisuals", e);
  }
};

/**
 * Adds visual controls, restores saved settings, and connects their event
 * handlers.
 *
 * @returns {void}
 */
const changeVisuals = () => {
  try {
    restoreFontSize();
    restoreTheme();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeVisualControls, {
        once: true
      });

      return;
    }

    initializeVisualControls();
  } catch (e) {
    handleError("html-header/changeVisuals", e);
  }
};

export default changeVisuals;
