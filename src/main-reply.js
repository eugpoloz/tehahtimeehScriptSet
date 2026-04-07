"use strict";

/*
  tehahtimeehScriptSet/textarea funcs
  author: eugpoloz (грандоченька смерти)
  license: MIT

  вопросы и поддержка:
  — https://github.com/eugpoloz/basicScriptSet
  — http://urchoice.rolka.su/profile.php?id=4789
*/

import countTextareaCharacters from "./features/textarea/charCounter";
import submitOnHotkey from "./features/textarea/fastSubmit";
import * as refactorEditorButtons from "./features/textarea/refactorEditorButtons";
import addEditorButtons from "./features/textarea/addEditorButtons";

// default scripts
refactorEditorButtons.addCtrlClicks();
refactorEditorButtons.originalUploadedFirst();

// module exports
export { submitOnHotkey, countTextareaCharacters, addEditorButtons };

// config example
//
//tehMainReply.submitOnHotkey();
//tehMainReply.countTextareaCharacters();
//tehMainReply.addEditorButtons([
//  {
//    target: "button-strike",
//    id: "button-indent",
//    title: "Красная строка",
//    onclick: "insert('[indent]')",
//  },
//  {
//    target: "button-right",
//    id: "button-justify",
//    title: "Выравнивание по ширине",
//    onclick: "bbcode('[align=justify]', '[/align]')",
//  },
//]);
