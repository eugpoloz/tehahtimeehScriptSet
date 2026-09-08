"use strict";

import ThemeSubject from "./features/web-components/theme-subject";
import defineAgeFromBirthday from "./features/web-components/age-from-birthday";
import CouponCard from "./features/web-components/coupon-card";
import ProfileIcon from "./features/web-components/profile-icon";
import ProfilePlashka from "./features/web-components/profile-plashka";
import loadCharacterVault, {
  loadCharacterVaultPage,
  loadVaultModal
} from "./features/load-character-vault";
import loadFriendsBanners from "./features/load-friends-banners";
import loadRandomQuote from "./features/load-random-quote";

/**
 * @param {string} name
 * @param {CustomElementConstructor} Component
 * @returns {void}
 */
const defineCustomElement = (name, Component) => {
  if (!customElements.get(name)) {
    customElements.define(name, Component);
  }
};

defineCustomElement("theme-subject", ThemeSubject);
defineCustomElement("profile-icon", ProfileIcon);
defineCustomElement("profile-plashka", ProfilePlashka);
defineCustomElement("coupon-card", CouponCard);

export {
  defineAgeFromBirthday,
  loadCharacterVault,
  loadCharacterVaultPage,
  loadFriendsBanners,
  loadRandomQuote,
  loadVaultModal
};

// config example
//
// teh.defineAgeFromBirthday("age-from-dob", "GAME_LATEST_DATE");
// teh.loadFriendsBanners({
//   url: "/pages/friends",
//   source: "#pun-main .container",
//   target: "#html-footer .friends .wrapper"
// });
// teh.loadCharacterVault({
//   scriptUrl: "//forumstatic.ru/files/001c/ab/7e/61137.js?v=2",
//   stylesUrl: "//forumstatic.ru/files/001c/ab/7e/37167.css?v=2"
// });
