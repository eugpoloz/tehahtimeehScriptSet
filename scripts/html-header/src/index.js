"use strict";

import configureCoreSettings from "./features/configure-core-settings";
import configureEditor from "./features/configure-editor";
import addStyleControls from "./features/add-style-controls";

configureCoreSettings();

export { addStyleControls, configureEditor };
