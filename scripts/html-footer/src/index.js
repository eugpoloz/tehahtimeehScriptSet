"use strict";

import transformProfiles from "./features/transform-profiles";
import selectCodeBox from "./features/select-and-copy";
import addGuestNameClicks from "./features/make-guest-names-clickable";
import createFastLoginLinks from "./features/create-fast-login-links";
import disableProfiles from "./features/disable-profiles";
import changeFontSize from "./features/change-font-size";
import referQuoteToOriginal from "./features/refer-quote-to-original";
import addTitlePopovers from "./features/add-title-popovers";
import renderPostHtml from "./features/render-post-html";

// module exports
export {
  createFastLoginLinks,
  selectCodeBox,
  disableProfiles,
  addGuestNameClicks,
  changeFontSize,
  referQuoteToOriginal,
  transformProfiles,
  addTitlePopovers,
  renderPostHtml
};

// possible config for reference:

//teh.createFastLoginLinks({
//  logins: [
//    {
//      id: 'navreader',
//      login: 'Curious Frog',
//      password: 'kvak',
//      link: { en: 'Reader', ru: 'Читатель'}
//    },{
//      id: 'navpr',
//      login: 'PR Frog',
//      password: 'kvak',
//      link: 'Пиар'
//    }
//  ]
//});
//teh.disableProfiles({
//  profiles: [4],
//  message: "Don't even think about it!"
//});
//teh.transformProfiles({
//  userStatus: {
//    online: 'Онлайн',
//    offline: 'Трогает траву'
//  },
//  fieldsWithTitle: ['.pa-posts', '.pa-fld4', '.pa-respect'],
//  htmlFields: [1, 2, 3]
//});
//teh.addTitlePopovers([
//  {
//    selector: ".post-content abbr[title]",
//    insertPosition: "beforeend"
//  },
//  {
//    selector: ".post-content img[title]",
//    insertPosition: "afterend"
//  }
//]);
//teh.addTitlePopovers(["abbr[title]", "button[title]"]);
//teh.renderPostHtml({ userIds: [3], groupIds: [1] });
