"use strict";

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
//teh.submitOnHotkey();
//teh.countTextareaCharacters();
//teh.addEditorButtons([
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
