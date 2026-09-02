"use strict";

import configureCoreSettings from "./features/configure-core-settings";
import configureEditor from "./features/configure-editor";
import changeVisuals from "./features/change-visuals";
import loadSiteContent from "./features/load-site-content";

configureCoreSettings();

const changeFontSize = changeVisuals;

export { changeFontSize, changeVisuals, configureEditor, loadSiteContent };
