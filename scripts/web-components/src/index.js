"use strict";

/**
 * `@teh/web-components` entry: registers `theme-subject` and exports
 * `defineAgeFromBirthday` for optional custom-tag registration.
 */

import ThemeSubject from "./features/webComponents/theme-subject";
import defineAgeFromBirthday from "./features/webComponents/age-from-birthday";

// module definitions
customElements.define("theme-subject", ThemeSubject);

export { defineAgeFromBirthday };
