/*! @license tehahtimeehScriptSet | (c) eugpoloz a.k.a. грандоченька смерти | Released under the MIT license | https://github.com/eugpoloz/tehahtimeehScriptSet */

"use strict";

import { name, version } from "../package.json";

function initCore() {
  const globalRef = typeof globalThis !== "undefined" ? globalThis : window;

  if (!globalRef.teh) {
    globalRef.teh = {};
  }

  const pkgName = name
    .split("-")
    .map((str, i) =>
      i === 0 ? str : str.charAt(0).toUpperCase() + str.slice(1)
    )
    .join("");

  console.info(`${pkgName} initialized`, globalRef.teh);

  return globalRef.teh;
}

export { initCore, version };

initCore();