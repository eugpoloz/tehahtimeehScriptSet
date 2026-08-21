"use strict";

import ThemeSubject from "./features/web-components/theme-subject";
import defineAgeFromBirthday from "./features/web-components/age-from-birthday";
import loadFriendsBanners from "./features/load-friends-banners";

customElements.define("theme-subject", ThemeSubject);

export { defineAgeFromBirthday, loadFriendsBanners };

// config example
//
// teh.defineAgeFromBirthday("age-from-dob", "GAME_LATEST_DATE");
// teh.loadFriendsBanners({
//   url: "/pages/friends",
//   source: "#pun-main .container",
//   target: "#html-footer .friends .wrapper"
// });
