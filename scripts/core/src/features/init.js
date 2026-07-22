function init() {
  const globalRef = typeof globalThis !== "undefined" ? globalThis : window;

  if (!globalRef.teh) {
    globalRef.teh = {};
  }

  console.info("tehahtimeehScriptSet initialized", globalRef.teh);

  return globalRef.teh;
}

export default init;
