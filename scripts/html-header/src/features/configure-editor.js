import editorConfig from "../config/editor";

/**
 * @typedef {object} EditorTag
 * @property {string} name
 * @property {() => void} onclick
 */

/**
 * @typedef {object} EditorConfig
 * @property {string[]} fonts
 * @property {Record<string, EditorTag>} tags
 */

/**
 * Adds custom fonts and tags to the forum editor when it is available.
 *
 * @param {Partial<EditorConfig>} [config]
 * @returns {void}
 */
function configureEditor({
  fonts = editorConfig.fonts,
  tags = editorConfig.tags
} = editorConfig) {
  if (!FORUM.editor || !FORUM.set) {
    return;
  }

  FORUM.set("editor.font.fonts", [...FORUM.editor.font.fonts, ...fonts]);

  for (const [id, tag] of Object.entries(tags)) {
    FORUM.set(`editor.addition.tags.${id}`, tag);
  }
}

export default configureEditor;
