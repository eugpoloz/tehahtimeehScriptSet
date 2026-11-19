// This file follows the official SES browser bundle in a dedicated worker.
/// <reference types="ses" />
lockdown();

self.onmessage = async ({ data: { programs, json } }) => {
  try {
    const compartment = new Compartment();
    compartment.globalThis.dataBlocks = compartment.evaluate(
      `${JSON.stringify(json)}.map(text => JSON.parse(text))`
    );
    compartment.globalThis.data = compartment.globalThis.dataBlocks[0] ?? null;
    const makeApi = compartment.evaluate(
      "(render) => ({ post: () => ({ data, dataBlocks, render }) })"
    );
    // Yield between script tags so their declarations share one lexical scope
    // while each tag retains its own output location.
    const body = programs.join("\n;\nyield;\n");
    const scripts = compartment.evaluate(
      `(async function* () {\n${body}\n})()`
    );
    /** @type {string[]} */
    const output = [];
    for (let i = 0; i < programs.length; i++) {
      output.push("");
      /** @param {unknown} html */
      const render = (html) => {
        if (typeof html !== "string") {
          throw new TypeError("render() expects HTML text");
        }

        output[i] += html;
      };
      compartment.globalThis.teh = makeApi(harden(render));
      await scripts.next();
    }
    self.postMessage(output);
  } catch {
    self.postMessage(null);
  }
};

self.postMessage("ready");
