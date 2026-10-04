"use strict";

import characterVault from "./features/character-vault.js";
import describeCharacter from "./features/describe-character.js";

export { characterVault, describeCharacter };

// Usage:
// teh.characterVault(document.querySelector(".main.pages"));
// const characters = await teh.loadCharacters();
// const description = teh.describeCharacter(characters["Name"]);
