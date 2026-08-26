import addPopoverInterest from "../helpers/add-popover-interest";
import { handleError } from "@teh/utils";

let tooltipIndex = 0;
const VOID_ELEMENT_SELECTOR =
  "area, base, br, col, embed, hr, img, input, link, meta, param, source, track, wbr";

/**
 * @typedef {object} TitlePopoverConfig
 * @property {string} [selector] CSS selector for elements with title attributes.
 * @property {InsertPosition} [insertPosition] Where to insert the popover relative to its source.
 */

/**
 * Replaces native title tooltips on matching elements with accessible hover
 * and focus popovers.
 * @param {string | TitlePopoverConfig | (string | TitlePopoverConfig)[]} [config] One or more selectors or popover configurations.
 * @returns {void}
 */
const addTitlePopovers = (config = {}) => {
  const configs = Array.isArray(config) ? config : [config];
  const hasNativeInterestFor =
    HTMLButtonElement.prototype.hasOwnProperty("interestForElement");

  configs.forEach((subject) => {
    let subjectConfig;

    if (typeof subject === "string") {
      subjectConfig = { selector: subject };
    } else {
      subjectConfig = subject;
    }

    const { selector = "[title]", insertPosition } = subjectConfig;

    document.querySelectorAll(selector).forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return;
      }

      const title = element.getAttribute("title")?.trim();
      if (!title) {
        return;
      }

      let tooltipId;
      do {
        tooltipId = `title-tooltip-${tooltipIndex}`;
        tooltipIndex += 1;
      } while (document.getElementById(tooltipId));

      const isNativeInvoker = element.matches("button, a[href]");

      let placement = insertPosition;
      if (placement === undefined) {
        placement = "beforeend";

        const isVoidElement = element.matches(VOID_ELEMENT_SELECTOR);
        if (isVoidElement) {
          placement = "afterend";
        }
      }

      try {
        element.insertAdjacentHTML(
          placement,
          `<span class="tooltip" popover="hint" id="${tooltipId}" role="tooltip"></span>`
        );
      } catch (error) {
        handleError("html-footer/addTitlePopovers", error);
        return;
      }

      const tooltip = document.getElementById(tooltipId);
      if (!tooltip) {
        return;
      }

      tooltip.textContent = title;
      element.removeAttribute("title");
      element.classList.add("title-popover");
      element.setAttribute("interestfor", tooltipId);
      element.setAttribute("aria-describedby", tooltipId);

      if (element instanceof HTMLButtonElement) {
        element.setAttribute("popovertarget", tooltipId);
      } else if (
        !isNativeInvoker &&
        !element.hasAttribute("tabindex") &&
        element.tabIndex < 0
      ) {
        element.tabIndex = 0;
      }

      if (!isNativeInvoker && hasNativeInterestFor) {
        addPopoverInterest(element, tooltip);
      }
    });
  });
};

export default addTitlePopovers;
