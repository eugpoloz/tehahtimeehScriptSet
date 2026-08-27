"use strict";

import configureCoreSettings from "./features/configure-core-settings";
import configureEditor from "./features/configure-editor";
import changeFontSize from "./features/change-font-size";

configureCoreSettings();

export { changeFontSize, configureEditor };
