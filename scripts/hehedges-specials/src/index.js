"use strict";

import ThemeSubject from "./features/web-components/theme-subject";
import defineAgeFromBirthday from "./features/web-components/age-from-birthday";
import loadCharacterVault, {
  loadCharacterVaultPage,
  loadVaultModal
} from "./features/load-character-vault";
import loadFriendsBanners from "./features/load-friends-banners";

customElements.define("theme-subject", ThemeSubject);

export {
  defineAgeFromBirthday,
  loadCharacterVault,
  loadCharacterVaultPage,
  loadFriendsBanners,
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
