import { handleError } from "@teh/utils";

/**
 * @typedef {object} FriendBanner
 * @property {string} href
 * @property {string} src
 * @property {string} text
 */

/**
 * @typedef {object} LoadFriendsBannersOptions
 * @property {string} [target] Container selector on the current page.
 */

/**
 * Loads friend banners from the shared site content and renders them into a
 * target container.
 *
 * @param {LoadFriendsBannersOptions} [options]
 * @returns {Promise<void>}
 */
const loadFriendsBanners = async ({
  target = "[data-friends-target]"
} = {}) => {
  const wrapper = /** @type {HTMLElement | null} */ (
    document.querySelector(target)
  );
  if (!wrapper) {
    return;
  }

  try {
    const source = /** @type {Promise<unknown> | undefined} */ (
      window.teh?.siteContentPromise
    );
    if (!source) {
      throw new Error("teh.siteContentPromise must be initialized first");
    }

    const config = /** @type {{banners?: FriendBanner[]}} */ (await source);
    const banners = Array.isArray(config.banners) ? config.banners : [];

    wrapper.innerHTML = banners
      .map((banner, index) => {
        const text = banner.text.trim();
        const tooltipId = `friend-banner-tip-${index}`;
        const tooltip = text
          ? `<span class="tooltip" popover="hint" id="${tooltipId}" role="tooltip">${text}</span>`
          : "";
        const interestFor = text ? ` interestfor="${tooltipId}"` : "";

        return `<a href="${banner.href.trim()}" target="_blank" rel="noopener noreferrer"${interestFor}><img src="${banner.src.trim()}" border="0" width="88" height="31">${tooltip}</a>`;
      })
      .join("");

    requestAnimationFrame(() => {
      wrapper.dataset.ready = "";
    });
  } catch (error) {
    handleError("hehedges-specials/loadFriendsBanners", error);
  }
};

export default loadFriendsBanners;
