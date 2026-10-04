import { getConfigFormMarkup } from "../helpers/markup";
import { isUserAdminByGroup } from "../helpers/is-admin";
import loadAssets from "../helpers/load-assets";
import { initCharacterForm } from "./character-form";

const DIALOG_ID = "accept-new-full-character-dialog";

/**
 * @typedef {object} AcceptNewFullCharacterConfig
 * @property {string} stylesUrl
 * @property {number} forumId
 */

const getCharacterDialog = () => {
  const existingDialog = document.getElementById(DIALOG_ID);
  if (existingDialog instanceof HTMLDialogElement) {
    return existingDialog;
  }

  if (!document.body) {
    return null;
  }

  document.body.insertAdjacentHTML("beforeend", getConfigFormMarkup());

  const dialog = document.getElementById(DIALOG_ID);
  if (!(dialog instanceof HTMLDialogElement)) {
    return null;
  }

  initCharacterForm(dialog);

  return dialog;
};

const showCharacterDialog = () => {
  const dialog = getCharacterDialog();
  if (!dialog || dialog.open) {
    return;
  }

  dialog.showModal();
};

/** @param {AcceptNewFullCharacterConfig} config */
const acceptNewFullCharacter = (config) => {
  if (
    !config ||
    typeof config.stylesUrl !== "string" ||
    !config.stylesUrl ||
    typeof config.forumId !== "number"
  ) {
    return;
  }

  const { stylesUrl, forumId } = config;

  if (!isUserAdminByGroup()) {
    return;
  }

  if (
    typeof FORUM === "undefined" ||
    Number(FORUM.topic?.forum_id) !== forumId
  ) {
    return;
  }

  const topicModmenu = document.querySelector("#topic-modmenu");
  if (!topicModmenu) {
    return;
  }

  loadAssets({ stylesUrl })
    .then(() => {
      if (topicModmenu.querySelector("#accept-new-full-character")) {
        return;
      }

      topicModmenu.insertAdjacentHTML(
        "beforeend",
        `<button type="button" id="accept-new-full-character" class="button button--primary button--wide">Принять</button>`
      );

      topicModmenu
        .querySelector("#accept-new-full-character")
        ?.addEventListener("click", showCharacterDialog);
    })
    .catch((error) => {
      console.error("Could not load admin-action assets.", error);
    });
};

export default acceptNewFullCharacter;
