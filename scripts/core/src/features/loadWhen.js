/**
 * Resolves the forum id on a new-topic page (`post.php?fid=…`).
 *
 * @returns {number | null}
 */
const getPostForumId = () => {
  const newPost = document.getElementById("pun-post");
  if (newPost?.dataset.forumId) {
    return Number(newPost.dataset.forumId);
  }

  const fid = new URLSearchParams(window.location.search).get("fid");
  return fid ? Number(fid) : null;
};

/**
 * Loads an external script only on new-topic pages in the selected forums.
 *
 * @param {object} options
 * @param {number[]} options.forums Forum ids where the script should load.
 * @param {string} options.src URL of the script to load.
 * @param {() => void} [options.onload] Called after the script has loaded.
 * @returns {HTMLScriptElement | null}
 */
const loadWhen = ({ forums, src, onload }) => {
  const anchor = document.currentScript;
  const newPost = document.getElementById("pun-post");
  const forumId = getPostForumId();

  if (
    !newPost ||
    forumId == null ||
    !forums.includes(forumId) ||
    typeof src !== "string" ||
    !src
  ) {
    return null;
  }

  const script = document.createElement("script");
  script.src = src;
  if (onload) {
    script.addEventListener("load", onload, { once: true });
  }

  if (anchor?.parentNode) {
    anchor.parentNode.insertBefore(script, anchor.nextSibling);
  } else {
    document.head.append(script);
  }

  return script;
};

export default loadWhen;
