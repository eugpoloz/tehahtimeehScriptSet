import { escapeHtml, getProxiedImageUrl } from "@teh/utils";

/** Displays a proxied profile icon from its `src` attribute or text content. */
class ProfileIcon extends HTMLElement {
  static observedAttributes = ["src"];

  /** @type {string | null | undefined} */
  _source;

  /** @returns {void} */
  connectedCallback() {
    this._render();
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
    const source = this.getAttribute("src") ?? this.textContent.trim();
    const imageUrl = getProxiedImageUrl(source);

    this.dataset.customFld = "icon";
    this.hidden = !imageUrl;

    if (!imageUrl) {
      this.replaceChildren();
      this._source = source;
      return;
    }

    if (this._source === source && this.querySelector(":scope > i > img")) {
      return;
    }

    this.innerHTML = `<i>
      <img src="${escapeHtml(imageUrl)}" alt="Кастомная иконка" loading="lazy">
    </i>`;
    this._source = source;
  }
}

export default ProfileIcon;
