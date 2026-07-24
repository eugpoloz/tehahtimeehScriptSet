/*! @license tehahtimeehScriptSet | (c) eugpoloz a.k.a. грандоченька смерти | Released under the MIT license | https://github.com/eugpoloz/tehahtimeehScriptSet */

"use strict";

/**
 * `@teh/core` entry: polyfills + `teh` namespace bootstrap.
 * Other packages load after this and extend `window.teh`.
 */

import { version } from "../package.json";
import init from "./features/init";
import gnu from "./features/gnu-terry-pratchett";
import { popoverHintPolyfill } from "./polyfills/popoverHint";

import "interestfor";

gnu();
popoverHintPolyfill();
init();

export { init, version };
