/**
 * Evaluates one block in a fresh worker, returning its generated markup.
 * @param {string[]} programs
 * @param {string[]} json JSON blocks in source order.
 * @param {string} workerUrl
 * @returns {Promise<string[]>}
 */
export const evaluatePostScripts = async (programs, json, workerUrl) => {
  const script = new URL(workerUrl, document.baseURI).href;
  const url = URL.createObjectURL(
    new Blob([`importScripts(${JSON.stringify(script)});`], {
      type: "text/javascript"
    })
  );
  try {
    const worker = new Worker(url);
    /** @type {number | undefined} */
    let timer;
    try {
      return await new Promise((resolve, reject) => {
        worker.onerror = () => reject();
        worker.onmessageerror = () => reject();
        worker.onmessage = ({ data }) => {
          if (data === "ready") {
            timer = window.setTimeout(reject, 2500);
            worker.postMessage({ programs, json });
            return;
          }

          if (Array.isArray(data) && data.length === programs.length) {
            resolve(data);
          } else {
            reject();
          }
        };
      });
    } finally {
      clearTimeout(timer);
      worker.terminate();
    }
  } finally {
    URL.revokeObjectURL(url);
  }
};
