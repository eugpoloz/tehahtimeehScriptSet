import { handleError } from "@teh/utils";

const PREFERENCE_KEY = "tehShowNewMsg";
const CONTROL_ID = "show-new-msg-link";
const DATA_KEY = "teh-new-msg";
const ULINKS = "#pun-ulinks ul";

const NEW_MSG_MODULE_NAME = "html-header/addNewMsgLink";

/** @returns {string} */
export const newMsgLinkControlMarkup = () => `
  <section class="theme flex flex-col flex-nowrap gap-xs">
    <label class="theme__label flex items-center gap-xs" for="${CONTROL_ID}">
      <input type="checkbox" id="${CONTROL_ID}" disabled>
      <span>«Новые сообщения»</span>
    </label>
  </section>`;

/** @param {boolean} enabled */
const updateNewMsgLink = (enabled) => {
  const ulinks = document.querySelector(ULINKS);
  const link = ulinks?.querySelector(`[data-${DATA_KEY}]`);

  if (!enabled) {
    link?.remove();
    return;
  }

  if (!link) {
    ulinks?.insertAdjacentHTML(
      "afterbegin",
      `<li class="item1" data-${DATA_KEY}><a href="/search.php?action=show_new">Новые сообщения</a></li>`
    );
  }
};

/** @param {boolean} enabled */
const saveLocalPreference = (enabled) => {
  try {
    localStorage.setItem(PREFERENCE_KEY, String(enabled));
  } catch (e) {
    handleError("newMsg/storage", e);
  }
};

/** @returns {boolean} */
const getLocalPreference = () => {
  try {
    return localStorage.getItem(PREFERENCE_KEY) === "true";
  } catch (e) {
    handleError("newMsg/storage", e);

    return false;
  }
};

/** @param {Event} event */
const applyPreference = async (event) => {
  if (!(event.currentTarget instanceof HTMLInputElement)) {
    return;
  }

  const { checked } = event.currentTarget;

  try {
    updateNewMsgLink(checked);

    if (event.isTrusted) {
      saveLocalPreference(checked);
      await saveMybbPreference(checked);
    }
  } catch (e) {
    handleError(NEW_MSG_MODULE_NAME, e);
  }
};

/** @param {boolean} enabled */
const saveMybbPreference = async (enabled) => {
  const token = window.ForumAPITicket;

  if (!token) {
    return;
  }

  try {
    const response = await fetch("/api.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        method: "storage.set",
        token,
        key: PREFERENCE_KEY,
        value: String(enabled)
      })
    });
    if (!response.ok) {
      throw new Error(`MyBB storage request failed: ${response.status}`);
    }
  } catch (e) {
    handleError(NEW_MSG_MODULE_NAME, e);
  }
};

/** @returns {Promise<boolean>} */
const getMybbPreference = async () => {
  const token = window.ForumAPITicket;

  if (token) {
    try {
      const query = new URLSearchParams({
        method: "storage.get",
        token,
        key: PREFERENCE_KEY
      });
      const response = await fetch(`/api.php?${query}`);
      if (!response.ok) {
        throw new Error(`MyBB storage request failed: ${response.status}`);
      }

      /** @type {{ response?: { storage?: { data?: Record<string, unknown> } } }} */
      const result = await response.json();
      return result.response?.storage?.data?.[PREFERENCE_KEY] === "true";
    } catch (e) {
      handleError(NEW_MSG_MODULE_NAME, e);
    }
  }

  return getLocalPreference();
};

/**
 * Restores the saved preference and updates the new message link.
 *
 * @returns {Promise<void>}
 */
export const syncAddNewMsgLinkControl = async () => {
  const control = document.getElementById(CONTROL_ID);

  try {
    const localPreference = getLocalPreference();
    const preference = localPreference || (await getMybbPreference());

    if (control instanceof HTMLInputElement) {
      control.checked = preference;
      control.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      updateNewMsgLink(preference);
    }

    saveLocalPreference(preference);

    if (localPreference) {
      await saveMybbPreference(preference);
    }
  } catch (e) {
    handleError("html-header/changeVisuals", e);
  } finally {
    if (control instanceof HTMLInputElement) {
      control.disabled = false;
    }
  }
};

/**
 * Connects the new message link preference control to its change handler.
 *
 * @returns {void}
 */
export const initializeAddNewMsgLinkControl = () => {
  const control = document.getElementById(CONTROL_ID);
  if (!(control instanceof HTMLInputElement)) {
    return;
  }

  try {
    /** @param {Event} event */
    const handleChange = async (event) => {
      await applyPreference(event);
    };
    control.addEventListener("change", handleChange);

    syncAddNewMsgLinkControl();
  } catch (e) {
    handleError("html-header/changeVisuals", e);
  }
};

/** Adds the locally enabled link as soon as its navigation list exists. */
export const restoreNewMsgLink = () => {
  if (!getLocalPreference()) {
    return;
  }

  if (document.querySelector(ULINKS)) {
    updateNewMsgLink(true);
    return;
  }

  const observer = new MutationObserver(() => {
    if (!document.querySelector(ULINKS)) {
      return;
    }

    updateNewMsgLink(true);
    observer.disconnect();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
};
