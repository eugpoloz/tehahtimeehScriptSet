/** @typedef {import("../types.js").Character} Character */

/** @param {Character} character @returns {string} */
const describeCharacter = (character) => {
  const labels = /** @type {Record<string, string>} */ ({
    magician: character.gender === "f" ? "волшебница" : "волшебник",
    hedgewitch: "хедж-ведьма",
    hybrid: "полукровка",
    creature: "существо",
    human: "человек",
    other: "???"
  });

  const who =
    character.who?.map((value) => labels[value] ?? value).join(", ") ?? "";

  let cursed = "";
  if (character.cursed) {
    cursed = `; проклят${character.gender === "f" ? "а" : ""}`;
  }

  return `${who}${cursed}`;
};

export default describeCharacter;
