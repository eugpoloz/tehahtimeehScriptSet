"use strict";

import transformProfiles from "./features/default/transformProfiles";

import selectCodeBox from "./features/selectAndCopy";
import addGuestNameClicks from "./features/makeGuestNamesClickable";
import createFastLoginLinks from "./features/createFastLoginLinks";
import disableProfiles from "./features/disableProfiles";
import changeFontSize from "./features/changeFontSize";
import referQuoteToOriginal from "./features/referQuoteToOriginal";
import addFastReactions from "./features/addFastReactions";
import autoReactToPosts from "./features/autoReactToPosts";

// enhanceReactions module export
export function enhanceReactions() {
  addFastReactions();
  autoReactToPosts();
}

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

//teh.enhanceReactions();
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
//teh.transformProfiles();
