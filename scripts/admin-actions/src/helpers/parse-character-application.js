import { parsePositiveId } from "./character-data";
/** @typedef {import('./character-data').AcceptanceSource} AcceptanceSource */
/** @typedef {import('../features/character-form').CharacterFormValues} CharacterFormValues */

/** @param {Element} post */
export const getPostId = (post) =>
  parsePositiveId(/^p(\d+)$/.exec(post.id)?.[1]);

/** The global post number remains 1 only for the real opening post. @param {Document} doc */
export const findOpeningPost = (doc) =>
  [...doc.querySelectorAll(".post")].find(
    (post) => post.querySelector("h3 strong")?.textContent?.trim() === "1"
  );

/** Preserve structured intro lines without depending on layout/innerText. @param {Element} element */
const linesFrom = (element) => {
  const clone = /** @type {Element} */ (element.cloneNode(true));
  for (const br of clone.querySelectorAll("br")) {
    br.replaceWith("\n");
  }
  return (clone.textContent || "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
};

/** Extract only the card heading, intro and FC, never narrative biography. @param {Element} post @param {AcceptanceSource} source @returns {{values: CharacterFormValues, notes: string[], errors: string[]}} */
export const parseCharacterApplication = (post, source) => {
  const npc = source.mode === "npc";
  /** @type {import('../features/character-form').Character} */
  const character = {
    anketa: npc ? source.postId : source.topicId,
    who: [],
    affiliations: []
  };
  const notes = [
    npc
      ? "Проверьте гендер, принадлежность и проклятие."
      : "Проверьте основной профиль, гендер, принадлежность и проклятие."
  ];
  const errors = [];
  let name = "";
  if (!npc) {
    name =
      post.querySelector(".post-author .pa-author a")?.textContent?.trim() ||
      "";
    let profileId = parsePositiveId(post.getAttribute("data-user-id"));
    const profileLink = post
      .querySelector(".post-links .profile a")
      ?.getAttribute("href");
    if (profileId === null && profileLink) {
      profileId = parsePositiveId(
        new URL(profileLink, location.href).searchParams.get("id")
      );
    }

    character.id = profileId ?? "";
  }

  const cards = post.querySelectorAll(".post-content .hehe-charcard");
  if (cards.length !== 1) {
    errors.push(
      "Не удалось выбрать карточку персонажа. Заполните поля вручную."
    );
    return { values: { name, character }, notes, errors };
  }

  const card = cards[0];
  const main = card.querySelector(".card__main");
  const heading = main?.querySelector(".heading");
  if (npc) {
    name = heading?.querySelector(".title")?.textContent?.trim() || "";
  }

  const fullRussianName =
    heading?.querySelector(":scope > p strong")?.textContent?.trim() || "";
  const russianNameWords = fullRussianName.split(/\s+/);
  character.ru = russianNameWords[0];
  if (russianNameWords.length > 1) {
    character.ru += ` ${russianNameWords[russianNameWords.length - 1]}`;
  }

  const intro = [...(main?.children || [])].find(
    (child) => child.tagName === "P"
  );
  const lines = intro ? linesFrom(intro) : [];
  const birthDates = lines.join(" ").match(/\b\d{2}\.\d{2}\.\d{4}\b/g) || [];
  if (birthDates.length === 1) {
    character.dob = birthDates[0];
  }

  const natureTerms = [
    { value: "human", pattern: /(?:^|[^а-я])человек(?:$|[^а-я])/i },
    { value: "hybrid", pattern: /(?:^|[^а-я])полукровка(?:$|[^а-я])/i },
    { value: "creature", pattern: /(?:^|[^а-я])существо(?:$|[^а-я])/i }
  ];
  const magicTerms = [
    { value: "magician", pattern: /(?:^|[^а-я])волшебни[кц][а]?(?:$|[^а-я])/i },
    { value: "hedgewitch", pattern: /(?:^|[^а-я])хедж[-–—]ведьма(?:$|[^а-я])/i }
  ];
  const terms = [...natureTerms, ...magicTerms];
  const statusIndex = lines.findIndex((line) =>
    terms.some((term) => term.pattern.test(line))
  );
  if (statusIndex !== -1) {
    const statusLine = lines[statusIndex];
    const natures = natureTerms.filter((term) => term.pattern.test(statusLine));
    const magic = magicTerms.filter((term) => term.pattern.test(statusLine));
    const who = [];
    if (natures.length <= 1) {
      who.push(...natures.map((term) => term.value));
    } else {
      errors.push("Указано несколько типов персонажа. Выберите тип вручную.");
    }
    if (magic.length <= 1) {
      who.push(...magic.map((term) => term.value));
    } else {
      errors.push("Указано несколько видов магии. Выберите вид вручную.");
    }
    character.who = who;
    character.desc = lines.slice(statusIndex + 1).join(" ");
  }

  const fcLines = [...card.querySelectorAll(".card__aside p")]
    .map((paragraph) =>
      /^fc:\s*(.+)$/i.exec(paragraph.textContent?.trim() || "")
    )
    .filter((match) => match !== null);
  if (fcLines.length === 1) {
    character.fc = fcLines[0][1].trim();
  }

  const missing = [];
  if (!name) {
    missing.push("Name");
  }
  if (!character.ru) {
    missing.push("имя кириллицей");
  }
  if (!character.fc) {
    missing.push("FC");
  }
  if (!npc && !character.id) {
    missing.push("ID профиля");
  }
  if (!npc && !character.dob) {
    missing.push("дата рождения");
  }
  if (statusIndex === -1) {
    missing.push("кто");
  }
  if (missing.length) {
    errors.push(`Не удалось распознать: ${missing.join(", ")}.`);
  }

  return { values: { name, character }, notes, errors };
};
