export const viewprofile = document.getElementById("viewprofile-next");

// оказывается, у нас есть глобальная переменная profile,
// которая функция на всех страницах, кроме профиля,
// и объект (HTMLElement) на профиле, поэтому
export const hasProfile = typeof profile === "object";

export const hasTopic = typeof FORUM.topic === "object";

export const getLang = () => document.documentElement.lang ?? "ru";

export const isProperWindow = window.self === window.top && !window.opener;

export const isAMS = () => {
  const amsClasses = ["isadmin", "ismoderator"];
  const punEl = document.getElementById("pun");

  return amsClasses.some((cls) => punEl.classList.contains(cls));
};

export const getSubject = (webComponent) => {
  const punbbId = document.querySelector(".punbb").getAttribute("id");

  switch (punbbId) {
    case "pun-edit":
    case "pun-post":
      return document.querySelector("input[name='req_subject']").value;
    case "pun-searchposts":
      return webComponent
        .closest(".post")
        .querySelector("h3 a[href^=viewtopic]").innerText;
    default:
      return document.querySelector("#pun-main h1").textContent;
  }
};