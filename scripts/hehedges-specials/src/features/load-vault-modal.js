import "dialog-closedby-polyfill";

import { handleError } from "@teh/utils";
import { executeScripts, fetchVault, VAULT_MODAL_HTML } from "../helpers/vault";

/**
 * Opens personal pages from vault buttons in a modal.
 *
 * @returns {void}
 */
const loadVaultModal = () => {
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
        if (page) {
          page.dataset.href = dataHref;
        }

        executeScripts(modal, content);
      } catch (error) {
        handleError("hehedges-specials/loadVaultModal", error);
      } finally {
        modal.dataset.ready = "";
      }
    });
  });
};

export default loadVaultModal;
