export const viewprofile = document.getElementById('viewprofile-next');

// оказывается, у нас есть глобальная переменная profile,
// которая функция на всех страницах, кроме профиля,
// и объект (HTMLElement) на профиле, поэтому
export const hasProfile = typeof profile === "object";

export const hasTopic = typeof FORUM.topic === "object";