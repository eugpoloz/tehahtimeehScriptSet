import DOMPurify from "dompurify";
import { hasTopic } from "@teh/utils";

/**
 * @typedef {object} OnlineIndicatorOptions
 * @property {string} [online] Label shown when the author is online.
 * @property {string} [offline] Label shown when the author is offline.
 */

/**
 * Replaces native `.pa-online` / `.pa-last-visit` fields with a hover/focus popover status indicator.
 * @param {Element} post Post element that contains author status nodes.
 * @param {OnlineIndicatorOptions} [options] Labels for online and offline states.
 * @returns {void}
 */
const handleOnlineIndicators = (post, options = {}) => {
  const online = options?.online ?? "Онлайн";
  const offline = options?.offline ?? "Трогает траву";

  const postAuthor = post.querySelector(".post-author");
  if (!postAuthor) {
    return;
  }

  const isOnline = postAuthor.classList.contains("online");

  const paOnline = post.querySelector(".pa-online");
  const paLastVisit = post.querySelector(".pa-last-visit");

  if (paOnline || paLastVisit) {
    const timeOnline = paOnline?.textContent.split("Активен")[1]?.trim() ?? "∞";
    const lastVisit =
      paLastVisit?.textContent.split("визит:").join("визит: ") ?? offline;

    const status = isOnline ? "on" : "off";

    const popoverId = `${post.id}-author-online`;
    const html = `<div class="pa-online" data-ready="" data-online=${status}>
      <button type="button" interestfor="${popoverId}" popovertarget="${popoverId}">
        <span class="sr-only">${isOnline ? online : offline}</span>
      </button>
      <div class="tooltip" popover="hint" id="${popoverId}" role="tooltip">
        ${isOnline ? `${online} ${timeOnline}` : `${lastVisit}`}
      </div>
    </div>`;

    paOnline?.remove();
    paLastVisit?.remove();

    postAuthor.insertAdjacentHTML("beforeend", html);
  }
};

/**
 * Wraps icon-field content in a titled span so the field name shows on hover.
 * @param {Element} post Post element that owns the field.
 * @param {string} field CSS selector for the profile field (e.g. `.pa-posts`).
 * @returns {void}
 */
const addTitleToIconFields = (post, field) => {
  const CONTENT_CLASS_NAME = "fld-content";

  let fieldNode = post.querySelector(field);

  if (!!fieldNode) {
    const fieldName = fieldNode.querySelector(".fld-name")?.textContent;

    if (field === ".pa-respect") {
      const contentSpan = /** @type {HTMLElement | null} */ (
        fieldNode.querySelector("span:not(.fld-name)")
      );
      if (!contentSpan) {
        return;
      }
      contentSpan.title = fieldName ?? "";
      contentSpan.classList.add(CONTENT_CLASS_NAME);
      return;
    }

    const childNodes = fieldNode.childNodes;
    for (const node of childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const html = `<span class="${CONTENT_CLASS_NAME}" title="${fieldName ?? ""}">${node.textContent?.trim() ?? ""}</span>`;

        const range = document.createRange();
        const fragment = range.createContextualFragment(html);
        node.replaceWith(fragment);
      }
    }
  }
};

/**
 * Sanitizes and renders HTML stored as plain text inside matching field nodes.
 * @param {ParentNode} parent Root to search within.
 * @param {string} selector CSS selector for fields whose text may contain HTML.
 * @returns {void}
 */
const replaceFldContentWithHTML = (parent, selector) => {
  const fldsToReplace = parent.querySelectorAll(selector);

  fldsToReplace.forEach((fld) => {
    if (fld.textContent.includes("<")) {
      const cleanContent = DOMPurify.sanitize(fld.textContent, {
        ADD_ATTR: ["target"],
        ADD_TAGS: ["strong"],
        IN_PLACE: true
      });

      fld.innerHTML = cleanContent;
    }
    if (fld instanceof HTMLElement) {
      fld.dataset.ready = "";
    }
  });
};

/**
 * @typedef {object} TransformProfilesConfig
 * @property {OnlineIndicatorOptions} [userStatus] Labels for online / offline indicators.
 * @property {string[]} [fieldsWithTitle] Selectors of post fields that should get a hover title.
 * @property {number[]} [htmlFields] Selectors of post-author custom fields (fld1, fld2, etc.) that should have their content sanitized and rendered as HTML.
 */

/**
 * Enhances author profile fields in topic posts and on the profile page:
 * renders HTML custom fields, builds online indicators, and adds hover titles.
 * @param {TransformProfilesConfig} [config] Optional labels and field selectors.
 * @returns {void}
 */
const transformProfiles = (config = {}) => {
  const userStatus = config?.userStatus ?? {};
  const fieldsWithTitle = config?.fieldsWithTitle ?? [
    ".pa-posts",
    ".pa-fld4",
    ".pa-respect"
  ];
  const htmlFields = config?.htmlFields ?? [1, 2, 3];

  if (hasTopic) {
    const posts = document.querySelectorAll(".post");

    posts.forEach((post) => {
      htmlFields.forEach((fldNum) => {
        replaceFldContentWithHTML(post, `li.pa-fld${fldNum}`);
      });
      handleOnlineIndicators(post, userStatus);

      if (Array.isArray(fieldsWithTitle)) {
        fieldsWithTitle?.forEach((field) => {
          addTitleToIconFields(post, field);
        });
      }
    });
  }

  const profileRight = document.getElementById("profile-right");
  if (document.getElementById("viewprofile-next") && profileRight) {
    htmlFields.forEach((fldNum) => {
      replaceFldContentWithHTML(profileRight, `li#pa-fld${fldNum} strong`);
    });
  }
};

export default transformProfiles;
