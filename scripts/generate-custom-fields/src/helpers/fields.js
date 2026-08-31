/**
 * @typedef {import("../types.js").CustomFieldOption} CustomFieldOption
 * @typedef {import("../types.js").CustomFieldInput} CustomFieldInput
 */

/**
 * @param {Element | null | undefined} container
 * @param {string} proxy
 * @returns {string}
 */
export const getImgSrc = (container, proxy) => {
  const src = container?.querySelector("img")?.getAttribute("src") ?? "";

  return proxy && src.startsWith(proxy) ? src.split(proxy)[1] : src;
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
 * @returns {string}
 */
export const readInputContents = (
  input,
  container,
  proxy,
  valueAttribute = ""
) => {
  if (input.type === "text" && valueAttribute) {
    return container?.firstElementChild?.getAttribute(valueAttribute) ?? "";
  }

  switch (input.type) {
    case "img":
      return getImgSrc(container, proxy);
    case "text":
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
 * @param {string} proxy
 * @returns {string}
 */
export const maskInputValue = (input, value, proxy) => {
  switch (input.type) {
    case "img": {
      const proxifiedValue = proxy + value;
      return input.mask?.(proxifiedValue) ?? proxifiedValue;
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
 * @param {string} proxy
 * @returns {string}
 */
export const getOptionLabel = (input, optionValue, optionLabel, proxy) => {
  if (input.type === "img") {
    return optionValue ? proxy + optionValue : (optionLabel ?? optionValue);
  }

  return optionLabel ?? optionValue;
};

/**
 * @param {object} params
 * @param {CustomFieldInput} params.input
 * @param {string} params.value
 * @param {Element | null} params.previewNode
 * @param {Element} params.previewContainer
 * @param {string} params.proxy
 * @returns {Element | null}
 */
export const updatePreview = ({
  input,
  value,
  previewNode,
  previewContainer,
  proxy
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

      if (value.length) {
        previewImg.setAttribute("src", proxy + value);
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
