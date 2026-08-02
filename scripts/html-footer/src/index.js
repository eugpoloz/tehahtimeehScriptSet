"use strict";

import transformProfiles from "./features/transformProfiles";
import selectCodeBox from "./features/selectAndCopy";
import addGuestNameClicks from "./features/makeGuestNamesClickable";
import createFastLoginLinks from "./features/createFastLoginLinks";
import disableProfiles from "./features/disableProfiles";
import changeFontSize from "./features/changeFontSize";
import referQuoteToOriginal from "./features/referQuoteToOriginal";

// module exports
export {
  createFastLoginLinks,
  selectCodeBox,
  disableProfiles,
  addGuestNameClicks,
  changeFontSize,
  referQuoteToOriginal,
  transformProfiles
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
