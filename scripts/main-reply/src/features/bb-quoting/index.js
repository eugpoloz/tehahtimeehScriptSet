import { bbParameter, convertPost } from "./convert";

let initialized = false;
/** @type {Range | null} */
let savedSelection = null;

/** Capture the selection before the quote link moves focus. */
function rememberSelection() {
  const selection = window.getSelection();
  if (selection && selection.rangeCount && !selection.isCollapsed) {
    savedSelection = selection.getRangeAt(0).cloneRange();
  } else {
    savedSelection = null;
  }
}

/**
 * Enable forum-compatible quoting once on topic pages with a reply editor.
 * @param {{ rules?: import("./rules").BbQuoteRule[] }} [options]
 */
export default function enableBbQuoting(options = {}) {
  if (
    initialized ||
    !document.querySelector("#main-reply") ||
    typeof insert !== "function"
  ) {
    return;
  }

  initialized = true;
  document.addEventListener("selectionchange", rememberSelection);
  document.addEventListener("mousedown", (event) => {
    if (event.target instanceof Element && event.target.closest(".pl-quote")) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount && !selection.isCollapsed) {
        savedSelection = selection.getRangeAt(0).cloneRange();
      }
    }
  });

  /** @param {string} author @param {number | string} postId */
  window.quote = (author, postId) => {
    const post = document.getElementById(`p${postId}-content`);
    if (!(post instanceof HTMLElement)) {
      return;
    }

    const current = window.getSelection();
    const range =
      current && current.rangeCount && !current.isCollapsed
        ? current.getRangeAt(0)
        : savedSelection;
    const selection = range && range.intersectsNode(post) ? range : null;
    const content = convertPost(post, selection, options.rules);
    savedSelection = null;
    if (!content) {
      $.jGrowl("Не выделен текст для цитирования");
      return;
    }

    const safeAuthor = bbParameter(author);
    insert(`[quote${safeAuthor}]${content}[/quote]\n`);
  };
}
