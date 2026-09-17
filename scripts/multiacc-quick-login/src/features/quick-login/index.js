import { getLang, handleLogin } from "@teh/utils";
import { getQuickLoginFormHTML, MULTIACC_LIST_LOCAL_HTML } from "./markup";
import { renderMultiaccList, setFormBusy } from "./render";
import { getMultiaccEncryptedData, saveMultiaccEncryptedData } from "./storage";

/** @param {SubmitEvent} e */
const handleQuickLogin = async (e) => {
  e.preventDefault();
  setFormBusy();

  if (!(e.target instanceof HTMLFormElement)) {
    return;
  }

  const formData = new FormData(e.target);
  const loginValue = formData.get("req_username");
  const passwordValue = formData.get("req_password");
  if (typeof loginValue !== "string" || typeof passwordValue !== "string") {
    return;
  }
  const login = loginValue;
  const password = passwordValue;

  const rememberAcc = formData.get("remember-acc");

  if (rememberAcc) {
    const decryptedData = await getMultiaccEncryptedData();

    const decryptedDataWithoutCurrentLogin = (decryptedData ?? []).filter(
      (item) => item.login !== login
    );

    await saveMultiaccEncryptedData([
      { login, password },
      ...decryptedDataWithoutCurrentLogin
    ]);
  }

  await handleLogin({ login, password });
};

const multiaccQuickLogin = () => {
  const lang = getLang();
  const link = { en: "Re-login", ru: "Перезайти" }[lang] ?? "Перезайти";

  const html = `<div id="teh-multiacc-quick-login" class="teh-multiacc-quick-login">
    <div class="container">
      <div class="wrapper" data-multiacc-wrapper>
          <h3>Быстрый вход</h3>
          <section id="multiacc-form" class="form">
            ${getQuickLoginFormHTML()}
            <article class="relative multiacc-list">
              <div id="multiacc-list" class="scrollable">${MULTIACC_LIST_LOCAL_HTML}</div>
            </article>
          </section>
      </div>
    </div>
  </div>`;

  const loginNavlink = document.querySelector("#navlogin a");
  const logoutNavlink = document.getElementById("navlogout");

  const navlinks = document.getElementById("pun-navlinks");
  if (!navlinks) {
    return;
  }

  navlinks.insertAdjacentHTML("beforeend", html);

  if (loginNavlink) {
    loginNavlink.setAttribute("href", "javascript:void(0)");
    loginNavlink.setAttribute("data-multiacc-relogin", "");
  } else if (logoutNavlink) {
    const quickLoginNavlink = `<li id="navrelogin"><a href="javascript:void(0)" data-multiacc-relogin>${link}</a></li>`;
    logoutNavlink.insertAdjacentHTML("beforebegin", quickLoginNavlink);
  }

  const reloginLink = document.querySelector("[data-multiacc-relogin]");
  if (!reloginLink) {
    return;
  }

  reloginLink.addEventListener("click", async (e) => {
    e.preventDefault();

    const quickForm = document.getElementById("teh-multiacc-quick-login");
    if (quickForm) {
      quickForm.classList.toggle("visible");

      /** @param {MouseEvent} eClickOutside */
      const handleClickOutside = (eClickOutside) => {
        const clickTarget = eClickOutside.target;
        if (
          clickTarget instanceof Element &&
          !clickTarget.closest("[data-multiacc-wrapper]") &&
          clickTarget !== e.target
        ) {
          quickForm.classList.remove("visible");
          document.removeEventListener("click", handleClickOutside, false);
        }
      };

      if (quickForm.classList.contains("visible")) {
        await renderMultiaccList();

        document.addEventListener("click", handleClickOutside, false);
      } else {
        document.removeEventListener("click", handleClickOutside, false);
      }
    }
  });

  const quickLoginForm = document.getElementById("quick-login");
  if (quickLoginForm) {
    quickLoginForm.addEventListener("submit", handleQuickLogin);
  }
};

export default multiaccQuickLogin;
