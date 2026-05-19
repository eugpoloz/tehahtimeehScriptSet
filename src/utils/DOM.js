const viewprofile = document.getElementById("viewprofile-next");

// оказывается, у нас есть глобальная переменная profile,
// которая функция на всех страницах, кроме профиля,
// и объект (HTMLElement) на профиле, поэтому
const hasProfile = typeof profile === "object";

const hasTopic = typeof FORUM.topic === "object";

const getLang = () => document.documentElement.lang ?? "ru";

const isProperWindow = window.self === window.top && !window.opener;

const isAMS = () => {
  const amsClasses = ["isadmin", "ismoderator"];
  const punEl = document.getElementById("pun");

  return amsClasses.some((cls) => punEl.classList.contains(cls));
};

export { viewprofile, hasProfile, hasTopic, getLang, isProperWindow, isAMS };
