import { handleError } from "@teh/utils";

/**
 * @typedef {object} LoadFriendsBannersOptions
 * @property {string} [url] Page URL.
 * @property {string} [source] Container selector on the fetched page.
 * @property {string} [target] Container selector on the current page.
 */

/**
 * @param {LoadFriendsBannersOptions} [options]
 * @returns {Promise<void>}
 */
const loadFriendsBanners = async ({
  url = "/pages/friends",
  source = "#pun-main .container",
  target = "#html-footer .friends .wrapper"
} = {}) => {
  const wrapper = document.querySelector(target);
  if (!wrapper) {
    return;
  }

  try {
    const response = await fetch(url, { credentials: "same-origin" });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = new TextDecoder("windows-1251").decode(
      await response.arrayBuffer()
    );
    const doc = new DOMParser().parseFromString(html, "text/html");
    const container = doc.querySelector(source);
    if (!container) {
      return;
    }

    const fragment = document.createDocumentFragment();

    container.querySelectorAll("a:has(img)").forEach((banner, index) => {
      const node = /** @type {HTMLAnchorElement} */ (
        document.importNode(banner, true)
      );
      const img = node.querySelector("img");
      const title = (
        img?.getAttribute("title") || node.getAttribute("title")
      )?.trim();

      if (title) {
        const id = `friend-banner-tip-${index}`;

        node.setAttribute("interestfor", id);
        img?.removeAttribute("title");
        node.removeAttribute("title");
        if (img && !img.getAttribute("alt")?.trim()) {
          img.alt = title;
        }

        node.insertAdjacentHTML(
          "beforeend",
          `<span class="tooltip" popover="hint" id="${id}" role="tooltip">${title}</span>`
        );
      }

      fragment.append(node);
    });

    wrapper.replaceChildren(fragment);
    requestAnimationFrame(() => {
      wrapper.dataset.ready = "";
    });
  } catch (error) {
    handleError("hehedges-specials/loadFriendsBanners", error);
  }
};

export default loadFriendsBanners;
