import { handleError } from "@teh/utils";

import { insertVisualControls } from "./controls";
import { initializeFontSizeControls } from "./font-size";

/**
 * Adds visual controls, restores saved settings, and connects their event
 * handlers.
 *
 * @returns {void}
 */
const changeVisuals = () => {
  try {
    insertVisualControls();
    initializeFontSizeControls();
  } catch (e) {
    handleError("html-header/changeVisuals", e);
  }
};

export default changeVisuals;
