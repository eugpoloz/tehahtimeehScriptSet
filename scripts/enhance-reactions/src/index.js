"use strict";

import addFastReactions from "./features/addFastReactions";
import autoReactToPosts from "./features/autoReactToPosts";

function enhanceReactions() {
  addFastReactions();
  autoReactToPosts();
}

export default enhanceReactions;

// config example
//
// teh.enhanceReactions();
