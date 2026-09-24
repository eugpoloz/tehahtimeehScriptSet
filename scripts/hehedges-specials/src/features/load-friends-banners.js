import { handleError } from "@teh/utils";

/**
 * @typedef {object} FriendBanner
 * @property {string} href
 * @property {string} src
 * @property {string} text Link name and tooltip text.
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
      .map(({ text, href, src }, idx) => {
        const tooltipId = `friend-banner-tip-${idx}`;

        return `<a class="banner" href="${href}" target="_blank" rel="noopener noreferrer" aria-labelledby="${tooltipId}" interestfor="${tooltipId}"><img src="${src}" alt=""><span popover="hint" id="${tooltipId}" role="tooltip">${text}</span></a>`;
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
