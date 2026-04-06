import { handleLogin } from "./login";
import { handleError } from "./error";
import { decryptAndLoad, encryptAndSave } from "./crypto";

export const viewprofile = document.getElementById("viewprofile-next");

// оказывается, у нас есть глобальная переменная profile,
// которая функция на всех страницах, кроме профиля,
// и объект (HTMLElement) на профиле, поэтому
export const hasProfile = typeof profile === "object";

export const hasTopic = typeof FORUM.topic === "object";

export const getLang = () => document.documentElement.lang ?? "ru";

export { handleLogin, handleError, decryptAndLoad, encryptAndSave };
