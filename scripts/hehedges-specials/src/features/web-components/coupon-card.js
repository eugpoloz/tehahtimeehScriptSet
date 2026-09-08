const TRAILING_METADATA =
  /\s*\|\s*(?:(?<quantity>[1-9]\d*)\s*\|\s*(?<reusable>reusable)\s*|(?<quantityOnly>[1-9]\d*)\s*|(?<reusableOnly>reusable)\s*)$/i;

/**
 * @typedef {object} CouponMetadata
 * @property {number} quantity
 * @property {boolean} reusable
 */

/**
 * Removes coupon metadata from trailing text nodes without serializing the
 * author-provided markup that precedes it.
 *
 * @param {HTMLElement} root
 * @returns {CouponMetadata}
 */
const stripTrailingMetadata = (root) => {
  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    textNodes.push(/** @type {Text} */ (node));
    node = walker.nextNode();
  }

  const source = textNodes.map((textNode) => textNode.data).join("");
  const match = source.match(TRAILING_METADATA);
  if (!match) {
    return { quantity: 1, reusable: false };
  }

  const quantity = Number(match.groups?.quantity ?? match.groups?.quantityOnly);
  const start = source.length - match[0].length;
  let offset = 0;
  let startNode;
  let startOffset = 0;

  for (const textNode of textNodes) {
    const nextOffset = offset + textNode.data.length;
    if (start <= nextOffset) {
      startNode = textNode;
      startOffset = start - offset;
      break;
    }

    offset = nextOffset;
  }

  const endNode = textNodes[textNodes.length - 1];
  if (!startNode || !endNode) {
    return { quantity: 1, reusable: false };
  }

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endNode.data.length);
  range.deleteContents();

  return {
    quantity: Number.isSafeInteger(quantity) ? quantity : 1,
    reusable: Boolean(match.groups?.reusable ?? match.groups?.reusableOnly)
  };
};

/** Renders a coupon card while preserving the author-provided light DOM. */
class CouponCard extends HTMLElement {
  /** @type {MutationObserver | undefined} */
  _observer;

  /** @type {boolean} */
  _rendered = false;

  /** @returns {void} */
  connectedCallback() {
    if (this._rendered) {
      return;
    }

    this._waitForContent();
  }

  /** @returns {void} */
  disconnectedCallback() {
    this._observer?.disconnect();
  }

  /** @returns {void} */
  _waitForContent() {
    if (this.textContent.trim()) {
      queueMicrotask(() => this._render());
      return;
    }

    this._observer = new MutationObserver(() => {
      if (this.textContent.trim()) {
        this._observer?.disconnect();
        queueMicrotask(() => this._render());
      }
    });
    this._observer.observe(this, { childList: true, subtree: true });
  }

  /** @returns {void} */
  _render() {
    if (this._rendered || !this.isConnected || !this.textContent.trim()) {
      return;
    }

    const { quantity, reusable } = stripTrailingMetadata(this);
    const contentNodes = Array.from(this.childNodes);
    const quantityMarkup =
      quantity > 1
        ? `<span class="coupon__quantity">${quantity}<em class="sr-only"> шт.</em></span>`
        : "";
    const reusableMarkup = reusable
      ? '<span class="sr-only">Несгораемый купон</span>'
      : "";
    const range = document.createRange();
    const fragment = range.createContextualFragment(`${quantityMarkup}
      <span class="coupon__content"></span>
      ${reusableMarkup}`);
    const content = /** @type {HTMLElement} */ (
      fragment.querySelector(".coupon__content")
    );

    content.append(...contentNodes);
    this.classList.add("coupon");
    this.classList.toggle("coupon--reusable", reusable);
    this.replaceChildren(fragment);
    this._rendered = true;
    this._observer?.disconnect();
  }
}

export default CouponCard;
