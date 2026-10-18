import { getLang, handleLogin, handleLogs } from "@teh/utils";
import { QuickLoginError } from "../../helpers/crypto";
import errorMessages from "../../helpers/error-messages.json";
import {
  getMultiaccItemHTML,
  getQuickLoginButtonHTML,
  getQuickLoginPanelHTML,
  MULTIACC_LIST_VIP_HTML
} from "./markup";
import { getSavedPassword, listSavedLogins, removeSavedLogin } from "./storage";
import { getVIPMultiAccList } from "./vip-accounts";

/** @returns {HTMLElement | null} */
export const renderQuickLoginPanel = () => {
  const forumRoot = /** @type {Element} */ (document.querySelector(".punbb"));
  forumRoot.insertAdjacentHTML("beforeend", getQuickLoginPanelHTML());

  return document.getElementById("teh-multiacc-quick-login");
};

/** @param {HTMLElement} navlinks */
export const renderQuickLoginNavigation = (navlinks) => {
  const lang = getLang();
  const link =
    {
      en: "Re-login",
      ru: "Перезайти"
    }[lang] ?? "Перезайти";
  const loginNavlink = document.querySelector("#navlogin a");
  const logoutNavlink = document.getElementById("navlogout");
  const quickLoginButtonHTML = getQuickLoginButtonHTML(
    loginNavlink?.innerHTML ?? link
  );

  if (loginNavlink) {
    loginNavlink.insertAdjacentHTML("beforebegin", quickLoginButtonHTML);
    loginNavlink.remove();
  } else if (logoutNavlink) {
    const quickLoginNavlink = `<li id="navrelogin">${quickLoginButtonHTML}</li>`;
    logoutNavlink.insertAdjacentHTML("beforebegin", quickLoginNavlink);
  }

  const positioningBar = document.getElementById("pun-ulinks") ?? navlinks;
  positioningBar.classList.add("teh-quicklogin__bar");
};

/** @param {HTMLElement} list */
const updateEmptyMessage = (list) => {
  const parent = list.parentElement;
  if (!parent) {
    return;
  }

  const empty = parent.querySelector("[data-multiacc-empty]");
  const isEmpty = !list.children.length;

  if (!isEmpty && empty) {
    empty.remove();
  }

  if (isEmpty && !empty) {
    list.insertAdjacentHTML(
      "afterend",
      `<small class="teh-quicklogin__empty" data-multiacc-empty><em>Нет сохраненных профилей</em></small>`
    );
  }
};

/**
 * @param {boolean} busy
 * @param {boolean} localQuickLoginEnabled
 */
export const setFormBusy = (busy, localQuickLoginEnabled) => {
  const form = document.getElementById("multiacc-form");
  if (form) {
    form.classList.toggle("busy", busy);
    form.setAttribute("aria-busy", String(busy));
  }

  const disabled = busy || !localQuickLoginEnabled;
  const controls =
    /** @type {NodeListOf<HTMLInputElement | HTMLButtonElement>} */ (
      document.querySelectorAll("#quick-login input, #quick-login button")
    );
  controls.forEach((control) => {
    control.disabled = disabled;
  });
};

/** @returns {boolean} */
export const isFormBusy = () =>
  !!document.getElementById("multiacc-form")?.classList.contains("busy");

/** @param {string} text */
export const setQuickLoginErrorMessage = (text) => {
  const message = /** @type {HTMLElement | null} */ (
    document.querySelector("[data-quicklogin-error]")
  );
  if (!message) {
    return;
  }

  message.textContent = text;
  message.hidden = !text;
};

/** @returns {void} */
export const clearQuickLoginError = () => setQuickLoginErrorMessage("");

/**
 * Only known errors can supply text; native errors may contain credential data.
 * @param {unknown} error
 * @param {string} fallback
 */
export const showQuickLoginError = (error, fallback) => {
  let text = fallback;
  if (error instanceof QuickLoginError) {
    text = error.message;
  }

  setQuickLoginErrorMessage(text);
};

// Identifies the latest requested list update.
let latestListRender = 0;

/** Discards pending list results when the panel closes. */
export const invalidateMultiaccList = () => {
  latestListRender++;
};

/**
 * @param {HTMLElement} multiListLocal
 * @param {boolean} localQuickLoginEnabled
 * @param {number} renderId
 * @param {boolean} debug
 * @returns {Promise<void>}
 */
