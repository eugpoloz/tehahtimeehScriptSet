import DOMPurify from "dompurify";
import { hasTopic } from "../../utils";

const handleOnlineIndicators = (post) => {
  const isOnline = post
    .querySelector(".post-author")
    .classList.contains("online");

  const paOnline = post.querySelector(".pa-online");
  const paLastVisit = post.querySelector(".pa-last-visit");

  if (paOnline || paLastVisit) {
    const title = `"${
      isOnline
        ? `Онлайн ${paOnline?.textContent.split("Активен")[1]?.trim() ?? "∞"}`
        : (paLastVisit?.textContent.split("визит:").join("визит: ") ??
          "Трогает траву")
    }"`;
    const status = isOnline ? "on" : "off";

    const html = `<li class="pa-online" data-ready="1" data-online=${status} title=${title}></li>`;

    paOnline?.remove();
    paLastVisit?.remove();

    post.querySelector(".pa-posts").insertAdjacentHTML("beforebegin", html);
  }
};

const addTitleToIconFields = (post, field) => {
  const CONTENT_CLASS_NAME = "fld-content";

  let fieldNode = post.querySelector(field);

  if (!!fieldNode) {
    const fieldName = fieldNode.querySelector(".fld-name")?.textContent;

    if (field === ".pa-respect") {
      const contentSpan = fieldNode.querySelector("span:not(.fld-name)");
      contentSpan.title = fieldName;
      contentSpan.classList.add(CONTENT_CLASS_NAME);
      return;
    }

    const childNodes = fieldNode.childNodes;
    for (const node of childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const html = `<span class="${CONTENT_CLASS_NAME}" title="${fieldName}">${node.textContent.trim()}</span>`;

        const range = document.createRange();
        const fragment = range.createContextualFragment(html);
        node.replaceWith(fragment);
      }
    }
  }
};

const replaceFldContentWithHTML = (parent, selector) => {
  const fldsToReplace = parent.querySelectorAll(selector);

  fldsToReplace.forEach((fld) => {
    if (fld.textContent.includes("<")) {
      const cleanContent = DOMPurify.sanitize(fld.textContent, {
        ADD_ATTR: ["target"],
        ADD_TAGS: ["strong"]
      });

      fld.innerHTML = cleanContent;
    }
    fld.dataset.ready = "1";
  });
};

const transformProfiles = (config = {}) => {
  const fieldsWithTitle = config?.fieldsWithTitle ?? [
    ".pa-posts",
    ".pa-fld4",
    ".pa-respect"
  ];

  if (hasTopic) {
    const posts = document.querySelectorAll(".post");

    posts.forEach((post) => {
      replaceFldContentWithHTML(post, 'li[class^="pa-fld"]');
      handleOnlineIndicators(post);

      if (Array.isArray(fieldsWithTitle)) {
        fieldsWithTitle?.forEach((field) => {
          addTitleToIconFields(post, field);
        });
      }
    });
  }

  if (!!document.getElementById("viewprofile-next")) {
    replaceFldContentWithHTML(
      document.getElementById("profile-right"),
      'li[id^="pa-fld"] strong'
    );
  }
};

export default transformProfiles;
