import { registerPostScripts } from "../helpers/post-context";
import { renderLocalPost } from "../helpers/render-local-post";

const footerScript = document.currentScript;
const footerUrl =
  (footerScript instanceof HTMLScriptElement && footerScript.src) ||
  document.baseURI;
const HTML_MARKER = "<!-- HTML -->";
/** @typedef {"trusted" | "local"} RenderMode */
/**
 * @typedef {object} RenderPostHtmlOptions
 * @property {string} [workerUrl] Hosted URL of the post worker.
 * @property {(string | number)[]} [fullAccessGroupId] Groups with unrestricted HTML and JavaScript access.
 * @property {(string | number)[]} [scopedAccessGroupId] Groups with post-local rendering access.
 * @property {(string | number)[]} [full] Previous name for fullAccessGroupId.
 * @property {(string | number)[]} [scoped] Previous name for scopedAccessGroupId.
 * @property {(string | number)[]} [groupIds] Previous name for fullAccessGroupId.
 * @property {(string | number)[]} [localGroupIds] Previous name for scopedAccessGroupId.
 */

let revision = 0;
let localQueue = Promise.resolve();

/** @param {URL} edit @returns {Promise<string | null>} */
const editedGroup = async (edit) => {
  const id = edit.searchParams.get("id");
  if (!id || !/^\d+$/.test(id)) {
    return null;
  }

  const response = await fetch(`/viewtopic.php?pid=${id}`, {
    mode: "same-origin"
  });
  if (!response.ok) {
    return null;
  }

  // The template keeps all downloaded markup, including scripts, inert.
  const page = document.createElement("template");
  page.innerHTML = await response.text();
  const post = page.content.querySelector(`.post[id="p${id}"]`);
  if (!post || post.closest(".post-content, #post-preview")) {
    return null;
  }

  return post.getAttribute("data-group-id");
};

/** @returns {Promise<string | null>} */
const previewGroup = async () => {
  const page = new URL(location.href);
  if (page.pathname === "/edit.php") {
    return editedGroup(page);
  }

  const forms = [...document.forms].filter((form) =>
    form.elements.namedItem("req_message")
  );
  if (forms.length !== 1) {
    return null;
  }

  const action = new URL(forms[0].action, location.href);
  if (action.origin !== location.origin) {
    return null;
  }

  if (action.pathname === "/edit.php") {
    return editedGroup(action);
  }

  if (action.pathname !== "/post.php") {
    return null;
  }

  return String(window.GroupID ?? "");
};

/**
 * @param {Element} container
 * @param {RenderMode} mode
 * @param {string} workerUrl
 * @param {number} run
 */
const renderCodeBoxes = (container, mode, run, workerUrl) => {
  for (const code of container.querySelectorAll(
    ".post-content .code-box pre"
  )) {
    const box = code.closest(".code-box");
    if (!box || code.closest(".quote-box, blockquote, [data-teh-local-post]")) {
      continue;
    }

    if (
      container.id !== "post-preview" &&
      code.closest(".post, #post-preview") !== container
    ) {
      continue;
    }

    const source = code.textContent.trimStart();
    if (!source.startsWith(HTML_MARKER)) {
      continue;
    }

    const html = source.slice(HTML_MARKER.length).trimStart();
    if (mode === "trusted") {
      const range = document.createRange();
      range.selectNode(box);
      const fragment = range.createContextualFragment(html);
      registerPostScripts(fragment);
      box.replaceWith(fragment);
      continue;
    }

    localQueue = localQueue.then(async () => {
      if (
        run !== revision ||
        !box.isConnected ||
        code.textContent.trimStart() !== source
      ) {
        return;
      }

      try {
        const result = await renderLocalPost(html, workerUrl);
        if (
          run === revision &&
          box.isConnected &&
          code.textContent.trimStart() === source
        ) {
          // Some previews sit inside the forum editor form. Post controls
          // must not submit or add fields to that surrounding form.
          if (box.closest("form")) {
            for (const control of result.querySelectorAll(
              "button, fieldset, input, output, select, textarea"
            )) {
              control.setAttribute("form", "");
            }
          }
          box.replaceWith(result);
        }
      } catch {
        if (
          run === revision &&
          box.isConnected &&
          code.textContent.trimStart() === source &&
          !box.querySelector(".teh-post-render-error")
        ) {
          box.insertAdjacentHTML(
            "afterbegin",
            '<p class="teh-post-render-error">Не удалось отобразить HTML. Исходный код сохранён ниже.</p>'
          );
        }
      }
    });
  }
};

/**
 * Renders marked forum blocks according to their author's access level.
 * @param {RenderPostHtmlOptions} [options]
 */
const renderPostHtml = (options = {}) => {
  const {
    fullAccessGroupId = options.full ?? options.groupIds ?? [],
    scopedAccessGroupId = options.scoped ?? options.localGroupIds ?? []
  } = options;
  const workerUrl =
    options.workerUrl ?? new URL("teh.post-worker.js", footerUrl).href;
  const run = ++revision;
  const fullGroups = new Set(fullAccessGroupId.map(String).filter(Boolean));
  const scopedGroups = new Set(scopedAccessGroupId.map(String).filter(Boolean));

  /** @param {string | null} group @returns {RenderMode | null} */
  const modeFor = (group) => {
    if (group && fullGroups.has(group)) {
      return "trusted";
    }

    if (group && scopedGroups.has(group)) {
      return "local";
    }

    return null;
  };

  for (const post of document.querySelectorAll(".post[data-group-id]")) {
    if (post.closest(".post-content, #post-preview")) {
      continue;
    }

    const mode = modeFor(post.getAttribute("data-group-id"));
    if (mode) {
      renderCodeBoxes(post, mode, run, workerUrl);
    }
  }

  if (typeof $ !== "function") {
    return;
  }

  const events = $(document);
  events.off(".tehRenderPostHtml");
  if (!fullGroups.size && !scopedGroups.size) {
    return;
  }

  let previewRevision = 0;
  events.on("pun_preview.tehRenderPostHtml", () => {
    const attempt = ++previewRevision;
    window.setTimeout(async () => {
      const preview = document.getElementById("post-preview");
      if (!preview || preview.closest(".post-content, [data-teh-local-post]")) {
        return;
      }

      const mode = modeFor(await previewGroup().catch(() => null));
      if (
        mode &&
        attempt === previewRevision &&
        run === revision &&
        preview.isConnected
      ) {
        renderCodeBoxes(preview, mode, run, workerUrl);
      }
    }, 0);
  });
};

export default renderPostHtml;
