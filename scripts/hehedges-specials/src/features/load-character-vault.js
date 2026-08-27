import "dialog-closedby-polyfill";

import { handleError } from "@teh/utils";
import {
  fetchVault,
  initializeCharacterVault,
  VAULT_MODAL_HTML
} from "../helpers/vault";

/** @typedef {import("../helpers/vault").CharacterVaultConfig} CharacterVaultConfig */

const initializedButtons = new WeakSet();
const initializedPages = new WeakSet();

/**
 * Initializes a directly opened personal vault page.
 *
 * @param {CharacterVaultConfig} config
 * @returns {void}
 */
export const loadCharacterVaultPage = (config) => {
  const marker = document.querySelector(
    ".main.pages [data-character-vault-page]"
  );
  const page = marker?.closest(".main.pages");
  if (!(page instanceof HTMLElement)) {
    return;
  }

  if (initializedPages.has(page)) {
    return;
  }

  initializedPages.add(page);
  initializeCharacterVault(page, config).catch((error) => {
    initializedPages.delete(page);
    handleError("hehedges-specials/loadCharacterVaultPage", error);
  });
};

/**
 * Opens personal pages from vault buttons in a modal.
 *
 * @param {CharacterVaultConfig} config
 * @returns {void}
 */
export const loadVaultModal = (config) => {
  if (Number(UserID) !== 3) {
    return;
  }

  if (!document.body) {
    return;
  }

  if (!document.getElementById("vault-modal")) {
    document.body.insertAdjacentHTML("beforeend", VAULT_MODAL_HTML);
  }

  const pageModal = /** @type {HTMLDialogElement | null} */ (
    document.getElementById("vault-modal")
  );
  const modal = /** @type {HTMLElement | null} */ (
    document.querySelector("#vault-modal .vault-modal")
  );
  if (!pageModal || !modal) {
    return;
  }

  document.querySelectorAll(".vault").forEach((button) => {
    if (initializedButtons.has(button)) {
      return;
    }

    initializedButtons.add(button);
    button.addEventListener("click", async (event) => {
      const trigger = /** @type {HTMLElement} */ (event.currentTarget);
      const dataHref = trigger.dataset.href;
      if (!dataHref) {
        return;
      }

      modal.replaceChildren();
      delete modal.dataset.ready;
      pageModal.showModal();

      try {
        const content = await fetchVault(`/pages/${dataHref}`);
        modal.replaceChildren(content);

        const page = /** @type {HTMLElement | null} */ (
          modal.querySelector(".main.pages")
        );
        if (!page) {
          throw new Error("Fetched vault content does not contain .main.pages");
        }

        page.dataset.href = dataHref;
        await initializeCharacterVault(page, config);
      } catch (error) {
        handleError("hehedges-specials/loadVaultModal", error);
      } finally {
        modal.dataset.ready = "";
      }
    });
  });
};

/**
 * Initializes direct character-vault pages and modal triggers.
 *
 * @param {CharacterVaultConfig} config
 * @returns {void}
 */
const loadCharacterVault = (config) => {
  loadCharacterVaultPage(config);
  loadVaultModal(config);
};

export default loadCharacterVault;
