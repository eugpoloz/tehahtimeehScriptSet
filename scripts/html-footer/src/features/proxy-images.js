import { getProxiedImageUrl, IMAGE_PROXY } from "@teh/utils";

const WHITESPACE = /[\t\n\f\r ]/;
const CANDIDATE_SEPARATOR = /[,\t\n\f\r ]/;

/** @type {MutationObserver | null} */
let imageObserver = null;

/**
 * Resolves an HTTP(S) URL, or returns an empty string.
 *
 * @param {string} value
 * @returns {string}
 */
const resolveSource = (value) => {
  if (!value.trim()) {
    return "";
  }

  let url;
  try {
    url = new URL(value, document.baseURI);
  } catch {
    return "";
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return "";
  }

  return url.href;
};

/**
 * Replaces a failed srcset URL without changing descriptors.
 *
 * @param {string} value
 * @param {string} failedSource
 * @param {string} proxiedSource
 * @returns {string}
 */
const proxySourceSet = (value, failedSource, proxiedSource) => {
  let position = 0;
  let result = "";

  while (position < value.length) {
    const separatorStart = position;
    while (
      position < value.length &&
      CANDIDATE_SEPARATOR.test(value[position])
    ) {
      position += 1;
    }
    result += value.slice(separatorStart, position);

    const urlStart = position;
    while (position < value.length && !WHITESPACE.test(value[position])) {
      position += 1;
    }

    const token = value.slice(urlStart, position);
    const source = token.replace(/,+$/, "");
    if (resolveSource(source) === failedSource) {
      result += proxiedSource + token.slice(source.length);
    } else {
      result += token;
    }

    // Trailing commas end candidates without descriptors.
    if (token.endsWith(",")) {
      continue;
    }

    const descriptorStart = position;
    let inParentheses = false;
    while (position < value.length) {
      const character = value[position];
      position += 1;

      if (character === "(") {
        inParentheses = true;
      } else if (character === ")") {
        inParentheses = false;
      } else if (character === "," && !inParentheses) {
        break;
      }
    }
    result += value.slice(descriptorStart, position);
  }

  return result;
};

/**
 * Retries failed image URLs once per image through a proxy.
 *
 * @param {string} [proxy=IMAGE_PROXY] Prefix followed by an encoded image URL.
 * @returns {void}
 */
const proxyImages = (proxy = IMAGE_PROXY) => {
  if (imageObserver || !proxy) {
    return;
  }

  /** @type {WeakMap<HTMLImageElement, Set<string>>} */
  const retriedSources = new WeakMap();

  /** @param {HTMLImageElement} image */
  const retryImage = (image) => {
    if (!image.isConnected || !image.complete || image.naturalWidth !== 0) {
      return;
    }

    const failedSource = resolveSource(
      image.currentSrc || image.getAttribute("src") || ""
    );
    const attempted = retriedSources.get(image) ?? new Set();
    if (
      !failedSource ||
      failedSource.startsWith(proxy) ||
      failedSource.startsWith(IMAGE_PROXY) ||
      attempted.has(failedSource)
    ) {
      return;
    }

    const proxiedSource = getProxiedImageUrl(failedSource, proxy);
    /** @type {Element[]} */
    const elements = [image];
    if (image.parentElement?.matches("picture")) {
      let sibling = image.previousElementSibling;
      while (sibling) {
        if (sibling instanceof HTMLSourceElement) {
          elements.push(sibling);
        }
        sibling = sibling.previousElementSibling;
      }
    }

    /** @type {{ element: Element, attribute: string, value: string }[]} */
    const updates = [];
    for (const element of elements) {
      for (const attribute of ["srcset", "src"]) {
        if (attribute === "src" && element !== image) {
          continue;
        }

        const value = element.getAttribute(attribute);
        if (!value) {
          continue;
        }

        let proxiedValue = value;
        if (attribute === "srcset") {
          proxiedValue = proxySourceSet(value, failedSource, proxiedSource);
        } else if (resolveSource(value) === failedSource) {
          proxiedValue = proxiedSource;
        }

        if (proxiedValue !== value) {
          updates.push({ element, attribute, value: proxiedValue });
        }
      }
    }

    if (!updates.length) {
      return;
    }

    attempted.add(failedSource);
    retriedSources.set(image, attempted);
    for (const update of updates) {
      update.element.setAttribute(update.attribute, update.value);
    }
  };

  // Image errors require capture.
  document.addEventListener(
    "error",
    (event) => {
      if (event.target instanceof HTMLImageElement) {
        retryImage(event.target);
      }
    },
    true
  );

  // Catch images that failed before insertion.
  imageObserver = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element) || !node.isConnected) {
          continue;
        }

        if (node instanceof HTMLImageElement) {
          retryImage(node);
        }
        node.querySelectorAll("img").forEach(retryImage);
      }
    }
  });

  imageObserver.observe(document, {
    childList: true,
    subtree: true
  });

  document.querySelectorAll("img").forEach(retryImage);
};

export default proxyImages;
