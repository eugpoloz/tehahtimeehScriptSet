export const WORKER_NAME = "character-acceptance-worker";
const TIMEOUT_MS = 45000;

/** Prevent forum initializers from running again inside our worker. */
export const isAcceptanceWorker = () => window.name === WORKER_NAME;

/** @param {Document} doc @param {string} selector @returns {HTMLFormElement} */
export const getForm = (doc, selector) => {
  const form = doc.querySelector(selector);
  if (!form) {
    throw new Error(`Не найдена форма ${selector}. Проверьте вход в админку.`);
  }

  return /** @type {HTMLFormElement} */ (form);
};

/** @param {HTMLFormElement} form @param {string} name @returns {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} */
export const getField = (form, name) => {
  const field = form.querySelector(`[name="${name}"]`);
  if (!field) {
    throw new Error(`В форме ${form.id} не найдено поле ${name}.`);
  }

  return /** @type {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} */ (
    field
  );
};

/** @param {HTMLFormElement} form @param {string} name @returns {HTMLInputElement} */
export const getSubmitter = (form, name) => {
  const submitter = form.querySelector(`input[type="submit"][name="${name}"]`);
  if (!submitter) {
    throw new Error(`В форме ${form.id} не найдена кнопка ${name}.`);
  }

  return /** @type {HTMLInputElement} */ (submitter);
};

/** A same-origin transport; it never decides which forum action to perform. */
export const createIframe = () => {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<iframe name="${WORKER_NAME}" title="Сохранение персонажа" hidden></iframe>`
  );
  const frame = /** @type {HTMLIFrameElement} */ (
    document.querySelector(`iframe[name="${WORKER_NAME}"]`)
  );
  const getDocument = () => {
    try {
      const doc = frame.contentDocument;
      if (doc && doc.location.origin === window.location.origin) {
        return doc;
      }
    } catch {
      // Cross-origin redirects cannot be inspected from this page.
    }

    throw new Error(
      "Нет доступа к странице в iframe. Проверьте вход в админку."
    );
  };
  /** @param {() => void} action @returns {Promise<Document>} */
  const waitForLoad = (action) =>
    new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        frame.removeEventListener("load", onLoad);
        frame.removeEventListener("error", onError);
      };
      const onLoad = () => {
        try {
          if (frame.contentDocument?.URL === "about:blank") {
            return;
          }

          const doc = getDocument();
          cleanup();
          resolve(doc);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };
      const onError = () => {
        cleanup();
        reject(new Error("Не удалось загрузить страницу в iframe."));
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(
          new Error(
            "Таймаут. Результат сохранения нужно проверить перед повторной отправкой."
          )
        );
      }, TIMEOUT_MS);
      frame.addEventListener("load", onLoad);
      frame.addEventListener("error", onError);
      try {
        action();
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  /** @param {string | URL} address */
  const load = (address) => {
    const url = new URL(address, window.location.href);
    if (url.origin !== window.location.origin) {
      throw new Error("Iframe может открывать только страницы этого форума.");
    }

    return waitForLoad(() => {
      frame.src = url.href;
    });
  };
  /**
   * Set submitted values after editor/widget submit handlers have run.
   * @param {HTMLFormElement} form
   * @param {HTMLInputElement | HTMLButtonElement} submitter
   * @param {Record<string, string | null>} [values]
   */
  const submit = async (form, submitter, values = {}) => {
    const action = new URL(form.action, form.ownerDocument.URL);
    if (
      action.origin !== window.location.origin ||
      form.ownerDocument !== getDocument()
    ) {
      throw new Error(
        "Форма сохранения должна находиться в iframe этого форума."
      );
    }

    form.target = WORKER_NAME;
    /** @param {FormDataEvent} event */
    const setValues = (event) => {
      for (const [name, value] of Object.entries(values)) {
        if (value === null) {
          event.formData.delete(name);
        } else {
          event.formData.set(name, value);
        }
      }
    };
    form.addEventListener("formdata", setValues);
    try {
      return await waitForLoad(() => {
        form.requestSubmit(submitter);
      });
    } finally {
      form.removeEventListener("formdata", setValues);
    }
  };
  return { load, submit };
};
/** @typedef {ReturnType<typeof createIframe>} AcceptanceIframe */
