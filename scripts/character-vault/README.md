# Character vault

Build with `make character-vault`. The IIFE extends `teh` with:

- `teh.characterVault(root)` initializes the character vault.
- `teh.loadCharacters()` loads and returns the external `window.characters`
  data.
- `teh.describeCharacter(character)` returns the Russian
  species/status description, including the gendered cursed marker.

Pass the `.main.pages` element for a direct personal page or for a personal
page inserted into the vault modal. If omitted, it uses the first
`.main.pages` element. The initializer loads the shared external character
data script, renders the vault interface, and reads page-specific collection
data from `[data-collection]` elements inside `root`.

The function does not initialize automatically. This keeps the script usable
only where the direct page or vault-modal loader explicitly invokes it.
