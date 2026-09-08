"use strict";

import store from "./features/store";

const initializeStore = () => {
  store();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeStore, {
    once: true
  });
} else {
  initializeStore();
}

export default store;
