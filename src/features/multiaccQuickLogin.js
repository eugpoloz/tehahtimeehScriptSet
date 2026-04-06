import { getLang } from "../utils";

const multiaccQuickLogin = ({ en: "Re-login", ru: "Перезайти" }) => {
  const lang = getLang();
  const link = { en: "Re-login", ru: "Перезайти" }[lang];

  const redirectUrl = window.location.pathname + window.location.search + window.location.hash;
  const html = `<div id="bss-multiacc-quick-login" class="bss-multiacc-quick-login" style="display: none;">
    <form id="login" action="${window.location.origin}/login.php?action=in" method="post">
			<fieldset>
				<legend><span>Введите ваше имя и пароль ниже</span></legend>
				<div class="fs-box inline">
				<input type="hidden" name="form_sent" value="1">
				<input type="hidden" name="redirect_url" value="${redirectUrl}">
				<p class="inputfield required">
					<label for="fld1">Имя <em>(Обязательно)</em></label><br>
					<span class="input"><input type="text" id="fld1" name="req_username" size="25" maxlength="25"></span>
				</p>
				<p class="inputfield required">
					<label for="fld2">Пароль <em>(Обязательно)</em></label><br>
					<span class="input"><input type="password" id="fld2" name="req_password" size="16" maxlength="16"></span>
				</p>
			</fieldset>
			<p class="formsubmit"><input type="submit" class="button" name="login" value="Войти"></p>
		</form>
  </div>`;

  const loginNavlink = document.querySelector("#navlogin a");
  const logoutNavlink = document.getElementById("navlogout");

  const navlinks = document.getElementById('pun-navlinks')

  navlinks.insertAdjacentHTML("beforeend", html);

  if (loginNavlink) {
    const href = loginNavlink.getAttribute("href");
    loginNavlink.setAttribute("href", "javascript:void(0)");
    loginNavlink.classList.add("js_relogin");
  } else if (logoutNavlink) {
    const quickLoginNavlink = `<li id="navrelogin"><a class="js_relogin" href="javascript:void(0)">${link}</a></li>`;
    logoutNavlink.insertAdjacentHTML("beforebegin", quickLoginNavlink);
  }

  const quickForm = document.getElementById("bss-multiacc-quick-login");

  document.querySelector(".js_relogin").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("bss-multiacc-quick-login").classList.toggle("visible");
  });

  document.body.insertAdjacentHTML("beforeend", html);
};

export default multiaccQuickLogin;