import { getLang, handleLogin } from "@teh/utils";

/**
 * @typedef {object} FastLogin
 * @property {string} [id]
 * @property {string | Record<string, string>} link
 * @property {string} login
 * @property {string} password
 */

/**
 * @param {{ after?: string, logins?: FastLogin[] }} options
 * @returns {void}
 */
export default function createFastLoginLinks({
  after = "navlogin",
  logins = []
}) {
  // if the current user group is a guest one
  if (GroupID === 3) {
    // helper function
    /** @param {Event} event */
    function handleFastLoginClick(event) {
      const { target } = event;
      if (target instanceof HTMLElement) {
        const { login, password } = target.dataset;

        handleLogin({ login, password });
      }
    }

    if (logins.length > 0) {
      const loginMap = logins.map(({ id, link, login, password }, i) => {
        const liID = id || `navAdd${i}`;

        let linkLabel = link;
        if (typeof linkLabel !== "string") {
          const lang = getLang();
          linkLabel = linkLabel[lang] ?? "";
        }

        return `<li id="${liID}"><a class="js_login" data-login="${login}" data-password="${password}">${linkLabel}</a></li>`;
      });

      const afterEl = document.getElementById(after);
      if (afterEl instanceof HTMLElement) {
        afterEl.insertAdjacentHTML("afterend", loginMap.join(""));
      }

      document
        .querySelectorAll("a.js_login")
        .forEach((node) =>
          node.addEventListener("click", handleFastLoginClick)
        );
    }
  }
}
