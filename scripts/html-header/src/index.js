"use strict";

import configureCoreSettings from "./features/configure-core-settings";
import configureEditor from "./features/configure-editor";
import changeVisuals from "./features/change-visuals";

configureCoreSettings();

const changeFontSize = changeVisuals;

export { changeFontSize, changeVisuals, configureEditor };
