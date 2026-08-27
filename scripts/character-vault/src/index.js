"use strict";

import characterVault from "./features/character-vault.js";
import describeCharacter from "./features/describe-character.js";
import loadCharacters from "./features/load-characters.js";

export { characterVault, describeCharacter, loadCharacters };

// Usage:
// teh.characterVault(document.querySelector(".main.pages"));
// const characters = await teh.loadCharacters();
// const description = teh.describeCharacter(characters["Name"]);
