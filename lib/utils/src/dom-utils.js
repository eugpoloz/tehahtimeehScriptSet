/** @type {HTMLElement | null} */
export const viewprofile = document.getElementById("viewprofile-next");

// оказывается, у нас есть глобальная переменная profile,
// которая функция на всех страницах, кроме профиля,
// и объект (HTMLElement) на профиле, поэтому
export const hasProfile = typeof profile === "object";

export const hasTopic = typeof FORUM.topic === "object";

/**
 * @returns {string}
 */
export const getLang = () => document.documentElement.lang ?? "ru";

export const isProperWindow = window.self === window.top && !window.opener;

/**
 * @returns {boolean}
 */
export const isAMS = () => {
  const amsClasses = ["isadmin", "ismoderator"];
  const punEl = /** @type {HTMLElement} */ (document.getElementById("pun"));

  return amsClasses.some((cls) => punEl.classList.contains(cls));
};
