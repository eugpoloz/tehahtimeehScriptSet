import { getLang, handleLogin, decryptAndLoad, encryptAndSave } from "../utils";
import { handleError } from "../utils/logger";

const INDEXED_DB_KEY = "MultiaccQuickLoginEncryptionKey";
const LOCAL_STORAGE_KEY = "MultiaccQuickLogin";

const QUICK_LOGIN_FORM_HTML = `
<form id="quick-login" method="post">
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

  <label>
    <input type="checkbox" name="remember-acc"> <span>Запомнить для быстрого входа</span>
  </label>
            
  <p class="formsubmit">
    <input type="submit" class="button" name="login" value="Войти">
  </p>
</form>
`;

const MULTIACC_LIST_LOCAL_HTML = `
<div class="multiacc-list--local">
  <h4>Локальные профили:</h4>
  <ul id="multiacc-list-local" class="loading"></ul>
</div>
`;

const MULTIACC_LIST_VIP_HTML = `
<div class="multiacc-list--vip">
  <h4>Мультиаккаунт:</h4>
  <ul id="multiacc-list-vip" class="loading"></ul>
</div>
`;

const getMultiaccItemHTML = (login) => {
  let loginHTML = "";

  if (login !== window.UserLogin) {
    loginHTML = `<a href="javascript:void(0)" class="multiacc-item-login">Зайти</a>, `;
  }

  return `<li class="multiacc-item" data-login="${login}">
    <span>${login}</span> (${loginHTML}<a href="javascript:void(0)" class="multiacc-item-remove">Удалить</a>)
  </li>`;
};

const getMultiaccEncryptedData = async () => {
  const decryptedDataString = await decryptAndLoad({
    encryptionKey: INDEXED_DB_KEY,
    localStorageKey: LOCAL_STORAGE_KEY
  });

  const decryptedData = !!decryptedDataString
    ? JSON.parse(decryptedDataString)
    : null;

  return decryptedData;
};

const setFormBusy = () => {
  const form = document.querySelector("#bss-multiacc-quick-login section.form");
  if (form) {
    form.classList.add("busy");
  }
};

const handleQuickLogin = async (e) => {
  e.preventDefault();
  setFormBusy();

  const formData = new FormData(e.target);
  const login = formData.get("req_username");
  const password = formData.get("req_password");

  const rememberAcc = formData.get("remember-acc");

  if (rememberAcc) {
    const decryptedData = await getMultiaccEncryptedData();

    let decryptedDataWithoutCurrentLogin = [];

    if (decryptedData?.length > 0) {
      decryptedDataWithoutCurrentLogin = decryptedData.filter(
        (item) => item.login !== login
      );
    }

    const dataToEncrypt = [
      { login, password },
      ...decryptedDataWithoutCurrentLogin
    ];

    await encryptAndSave({
      encryptionKey: INDEXED_DB_KEY,
      localStorageKey: LOCAL_STORAGE_KEY,
      data: JSON.stringify(dataToEncrypt)
    });
  }

  await handleLogin({ login, password });
};

const getVIPMultiAccList = async () => {
  try {
    const url = `/profile.php?section=multi&id=${window.UserID}`;

    const profileResponse = await await fetch(`${url}&nohead`, {
      method: "GET",
      credentials: "include"
    });

    const responseHTML = await profileResponse.arrayBuffer().then((buffer) => {
      const decoder = new TextDecoder("windows-1251"); // Or 'koi8-r'
      const text = decoder.decode(buffer);
      return text;
    });

    const parser = new DOMParser();
    const profile9 = parser.parseFromString(responseHTML, "text/html");

    return profile9.querySelectorAll("#profile9 .list li");
  } catch (e) {
    handleError("footer/handleQuickLogin", e);
  }
};

