/**
 * Ensures `window.teh` exists and returns it.
 * Load `@teh/core` before other packages that attach onto this namespace.
 *
 * @returns {TehNamespace}
 */
function init() {
  if (!window.teh) {
    window.teh = {};
  }

  console.info("tehahtimeehScriptSet initialized", window.teh);

  return window.teh;
}

export default init;
