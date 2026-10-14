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

  const html = `<div id="teh-multiacc-quick-login" class="teh-quicklogin popover-custom popover-panel popover-panel--rounded" popover="auto" role="dialog" aria-labelledby="teh-quicklogin-title">
    <h3 id="teh-quicklogin-title" class="teh-quicklogin__title">Быстрый вход</h3>
    <section id="multiacc-form" class="teh-quicklogin__layout relative">
      ${getQuickLoginFormHTML()}
      <article class="relative teh-quicklogin__accounts flex flex-col flex-nowrap">
        <div id="multiacc-list" class="scrollable flex flex-col flex-nowrap">${MULTIACC_LIST_LOCAL_HTML}</div>
      </article>
    </section>
  </div>`;

  const loginNavlink = document.querySelector("#navlogin a");
  const logoutNavlink = document.getElementById("navlogout");

  const navlinks = document.getElementById("pun-navlinks");
  if (!navlinks) {
    return;
  }

  if (loginNavlink) {
    loginNavlink.insertAdjacentHTML(
      "beforebegin",
      `<button class="link teh-quicklogin__trigger" type="button" popovertarget="teh-multiacc-quick-login" aria-haspopup="dialog">${loginNavlink.innerHTML}</button>`
    );
    loginNavlink.remove();
  } else if (logoutNavlink) {
    const quickLoginNavlink = `<li id="navrelogin"><button class="link teh-quicklogin__trigger" type="button" popovertarget="teh-multiacc-quick-login" aria-haspopup="dialog">${link}</button></li>`;
    logoutNavlink.insertAdjacentHTML("beforebegin", quickLoginNavlink);
  }

  const positioningBar = document.getElementById("pun-ulinks") ?? navlinks;
  positioningBar.classList.add("teh-quicklogin__bar");

  const forumRoot = navlinks.closest(".punbb") ?? document.body;
  forumRoot.insertAdjacentHTML("beforeend", html);

  const quickForm = document.getElementById("teh-multiacc-quick-login");
  if (!quickForm) {
    return;
  }

  quickForm.addEventListener("toggle", async () => {
    if (quickForm.matches(":popover-open")) {
      await renderMultiaccList();
    }
  });

  const quickLoginForm = document.getElementById("quick-login");
  if (quickLoginForm) {
    quickLoginForm.addEventListener("submit", handleQuickLogin);
  }
};

export default multiaccQuickLogin;
