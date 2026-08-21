"use strict";

import addFastReactions from "./features/add-fast-reactions";
import autoReactToPosts from "./features/auto-react-to-posts";

function enhanceReactions() {
  addFastReactions();
  autoReactToPosts();
}

export default enhanceReactions;

// config example
//
// teh.enhanceReactions();
