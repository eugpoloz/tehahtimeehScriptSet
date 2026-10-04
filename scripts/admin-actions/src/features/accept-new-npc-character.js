import { findCharacterByApplication } from "../helpers/character-data";
import { readJournal } from "../helpers/acceptance-journal";
import { getPostId } from "../helpers/parse-character-application";
import { saveCharacterConfig } from "./save-character-config";
/** @typedef {import('./character-acceptance').CharacterAcceptance} CharacterAcceptance */
/** @typedef {import('../helpers/character-data').AcceptanceSource} AcceptanceSource */

/** Per-post NPC path; access/topic gating is handled by the public initializer. @param {CharacterAcceptance} acceptance @param {number} topicId */
export const acceptNewNpcCharacter = async (acceptance, topicId) => {
  const opening = await acceptance.openingPost(topicId);
  const openingId = getPostId(opening);
  if (openingId === null) {
    throw new Error("Не удалось определить ID первого поста темы NPC.");
  }

  /** @type {{button: HTMLButtonElement, source: AcceptanceSource}[]} */
  const buttons = [];
  const updateButtons = () => {
    const characters = window.characters || {};
    for (const { button, source } of buttons) {
      const existing = findCharacterByApplication(characters, source);
      const journal = readJournal(source);
      // Without anketa, the journal retains the link from this post to the saved NPC.
      const savedWithoutApplication =
        journal?.configState === "complete" &&
        journal.input.character.anketa == null &&
        Object.prototype.hasOwnProperty.call(characters, journal.input.name) &&
        characters[journal.input.name].id == null &&
        characters[journal.input.name].anketa == null;
      const added = Boolean(existing || savedWithoutApplication);
      button.disabled = added;
      button.textContent = added ? "В конфиге" : "Добавить NPC";
    }
  };
  for (const post of document.querySelectorAll(".post")) {
    const postId = getPostId(post);
    if (
      postId === null ||
      postId === openingId ||
      post.querySelector("[data-accept-npc]")
    ) {
      continue;
    }

    const links = post.querySelector(".post-links ul");
    if (!links) {
      continue;
    }

    const markup = `<li class="pl-accept-npc"><button type="button" class="button" data-accept-npc>Добавить NPC</button></li>`;
    const deleteLink = links.querySelector(".pl-delete");
    if (deleteLink) {
      deleteLink.insertAdjacentHTML("beforebegin", markup);
    } else {
      links.insertAdjacentHTML("beforeend", markup);
    }
    const button = /** @type {HTMLButtonElement} */ (
      post.querySelector("[data-accept-npc]")
    );
    const source = /** @type {AcceptanceSource} */ ({
      mode: "npc",
      topicId,
      postId
    });
    buttons.push({ button, source });
    button.addEventListener("click", () => {
      try {
        acceptance.open(
          post,
          source,
          [
            {
              id: "config",
              title: "Добавление персонажа в конфиг",
              run: saveCharacterConfig
            }
          ],
          updateButtons
        );
      } catch (error) {
        console.error("[teh/accept-npc]", error);
        alert(
          error instanceof Error
            ? error.message
            : "Не удалось открыть форму NPC."
        );
      }
    });
  }
  updateButtons();
};
