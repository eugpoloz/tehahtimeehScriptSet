"use strict";

/*
  basicScriptSet
  author: eugpoloz (грандоченька смерти)
  license: MIT

  вопросы и поддержка:
  — https://github.com/eugpoloz/basicScriptSet
  — http://urchoice.rolka.su/profile.php?id=4789
*/

import addFontsToList from "./textarea/addFontsToList";
import countTextareaCharacters from "./textarea/charCounter";
import submitOnHotkey from "./textarea/fastSubmit";
import restoreLatestPost from "./textarea/restoreLatestPost";

import {
  addCtrlClicks,
  originalUploadedFirst
} from "./textarea/refactorEditorButtons";

import setDefaultIcon from "./topic/setDefaultIcon";
import selectCodeBox from "./topic/selectAndCopy";
import addGuestNameClicks from "./topic/makeGuestNamesClickable";

import createFastLoginLinks from "./various/createFastLoginLinks";
import disableProfiles from "./various/disableProfiles";
import fixRusffReputationIssue from "./various/fixRusffReputation";

// basic function
export function enhanceTextarea() {
  addCtrlClicks();
  originalUploadedFirst();
}

// run by default
fixRusffReputationIssue();
restoreLatestPost();

// module exports
export {
  setDefaultIcon,
  createFastLoginLinks,
  addFontsToList,
  countTextareaCharacters,
  selectCodeBox,
  submitOnHotkey,
  disableProfiles,
  addGuestNameClicks
};

// possible config for reference:

// bss.enhanceTextarea();
// bss.setDefaultIcon("http://forumavatars.ru/img/avatars/0019/83/8b/85-1520334341.png" /* ссылка */ );
// bss.disableProfiles({
//   profiles: [4],
//   message: "Don't even think about it!"
// });
