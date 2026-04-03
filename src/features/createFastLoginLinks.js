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

        const formData = new FormData();
        formData.append("form_sent", "1");
        formData.append("req_username", login);
        formData.append("req_password", password);
        formData.append("login", "Submit");

        const fetchObject = {
          body: formData,
          credentials: "include",
          headers: {
            "Cache-Control": "max-age=0",
            "Upgrade-Insecure-Requests": "1"
          },
          method: "POST"
        };

        const data = fetch(
          `${window.location.origin}/login.php?action=in`,
          fetchObject
        ).then((data) => {
          if (data.status === 200) {
            window.location.reload();
          }
        });
      }
    }

    if (logins.length > 0) {
      const loginMap = logins.map(({ id, link, login, password }, i) => {
        const liID = id || `navAdd${i}`;

        return `<li id="${liID}"><a class="js_login" style="cursor: pointer;" data-login="${login}" data-password="${password}">${link}</a></li>`;
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
