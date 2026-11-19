/**
 * Evaluates one block in a fresh worker, returning its generated markup.
 * @param {string[]} programs
 * @param {string[]} json JSON blocks in source order.
 * @param {string} workerUrl
 * @returns {Promise<string[]>}
 */
export const evaluatePostScripts = async (programs, json, workerUrl) => {
  const response = await fetch(workerUrl, { credentials: "omit" });
  if (!response.ok) {
    throw new Error(`Post worker download failed (HTTP ${response.status})`);
  }

  const url = URL.createObjectURL(
    new Blob([await response.blob()], { type: "text/javascript" })
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
