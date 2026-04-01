"use strict";

/*
  basicScriptSet
  author: eugpoloz (грандоченька смерти)
  license: MIT

  вопросы и поддержка:
  — https://github.com/eugpoloz/basicScriptSet
  — http://urchoice.rolka.su/profile.php?id=4789
*/

import countTextareaCharacters from "./textarea/charCounter";
import submitOnHotkey from "./textarea/fastSubmit";

import {
  addCtrlClicks,
  originalUploadedFirst
} from "./textarea/refactorEditorButtons";

import selectCodeBox from "./topic/selectAndCopy";
import addGuestNameClicks from "./topic/makeGuestNamesClickable";

import createFastLoginLinks from "./various/createFastLoginLinks";
import disableProfiles from "./various/disableProfiles";
import transformProfiles from "./various/transformProfiles";
import countPostsInTopic from "./various/countPostsInTopic";
import changeFontSize from "./various/changeFontSize";
import referQuoteToOriginal from "./topic/referQuoteToOriginal";
import addFastReactions from "./topic/addFastReactions";
import addProfileLinkToPosts from "./various/addProfileLinkToPosts";

// basic function
export function enhanceTextarea() {
  addCtrlClicks();
  originalUploadedFirst();
  submitOnHotkey();
  countTextareaCharacters();
}

// run by default
transformProfiles();
addProfileLinkToPosts();

// module exports
export {
  createFastLoginLinks,
  selectCodeBox,
  disableProfiles,
  addGuestNameClicks,
  countPostsInTopic,
  changeFontSize,
  referQuoteToOriginal,
  addFastReactions
};

// possible config for reference:

// bss.enhanceTextarea();
// bss.disableProfiles({
//   profiles: [4],
//   message: "Don't even think about it!"
// });
// bss.countPostsInTopic({
//   fldId: "5",
//   forumsToTrack: [7, 8, 16, 18],
//   countTopicStarter: false
// });
