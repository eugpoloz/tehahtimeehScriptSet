"use strict";

import countTextareaCharacters from "./features/textarea/char-counter";
import submitOnHotkey from "./features/textarea/fast-submit";
import * as refactorEditorButtons from "./features/textarea/refactor-editor-buttons";
import addEditorButtons from "./features/textarea/add-editor-buttons";

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
