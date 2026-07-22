/*! @license tehahtimeehScriptSet | (c) eugpoloz a.k.a. грандоченька смерти | Released under the MIT license | https://github.com/eugpoloz/tehahtimeehScriptSet */

"use strict";

import { version } from "../package.json";
import init from "./features/init";
import { popoverHintPolyfill } from "./polyfills/popoverHint";

popoverHintPolyfill();
init();

export { init, version };
