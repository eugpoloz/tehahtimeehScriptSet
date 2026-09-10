import { escapeHtml, getImageUrl } from "@teh/utils";

const IMAGE_SELECTOR = ":scope > img";
const CONTENT_SELECTOR = ":scope > [data-profile-plashka-content]";

/**
 * @param {HTMLElement} content
 * @returns {boolean}
 */
const hasMeaningfulContent = (content) =>
  Array.from(content.childNodes).some((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return Boolean(node.textContent?.trim());
    }

    return node.nodeType === Node.ELEMENT_NODE;
  });

/** Displays a profile plashka while retaining its light-DOM content. */
class ProfilePlashka extends HTMLElement {
  static observedAttributes = ["src"];

  /** @type {MutationObserver | undefined} */
  _observer;

  /** @type {string | undefined} */
  _source;

  /** @returns {void} */
  connectedCallback() {
    this._observer = new MutationObserver(() => this._render());
    this._observer.observe(this, { childList: true });
    this._render();
  }

  /** @returns {void} */
  disconnectedCallback() {
    this._observer?.disconnect();
  }

  /**
   * @param {string} name
   * @param {string | null} oldValue
   * @param {string | null} newValue
   * @returns {void}
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "src" && oldValue !== newValue && this.isConnected) {
      this._render();
    }
  }

  /** @returns {void} */
  _render() {
    const imageUrl = getImageUrl(this.getAttribute("src"));
    const image = /** @type {HTMLImageElement | null} */ (
      this.querySelector(IMAGE_SELECTOR)
    );
    let content = /** @type {HTMLElement | null} */ (
      this.querySelector(CONTENT_SELECTOR)
    );

    this.dataset.customFld = "plashka";

    if (!content) {
      this.insertAdjacentHTML(
        "beforeend",
        "<span data-profile-plashka-content></span>"
      );
      content = /** @type {HTMLElement | null} */ (
        this.querySelector(CONTENT_SELECTOR)
      );
    }

    if (!content) {
      return;
    }

    const authorNodes = Array.from(this.childNodes).filter(
      (node) => node !== image && node !== content
    );
    content.append(...authorNodes);

    if (!imageUrl) {
      this._source = imageUrl;
      image?.remove();
      this.hidden = !hasMeaningfulContent(content);
      return;
    }

    if (image) {
      // Preserve fallback URLs across content updates.
      if (this._source !== imageUrl) {
        image.src = imageUrl;
      }
      this._source = imageUrl;
      this.hidden = false;
      return;
    }

    this._source = imageUrl;
    this.insertAdjacentHTML(
      "afterbegin",
      `<img src="${escapeHtml(imageUrl)}" alt="Кастомная плашка" loading="lazy">`
    );
    this.hidden = false;
  }
}

export default ProfilePlashka;
