export default function disableProfiles({
  profiles = [],
  message = "Редактирование данного профиля для вас запрещено!"
}) {
  if (profiles.length > 0) {
    const editLink = document.querySelector("#viewprofile #pa-edit");

    if (profiles.includes(UserID) && editLink) {
      editLink.remove();
    }

    // оказывается, у нас есть глобальная переменная profile,
    // которая функция на всех страницах, кроме профиля,
    // и объект (HTMLElement) на профиле, поэтому
    if (typeof profile === "object") {
      profile.style.display = "none";

      if (profiles.includes(UserID)) {
        const innerHTML = `<p style="margin: 1em 0; line-height: 2; text-align: center;">${message}</p>`;

        profile.innerHTML = innerHTML;
      }

      profile.style.display = "";
    }
  }
}
