"use strict";

/*
  basicScriptSet
  author: eugpoloz (грандоченька смерти)
  license: MIT

  вопросы и поддержка:
  — https://github.com/eugpoloz/basicScriptSet
  — http://urchoice.rolka.su/profile.php?id=4789
*/

import countTextareaCharacters from "./features/textarea/charCounter";
import submitOnHotkey from "./features/textarea/fastSubmit";
import * as refactorEditorButtons from "./features/textarea/refactorEditorButtons";

import transformProfiles from "./features/default/transformProfiles";
import addProfileLinkToPosts from "./features/default/addProfileLinkToPosts";

import selectCodeBox from "./features/selectAndCopy";
import addGuestNameClicks from "./features/makeGuestNamesClickable";
import createFastLoginLinks from "./features/createFastLoginLinks";
import disableProfiles from "./features/disableProfiles";
import countPostsInTopic from "./features/countPostsInTopic";
import changeFontSize from "./features/changeFontSize";
import referQuoteToOriginal from "./features/referQuoteToOriginal";
import addFastReactions from "./features/addFastReactions";

// run by default
transformProfiles();
addProfileLinkToPosts();

// enhanceTextarea module export
export function enhanceTextarea() {
  refactorEditorButtons.addCtrlClicks();
  refactorEditorButtons.originalUploadedFirst();
  submitOnHotkey();
  countTextareaCharacters();
}

// enhanceReactions module export
export function enhanceReactions() {
  addFastReactions();
}

// module exports
export {
  createFastLoginLinks,
  selectCodeBox,
  disableProfiles,
  addGuestNameClicks,
  countPostsInTopic,
  changeFontSize,
  referQuoteToOriginal
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
