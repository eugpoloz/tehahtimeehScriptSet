import { isUserAdmin, isUserAdminByGroup } from "../helpers/is-admin";
import { isAcceptanceWorker } from "../helpers/iframe";
import { parsePositiveId } from "../helpers/character-data";
import { getPostId } from "../helpers/parse-character-application";
import { getCharacterAcceptance } from "./character-acceptance";
import { acceptNewNpcCharacter } from "./accept-new-npc-character";
import { saveCharacterConfig } from "./save-character-config";
import { updateCharacterCollection } from "./update-character-collection";
import {
  updateCharacterGroup,
  updateCharacterProfile
} from "./update-character-profile";
import { postAcceptanceLetter } from "./post-acceptance-letter";
import { moveAcceptedTopic } from "./move-accepted-topic";
import { readTopicJournal } from "../helpers/acceptance-journal";
import { escapeHtml } from "@teh/utils";

/**
 * @typedef {object} AcceptNewFullCharacterConfig
 * @property {string} [stylesUrl] Optional extra stylesheet; form styles are included in style_cs.css.
 * @property {number} forumId Regular-character application forum.
 * @property {number} [npcTopicId] Defaults to 30.
 * @property {number} [characterGroupId] Defaults to 5.
 * @property {number} [acceptedForumId] Defaults to 11.
 */

const getTopicId = () => {
  const currentId = parsePositiveId(
    new URL(location.href).searchParams.get("id")
  );
  if (currentId !== null) {
    return currentId;
  }

  const permalink = document
    .querySelector(".post .permalink")
    ?.getAttribute("href");
  if (!permalink) {
    return null;
  }

  return parsePositiveId(
    new URL(permalink, location.href).searchParams.get("id")
  );
};

/** Initialize regular/NPC controls explicitly; importing the bundle starts nothing. @param {AcceptNewFullCharacterConfig} config */
const acceptNewFullCharacter = async (config) => {
  if (
    isAcceptanceWorker() ||
    !isUserAdminByGroup() ||
    typeof FORUM === "undefined" ||
    !FORUM.topic
  ) {
    return;
  }
  if (
    !config ||
    typeof config.forumId !== "number" ||
    parsePositiveId(config.forumId) === null ||
    (config.npcTopicId !== undefined &&
      (typeof config.npcTopicId !== "number" ||
        parsePositiveId(config.npcTopicId) === null)) ||
    (config.characterGroupId !== undefined &&
      (typeof config.characterGroupId !== "number" ||
        parsePositiveId(config.characterGroupId) === null)) ||
    (config.acceptedForumId !== undefined &&
      (typeof config.acceptedForumId !== "number" ||
        parsePositiveId(config.acceptedForumId) === null)) ||
    (config.stylesUrl !== undefined &&
      (typeof config.stylesUrl !== "string" || !config.stylesUrl.trim()))
  ) {
    return;
  }

  const npcTopicId = config.npcTopicId ?? 30;
  const topicId = getTopicId();
  if (topicId === null) {
    return;
  }

  try {
    const acceptedForumId = config.acceptedForumId ?? 11;
    const isApplication = Number(FORUM.topic.forum_id) === config.forumId;
    if (
      topicId !== npcTopicId &&
      !isApplication &&
      (Number(FORUM.topic.forum_id) !== acceptedForumId ||
        !readTopicJournal(topicId))
    ) {
      return;
    }

    if (!(await isUserAdmin())) {
      return;
    }

    const acceptance = await getCharacterAcceptance(config);
    if (topicId === npcTopicId) {
      await acceptNewNpcCharacter(acceptance, topicId);
      return;
    }

    const menu = document.querySelector("#topic-modmenu");
    if (!menu || menu.querySelector("#accept-new-full-character")) {
      return;
    }

    menu.insertAdjacentHTML(
      "beforeend",
      `<button type="button" id="accept-new-full-character" class="button button--primary button--wide">${isApplication ? "Принять" : "Проверить принятие"}</button>`
    );
    const button = /** @type {HTMLButtonElement} */ (
      menu.querySelector("#accept-new-full-character")
    );
    button.addEventListener("click", async () => {
      try {
        const post = await acceptance.openingPost(topicId);
        const postId = getPostId(post);
        if (postId === null) {
          throw new Error("Не удалось определить ID анкеты.");
        }

        acceptance.open(post, { mode: "regular", topicId, postId }, [
          {
            id: "config",
            title: "Добавление персонажа в конфиг",
            run: saveCharacterConfig
          },
          {
            id: "collection",
            title: "Создание / обновление личной страницы",
            run: updateCharacterCollection
          },
          {
            id: "group",
            title: "Перенос профиля в группу «Персонажи»",
            run: (context) =>
              updateCharacterGroup(context, config.characterGroupId ?? 5)
          },
          {
            id: "profile",
            title: "Заполнение полей профиля",
            run: updateCharacterProfile
          },
          {
            id: "letter",
            title: "Публикация письма о принятии",
            run: postAcceptanceLetter
          },
          {
            id: "move",
            title: "Перенос анкеты в принятые",
            run: (context) => moveAcceptedTopic(context, acceptedForumId)
          }
        ]);
      } catch (error) {
        console.error("[teh/accept-character]", error);
        alert(
          error instanceof Error ? error.message : "Не удалось открыть анкету."
        );
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось загрузить данные для принятия персонажа.";
    document
      .querySelector("#topic-modmenu")
      ?.insertAdjacentHTML(
        "beforeend",
        `<p role="alert">${escapeHtml(message)}</p>`
      );
    console.error("[teh/accept-character]", error);
  }
};

export default acceptNewFullCharacter;
