import { escapeHtml } from "@teh/utils";

/** @param {string} labelHTML */
export const getQuickLoginButtonHTML = (labelHTML) =>
  `<button class="link teh-quicklogin__trigger" type="button" popovertarget="teh-multiacc-quick-login" aria-haspopup="dialog">${labelHTML}</button>`;

export const getQuickLoginFormHTML = () => {
  const FULL_LOGIN_LINK =
    GroupID === 3 ? `<a href="/login.php">На страницу логина</a>` : "";

  return `<form id="quick-login" method="post">
  <fieldset>
    <legend class="sr-only">Введите ваше имя и пароль ниже</legend>
    <div class="fs-box inline">
      <p class="inputfield required">
        <label for="fld1">Имя <em>(Обязательно)</em></label>
        <span class="input">
          <input type="text" id="fld1" autocomplete="off" name="req_username" size="25" maxlength="25">
        </span>
      </p>
      <p class="inputfield required">
        <label for="fld2">Пароль <em>(Обязательно)</em></label>
        <span class="input">
          <input type="password" id="fld2" name="req_password" autocomplete="off" size="16" maxlength="16">
        </span>
      </p>
    </div>
  </fieldset>

  <label class="checkbox">
    <input type="checkbox" name="remember-acc"> <span>Запомнить для быстрого входа</span>
  </label>
            
  <p class="formsubmit">
    <input type="submit" class="button" name="login" value="Войти">${FULL_LOGIN_LINK}
  </p>
</form>`;
};

export const MULTIACC_LIST_LOCAL_HTML = `
<div>
  <h4 class="teh-quicklogin__subtitle sticky">Локальные профили:</h4>
  <ul id="multiacc-list-local" class="list loading"></ul>
</div>
`;

export const MULTIACC_LIST_VIP_HTML = `
<div>
  <h4 class="teh-quicklogin__subtitle sticky">Мультиаккаунт:</h4>
  <ul id="multiacc-list-vip" class="list loading"></ul>
</div>
`;

export const getQuickLoginPanelHTML = () =>
  `<div id="teh-multiacc-quick-login" class="teh-quicklogin popover-custom popover-panel popover-panel--rounded" popover="auto" role="dialog" aria-labelledby="teh-quicklogin-title">
    <h3 id="teh-quicklogin-title" class="teh-quicklogin__title">Быстрый вход</h3>
    <p class="teh-quicklogin__error" role="alert" data-quicklogin-error hidden></p>
    <section id="multiacc-form" class="teh-quicklogin__layout relative">
      ${getQuickLoginFormHTML()}
      <article class="relative teh-quicklogin__accounts flex flex-col flex-nowrap">
        <div id="multiacc-list" class="scrollable flex flex-col flex-nowrap">${MULTIACC_LIST_LOCAL_HTML}</div>
      </article>
    </section>
  </div>`;

/** @param {string} login */
export const getMultiaccItemHTML = (login) => {
  const escapedLogin = escapeHtml(login);
  let loginHTML = "";

  if (login !== window.UserLogin) {
    loginHTML = `<a href="javascript:void(0)" data-multiacc-login>Зайти</a>, `;
  }

  return `<li data-login="${escapedLogin}">
    <span>${escapedLogin}</span> (${loginHTML}<a href="javascript:void(0)" data-multiacc-remove>Удалить</a>)
  </li>`;
};
