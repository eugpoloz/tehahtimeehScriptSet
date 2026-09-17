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
  <h4 class="quick-login-section-title">Локальные профили:</h4>
  <ul id="multiacc-list-local" class="list loading"></ul>
</div>
`;

export const MULTIACC_LIST_VIP_HTML = `
<div>
  <h4 class="quick-login-section-title">Мультиаккаунт:</h4>
  <ul id="multiacc-list-vip" class="list loading"></ul>
</div>
`;

/** @param {string} login */
export const getMultiaccItemHTML = (login) => {
  let loginHTML = "";

  if (login !== window.UserLogin) {
    loginHTML = `<a href="javascript:void(0)" data-multiacc-login>Зайти</a>, `;
  }

  return `<li data-login="${login}">
    <span>${login}</span> (${loginHTML}<a href="javascript:void(0)" data-multiacc-remove>Удалить</a>)
  </li>`;
};
