/**
 * @typedef {import("../types.js").CustomFieldOption} CustomFieldOption
 * @typedef {import("../types.js").CustomFieldComponent} CustomFieldComponent
 * @typedef {import("../types.js").CustomFieldInput} CustomFieldInput
 */

import { escapeHtml, getImageUrl, getUnproxiedImageUrl } from "@teh/utils";

const PLASHKA_TAGS = new Set(["a", "br", "em", "p", "span", "strong"]);
const COUPON_TAGS = new Set([
  "a",
  "b",
  "br",
  "del",
  "em",
  "i",
  "mark",
  "p",
  "s",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "u"
]);
const BLOCKED_TAGS = new Set(["embed", "iframe", "object", "script", "style"]);

/**
 * @param {string} value
 * @returns {boolean}
 */
const isSafeHref = (value) => {
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Preserves a safe subset of rich markup while excluding media and executable
 * content from component children.
 *
 * @param {string} value
 * @param {Set<string>} allowedTags
 * @returns {string}
 */
const sanitizeRichText = (value, allowedTags) => {
  const documentFragment = document
    .createRange()
    .createContextualFragment(value);

  /** @param {Node} node @returns {string} */
  const sanitizeNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent ?? "");
    }

    if (!(node instanceof HTMLElement)) {
      return "";
    }

    const tagName = node.tagName.toLowerCase();
    if (BLOCKED_TAGS.has(tagName)) {
      return "";
    }

    const content = Array.from(node.childNodes).map(sanitizeNode).join("");
    if (!allowedTags.has(tagName)) {
      return content;
    }

    if (tagName === "br") {
      return "<br>";
    }

    const href = node.getAttribute("href");
    const hrefAttribute =
      tagName === "a" && href && isSafeHref(href)
        ? ` href="${escapeHtml(href)}"`
        : "";

    return `<${tagName}${hrefAttribute}>${content}</${tagName}>`;
  };

  return Array.from(documentFragment.childNodes).map(sanitizeNode).join("");
};

/** @param {string} value @returns {string} */
const sanitizePlashkaContent = (value) => sanitizeRichText(value, PLASHKA_TAGS);

/** @param {string} value @returns {string} */
const sanitizeCouponContent = (value) => sanitizeRichText(value, COUPON_TAGS);

/**
 * @param {CustomFieldInput[]} inputs
 * @param {Map<string, string>} values
 * @param {"img" | "text"} type
 * @returns {string}
 */
const getInputValue = (inputs, values, type) => {
  const input = inputs.find((candidate) => candidate.type === type);
  return input ? (values.get(input.name) ?? "") : "";
};

/**
 * @param {CustomFieldInput[]} inputs
 * @param {Map<string, string>} values
 * @returns {string}
 */
const getClassNames = (inputs, values) =>
  inputs
    .filter((input) => input.type === "className")
    .map((input) => values.get(input.name) ?? "")
    .join(" ")
    .trim();

/**
 * Builds custom-field component markup.
 *
 * @param {CustomFieldComponent} component
 * @param {CustomFieldInput[]} inputs
 * @param {Map<string, string>} values
 * @returns {string}
 */
export const componentMarkup = (component, inputs, values) => {
  const imageUrl = getImageUrl(getInputValue(inputs, values, "img"));
  const textValue = getInputValue(inputs, values, "text");

  switch (component) {
    case "profile-icon":
      return imageUrl
        ? `<profile-icon src="${escapeHtml(imageUrl)}"></profile-icon>`
        : "";
    case "profile-plashka": {
      const text = sanitizePlashkaContent(textValue);
      if (!imageUrl && !text) {
        return "";
      }

      const classNames = getClassNames(inputs, values);
      const classAttribute = classNames
        ? ` class="${escapeHtml(classNames)}"`
        : "";
      const srcAttribute = imageUrl ? ` src="${escapeHtml(imageUrl)}"` : "";

      return `<profile-plashka${classAttribute}${srcAttribute}>${text}</profile-plashka>`;
    }
    case "coupon-card": {
      const text = sanitizeCouponContent(textValue);
      return text ? `<coupon-card>${text}</coupon-card>` : "";
    }
  }
};

/**
 * @param {Element | null | undefined} container
 * @param {string} proxy
 * @returns {string}
 */
export const getImgSrc = (container, proxy) => {
  const src =
    container?.getAttribute("src") ??
    container?.querySelector("img")?.getAttribute("src") ??
    "";

  // Decode configured and default proxy URLs.
  return getUnproxiedImageUrl(getUnproxiedImageUrl(src, proxy));
};

