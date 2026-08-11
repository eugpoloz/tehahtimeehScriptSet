"use strict";

/**
 * `@teh/hehedges-specials` entry: registers `theme-subject` and exports
 * `defineAgeFromBirthday` for forum config.
 */

import ThemeSubject from "./features/webComponents/theme-subject";
import defineAgeFromBirthday from "./features/webComponents/age-from-birthday";

// module definitions
customElements.define("theme-subject", ThemeSubject);

export { defineAgeFromBirthday };

// config example
//
// teh.defineAgeFromBirthday("age-from-dob", "GAME_LATEST_DATE");
