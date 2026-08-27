const HTML_MARKER = "<!-- HTML -->";

/**
 * @typedef {object} RenderPostHtmlOptions
 * @property {(string | number)[]} [userIds] Authors allowed to publish HTML.
 * @property {(string | number)[]} [groupIds] Author groups allowed to publish HTML.
 */

/**
 * Renders marked code blocks within one post or preview container.
 *
 * @param {ParentNode} container
 * @returns {void}
 */
const renderCodeBoxes = (container) => {
  const codeBlocks = /** @type {NodeListOf<HTMLPreElement>} */ (
    container.querySelectorAll(".post-content .code-box pre")
  );
  for (const code of codeBlocks) {
    if (code.closest(".quote-box, blockquote")) {
      continue;
    }

    const source = code.textContent.trimStart();
    if (!source.startsWith(HTML_MARKER)) {
      continue;
    }

    const codeBox = code.closest(".code-box");
    if (!codeBox) {
      continue;
    }

    const html = source.slice(HTML_MARKER.length).trimStart();
    const range = document.createRange();
    range.selectNode(codeBox);

    const fragment = range.createContextualFragment(html);
    codeBox.replaceWith(fragment);
  }
};

/**
 * @param {string} userId
 * @param {string} groupId
 * @param {Set<string>} allowedUsers
 * @param {Set<string>} allowedGroups
 * @returns {boolean}
 */
const isAllowed = (userId, groupId, allowedUsers, allowedGroups) =>
  allowedUsers.has(userId) || allowedGroups.has(groupId);

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
    if (!isAllowed(userId, groupId, allowedUsers, allowedGroups)) {
      continue;
    }

    renderCodeBoxes(post);
  }

  if (typeof $ !== "function") {
    return;
  }

  const previewEvents = $(document);
  previewEvents.off(".tehRenderPostHtml");

  const userId = String(window.UserID ?? "");
  const groupId = String(window.GroupID ?? "");
  if (!isAllowed(userId, groupId, allowedUsers, allowedGroups)) {
    return;
  }

  previewEvents.on("pun_preview.tehRenderPostHtml", () => {
    window.setTimeout(() => {
      const preview = document.getElementById("post-preview");
      if (!preview) {
        return;
      }

      renderCodeBoxes(preview);
    }, 0);
  });
};

export default renderPostHtml;