/**
 * @param {string} [maxlength]
 * @returns {string}
 */
export const getMaxLength = (maxlength) =>
  !!maxlength ? `maxlength=${maxlength}` : "";

/**
 * @param {DOMTokenList} classList
 * @param {string} value
 * @returns {void}
 */
export const setClassTokens = (classList, value) => {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  if (tokens.length) {
    classList.add(...tokens);
  }
};

/**
 * @param {CustomFieldOption[] | undefined} options
 * @param {Element | null | undefined} container
 * @returns {string}
 */
export const getClassNameContents = (options, container) => {
  if (!container) {
    return "";
  }

  const optionValues = (options ?? []).flatMap((option) =>
    option.value ? [option.value] : []
  );

  return (
    optionValues.find((value) => container.classList.contains(value)) ?? ""
  );
};

/**
 * @param {CustomFieldInput} input
 * @param {Element | null | undefined} container
 * @param {string} proxy
 * @param {string} [valueAttribute]
 * @param {CustomFieldComponent} [component]
 * @returns {string}
 */
export const readInputContents = (
  input,
  container,
  proxy,
  valueAttribute = "",
  component
) => {
  if (input.type === "text" && valueAttribute && !component) {
    return container?.firstElementChild?.getAttribute(valueAttribute) ?? "";
  }

  switch (input.type) {
    case "img":
      return getImgSrc(container, proxy);
    case "text":
      if (component === "coupon-card") {
        return container?.innerHTML ?? "";
      }

      if (component === "profile-plashka") {
        if (container?.matches("profile-plashka")) {
          const managedContent = container.querySelector(
            ":scope > [data-profile-plashka-content]"
          );
          return managedContent?.innerHTML ?? container.innerHTML;
        }

        return container?.querySelector("p")?.innerHTML ?? "";
      }

      return container?.querySelector("p")?.innerHTML ?? "";
    case "className":
      return getClassNameContents(input.options, container);
    default:
      return "";
  }
};

/**
 * @param {CustomFieldInput} input
 * @param {string} value
 * @returns {string}
 */
export const maskInputValue = (input, value) => {
  switch (input.type) {
    case "img": {
      const imageValue = escapeHtml(getImageUrl(value));
      return input.mask?.(imageValue) ?? imageValue;
    }
    case "text":
      return input.mask?.(value) ?? value;
    default:
      return value;
  }
};

/**
 * @param {CustomFieldInput} input
 * @param {string} optionValue
 * @param {string | undefined} optionLabel
 * @returns {string}
 */
export const getOptionLabel = (input, optionValue, optionLabel) => {
  if (input.type === "img") {
    if (!optionValue) {
      return optionLabel ?? optionValue;
    }

    return escapeHtml(getImageUrl(optionValue)) || optionLabel || "";
  }

  return optionLabel ?? optionValue;
};

/**
 * @param {object} params
 * @param {CustomFieldInput} params.input
 * @param {string} params.value
 * @param {Element | null} params.previewNode
 * @param {Element} params.previewContainer
 * @returns {Element | null}
 */
export const updatePreview = ({
  input,
  value,
  previewNode,
  previewContainer
}) => {
  switch (input.type) {
    case "img": {
      if (!previewNode) {
        return null;
      }

      const previewImg =
        previewNode.nodeName === "IMG"
          ? previewNode
          : previewNode.querySelector("img");

      if (!previewImg) {
        return previewNode;
      }

      const imageUrl = getImageUrl(value);
      if (imageUrl) {
        previewImg.setAttribute("src", imageUrl);
        previewImg.removeAttribute("hidden");
      } else {
        previewImg.removeAttribute("src");
        previewImg.setAttribute("hidden", "");
      }
      return previewNode;
    }
    case "text": {
      const maskedValue = input.mask?.(value);

      if (!previewNode) {
        if (!maskedValue) {
          return null;
        }

        previewContainer.insertAdjacentHTML("beforeend", maskedValue);
        return previewContainer.lastElementChild;
      }

      if (maskedValue === undefined) {
        previewNode.innerHTML = value;
        return previewNode;
      }

      previewNode.insertAdjacentHTML("afterend", maskedValue);
      const updatedPreviewNode = previewNode.nextElementSibling;
      previewNode.remove();
      return updatedPreviewNode;
    }
    case "className":
      if (previewContainer.classList.length) {
        previewContainer.removeAttribute("class");
      }

      if (value.length) {
        setClassTokens(previewContainer.classList, value);
      }
      return null;
  }

  return null;
};
