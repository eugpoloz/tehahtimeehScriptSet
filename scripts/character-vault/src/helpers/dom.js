/**
 * @param {HTMLElement} root
 * @returns {void}
 */
export const enableAvatarFallbacks = (root) => {
  /** @type {NodeListOf<HTMLImageElement>} */ (
    root.querySelectorAll(".char-filter__avatar img, .char-avatar img")
  ).forEach((image) => {
    const removeImage = () => image.remove();

    if (image.complete && !image.naturalWidth) {
      removeImage();
      return;
    }

    image.addEventListener("error", removeImage, { once: true });
  });
};
