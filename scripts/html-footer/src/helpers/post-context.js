/**
 * @typedef {{data: unknown, dataBlocks: unknown[], render: (html: string) => void}} PostContext
 */

/** @type {WeakMap<Element, () => PostContext>} */
const contexts = new WeakMap();

/**
 * Associates trusted scripts with their own marked block before insertion.
 * Existing scripts that never request a context do not parse the JSON.
 * @param {DocumentFragment} fragment
 */
export const registerPostScripts = (fragment) => {
  const blocks = fragment.querySelectorAll('script[type="application/json"]');
  /** @type {unknown[] | undefined} */
  let values;
  for (const script of fragment.querySelectorAll("script")) {
    contexts.set(script, () => {
      values ??= Array.from(blocks, (block) => JSON.parse(block.textContent));
      return {
        data: values[0] ?? null,
        dataBlocks: values,
        render: (html) => script.insertAdjacentHTML("beforebegin", html)
      };
    });
  }
};

/**
 * Returns the active marked script's data and output function in full mode.
 * Scoped scripts receive the same interface inside their worker.
 * @returns {PostContext}
 */
export const post = () => {
  const context =
    document.currentScript && contexts.get(document.currentScript);
  if (!context) {
    throw new Error("teh.post() requires an executing marked post script");
  }

  return context();
};
