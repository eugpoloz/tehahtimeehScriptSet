import { handleLogin } from "../utils/login";

export default function createFastLoginLinks({
  after = "navlogin",
  logins = []
}) {
  // if the current user group is a guest one
  if (GroupID === 3) {
    // helper function
    function handleFastLoginClick({ target }) {
      if (target instanceof HTMLElement) {
        const { login, password } = target.dataset;
        
        handleLogin({ login, password });
      }
    }

    if (logins.length > 0) {
      const loginMap = logins.map(({ id, link, login, password }, i) => {
        const liID = id || `navAdd${i}`;

        return `<li id="${liID}"><a class="js_login" data-login="${login}" data-password="${password}">${link}</a></li>`;
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