const renderLocalAccounts = async (
  multiListLocal,
  localQuickLoginEnabled,
  renderId,
  debug
) => {
  if (!localQuickLoginEnabled) {
    multiListLocal.classList.remove("loading");
    return;
  }

  multiListLocal.classList.add("loading");
  try {
    const logins = await listSavedLogins();
    if (renderId !== latestListRender) {
      return;
    }

    multiListLocal.innerHTML = logins.map(getMultiaccItemHTML).join("");
    const multiaccLocalItems = /** @type {NodeListOf<HTMLElement>} */ (
      multiListLocal.querySelectorAll("[data-login]")
    );

    multiaccLocalItems.forEach((itemElement) => {
      const removeItem = itemElement.querySelector("[data-multiacc-remove]");
      const loginItem = itemElement.querySelector("[data-multiacc-login]");
      const login = itemElement.dataset.login;
      if (!removeItem || login === undefined) {
        return;
      }

      removeItem.addEventListener("click", async (e) => {
        e.preventDefault();
        if (isFormBusy()) {
          return;
        }

        clearQuickLoginError();
        setFormBusy(true, localQuickLoginEnabled);
        try {
          await removeSavedLogin(login);
          itemElement.remove();
          updateEmptyMessage(multiListLocal);
          await renderMultiaccList(localQuickLoginEnabled, debug);
        } catch (error) {
          showQuickLoginError(error, errorMessages.accountDeleteFailed);
        } finally {
          setFormBusy(false, localQuickLoginEnabled);
        }
      });

      loginItem?.addEventListener("click", async (e) => {
        e.preventDefault();
        if (isFormBusy()) {
          return;
        }

        clearQuickLoginError();
        setFormBusy(true, localQuickLoginEnabled);
        try {
          const password = await getSavedPassword(login);
          const succeeded = await handleLogin(
            {
              login,
              password
            },
            {
              debug
            }
          );
          if (!succeeded) {
            setQuickLoginErrorMessage(errorMessages.loginFailed);
          }
        } catch (error) {
          await renderMultiaccList(localQuickLoginEnabled, debug);
          showQuickLoginError(error, errorMessages.loginFailed);
        } finally {
          setFormBusy(false, localQuickLoginEnabled);
        }
      });
    });

    updateEmptyMessage(multiListLocal);
  } catch (error) {
    if (renderId === latestListRender) {
      showQuickLoginError(error, errorMessages.accountsReadFailed);
    }
  } finally {
    if (renderId === latestListRender) {
      multiListLocal.classList.remove("loading");
    }
  }
};

/**
 * @param {HTMLElement} multiaccList
 * @param {boolean} localQuickLoginEnabled
 * @param {number} renderId
 * @param {boolean} debug
 * @returns {Promise<void>}
 */
const renderVIPAccounts = async (
  multiaccList,
  localQuickLoginEnabled,
  renderId,
  debug
) => {
  if (!document.getElementById("multiacc-list-vip")) {
    multiaccList.insertAdjacentHTML("beforeend", MULTIACC_LIST_VIP_HTML);
  }

  const multiListVip = document.getElementById("multiacc-list-vip");
  if (!multiListVip || multiListVip.innerHTML) {
    return;
  }

  try {
    const multiList = await getVIPMultiAccList(debug);
    if (renderId !== latestListRender || !multiList) {
      return;
    }

    multiList.forEach((item) => {
      multiListVip.insertAdjacentElement("beforeend", item);
      const multiVipItemLinks = item.querySelectorAll(
        "a[href*='section=multi']"
      );
      multiVipItemLinks.forEach((link) =>
        link.addEventListener("click", () => {
          setFormBusy(true, localQuickLoginEnabled);
        })
      );
    });
  } catch {
    handleLogs({
      debug,
      module: "multiacc-quick-login/renderVIPAccounts",
      message: "Failed to render VIP accounts"
    });
  } finally {
    if (renderId === latestListRender) {
      multiListVip.classList.remove("loading");
      updateEmptyMessage(multiListVip);
    }
  }
};

/**
 * Waits for local accounts; VIP accounts load independently.
 * @param {boolean} localQuickLoginEnabled
 * @param {boolean} [debug=false]
 * @returns {Promise<void>}
 */
export const renderMultiaccList = async (
  localQuickLoginEnabled,
  debug = false
) => {
  const panel = document.getElementById("teh-multiacc-quick-login");
  if (!panel?.matches(":popover-open")) {
    return;
  }

  const renderId = ++latestListRender;
  const multiaccList = document.getElementById("multiacc-list");
  const pun = document.getElementById("pun");
  const multiListLocal = document.getElementById("multiacc-list-local");
  if (!multiaccList || !pun || !multiListLocal) {
    return;
  }

  if (pun.classList.contains("isvip")) {
    void renderVIPAccounts(
      multiaccList,
      localQuickLoginEnabled,
      renderId,
      debug
    );
  }

  await renderLocalAccounts(
    multiListLocal,
    localQuickLoginEnabled,
    renderId,
    debug
  );
};
