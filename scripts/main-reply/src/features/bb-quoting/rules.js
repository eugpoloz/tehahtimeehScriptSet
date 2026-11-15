/**
 * @typedef {object} BbQuoteRule
 * @property {string} selector CSS selector, matched against the original element.
 * @property {string} tag BBCode tag name.
 * @property {string | ((element: HTMLElement) => string | null | undefined)} [parameter] Attribute name or parameter callback.
 * @property {boolean} [selfClosing] Emit only an opening tag.
 * @property {string} [contentSelector] Selector for the element containing authored content.
 * @property {(element: HTMLElement, serializeChildren: (element: Node) => string) => string | null | undefined} [serialize] Return BBCode content, or null to fall back to the rule's content selector or children.
 */

/** @type {BbQuoteRule[]} */
export const forumRules = [
  { selector: ".custom_tag_indent", tag: "indent", selfClosing: true },
  {
    selector: ".custom_tag_hideprofile",
    tag: "hideprofile",
    selfClosing: true
  },
  { selector: ".custom_tag_subject", tag: "subject", selfClosing: true },
  { selector: ".custom_tag_coin", tag: "coin", selfClosing: true },
  { selector: ".custom_tag_small", tag: "small" },
  { selector: ".custom_tag_material", tag: "material" },
  { selector: ".custom_tag_tag", tag: "tag" },
  { selector: ".custom_tag_badge", tag: "badge", parameter: "data-variant" },
  { selector: ".custom_tag_mono", tag: "mono" },
  {
    selector: ".custom_tag_iconprofile",
    tag: "iconprofile",
    serialize(element, serializeChildren) {
      const component = /** @type {HTMLElement & { _source?: string }} */ (
        element
      );
      if (typeof component._source === "string") {
        return component._source;
      }

      if (element.querySelector(":scope > i > img")) {
        return "";
      }

      return serializeChildren(element);
    }
  },
  {
    selector: ".custom_tag_plashka",
    tag: "plashka",
    parameter: "src",
    serialize(element, serializeChildren) {
      const authored = element.querySelector(
        ":scope > [data-profile-plashka-content]"
      );
      return serializeChildren(authored || element);
    }
  },
  {
    selector: ".custom_tag_coupon",
    tag: "coupon",
    serialize(element, serializeChildren) {
      const authored = element.querySelector(":scope > .coupon__content");
      if (!authored) {
        return serializeChildren(element);
      }

      const content = serializeChildren(authored);
      if (!content.trim()) {
        return content;
      }

      const quantity = element
        .querySelector(":scope > .coupon__quantity")
        ?.textContent?.match(/^\s*([1-9]\d*)/)?.[1];
      let metadata = quantity ? ` | ${quantity}` : "";
      if (element.classList.contains("coupon--reusable")) {
        metadata += " | reusable";
      }

      return content + metadata;
    }
  }
];
