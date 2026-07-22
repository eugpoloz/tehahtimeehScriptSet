"use strict";

import ThemeSubject from "./features/webComponents/theme-subject";
import defineAgeFromBirthday from "./features/webComponents/age-from-birthday";

// module definitions
customElements.define("theme-subject", ThemeSubject);

export { defineAgeFromBirthday };