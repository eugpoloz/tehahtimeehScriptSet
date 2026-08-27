const HTML_MARKER = "<!-- HTML -->";

/**
 * @typedef {object} RenderPostHtmlOptions
 * @property {(string | number)[]} [userIds] Authors allowed to publish HTML.
 * @property {(string | number)[]} [groupIds] Author groups allowed to publish HTML.
 */

/**
 * Replaces one marked code box with its HTML contents.
 *
 * @param {HTMLPreElement} code
 * @returns {void}
 */
const renderCodeBox = (code) => {
  const source = code.textContent.trimStart();
  if (!source.startsWith(HTML_MARKER)) {
    return;
  }

  const codeBox = code.closest(".code-box");
  if (!codeBox) {
    return;
  }

  const html = source.slice(HTML_MARKER.length).trimStart();
  const range = document.createRange();
  range.selectNode(codeBox);

  const fragment = range.createContextualFragment(html);
  codeBox.replaceWith(fragment);
};

/**
 * Renders marked code blocks as HTML in posts by explicitly allowed authors.
 * The feature is disabled when both allowlists are empty.
 *
 * @param {RenderPostHtmlOptions} [options]
 * @returns {void}
 */
const renderPostHtml = ({ userIds = [], groupIds = [] } = {}) => {
  const allowedUsers = new Set(userIds.map(String));
  const allowedGroups = new Set(groupIds.map(String));
  if (!allowedUsers.size && !allowedGroups.size) {
    return;
  }

  const posts = /** @type {NodeListOf<HTMLElement>} */ (
    document.querySelectorAll(".post[data-user-id], .post[data-group-id]")
  );

  for (const post of posts) {
    const userId = post.dataset.userId ?? "";
    const groupId = post.dataset.groupId ?? "";
    if (!allowedUsers.has(userId) && !allowedGroups.has(groupId)) {
      continue;
    }

    const codeBlocks = /** @type {NodeListOf<HTMLPreElement>} */ (
      post.querySelectorAll(".post-content .code-box pre")
    );
    for (const code of codeBlocks) {
      if (code.closest(".quote-box, blockquote")) {
        continue;
      }

      renderCodeBox(code);
    }
  }
};

export default renderPostHtml;