const renderMultiaccList = async () => {
  const multiaccList = document.getElementById("multiacc-list");

  const isVIP = document.getElementById("pun").classList.contains("isvip");

  if (isVIP) {
    if (!document.getElementById("multiacc-list-vip")) {
      multiaccList.insertAdjacentHTML("beforeend", MULTIACC_LIST_VIP_HTML);
    }

    const multiListVip = document.getElementById("multiacc-list-vip");

    if (multiListVip.innerHTML === "") {
      const multiList = await getVIPMultiAccList();

      if (multiList && multiListVip) {
        multiList.forEach((item) => {
          multiListVip.insertAdjacentElement("beforeend", item);

          const multiVipItemLinks = item.querySelectorAll(
            "a[href*='section=multi']"
          );

          if (multiVipItemLinks) {
            multiVipItemLinks.forEach((link) =>
              link.addEventListener("click", (e) => {
                setFormBusy();
              })
            );
          }
        });
      }

      multiListVip.classList.remove("loading");
    }
  }

  const multiListLocal = document.getElementById("multiacc-list-local");
  if (multiListLocal.innerHTML === "") {
    let decryptedData = await getMultiaccEncryptedData();

    if (decryptedData) {
      decryptedData.forEach((item) => {
        multiListLocal.innerHTML += getMultiaccItemHTML(item.login);
      });

      const multiaccLocalItems = multiListLocal.querySelectorAll(
        ".multiacc-item[data-login]"
      );

      multiaccLocalItems.forEach((itemElement) => {
        const removeItem = itemElement.querySelector(".multiacc-item-remove");
        const loginItem = itemElement.querySelector(".multiacc-item-login");

        const login = itemElement.dataset.login;

        removeItem.addEventListener("click", async (e) => {
          e.preventDefault();

          const updatedData = [...decryptedData].filter(
            (storedItem) => storedItem.login !== login
          );

          await encryptAndSave({
            encryptionKey: INDEXED_DB_KEY,
            localStorageKey: LOCAL_STORAGE_KEY,
            data: JSON.stringify(updatedData)
          });
          decryptedData = await getMultiaccEncryptedData();

          itemElement.remove();
        });

        if (loginItem) {
          loginItem.addEventListener("click", async (e) => {
            e.preventDefault();
            setFormBusy();

            const password = decryptedData.find(
              (storedItem) => storedItem.login === login
            )?.password;

            await handleLogin({ login, password });
          });
        }
      });
    }

    multiListLocal.classList.remove("loading");
  }
};

const multiaccQuickLogin = () => {
  const lang = getLang();
  const link = { en: "Re-login", ru: "Перезайти" }[lang];

  const html = `<div id="bss-multiacc-quick-login" class="bss-multiacc-quick-login">
    <div class="container">
      <div class="wrapper">
        <h3>Быстрый вход</h3>
        <section class="form">
          ${QUICK_LOGIN_FORM_HTML}
          <article id="multiacc-list">${MULTIACC_LIST_LOCAL_HTML}</article>
        </section>
      </div>
    </div>
  </div>`;

  const loginNavlink = document.querySelector("#navlogin a");
  const logoutNavlink = document.getElementById("navlogout");

  const navlinks = document.getElementById("pun-navlinks");

  navlinks.insertAdjacentHTML("beforeend", html);

  if (loginNavlink) {
    const href = loginNavlink.getAttribute("href");
    loginNavlink.setAttribute("href", "javascript:void(0)");
    loginNavlink.classList.add("js_relogin");
  } else if (logoutNavlink) {
    const quickLoginNavlink = `<li id="navrelogin"><a class="js_relogin" href="javascript:void(0)">${link}</a></li>`;
    logoutNavlink.insertAdjacentHTML("beforebegin", quickLoginNavlink);
  }

  document.querySelector(".js_relogin").addEventListener("click", async (e) => {
    e.preventDefault();

    const quickForm = document.getElementById("bss-multiacc-quick-login");
    if (quickForm) {
      quickForm.classList.toggle("visible");

      await renderMultiaccList();
    }
  });

  const quickLoginForm = document.getElementById("quick-login");
  if (quickLoginForm) {
    quickLoginForm.addEventListener("submit", handleQuickLogin);
  }
};

export default multiaccQuickLogin;
