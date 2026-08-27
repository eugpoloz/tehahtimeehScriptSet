# Character vault

Build with `make character-vault`. The IIFE exposes `teh.characterVault(root)`.

Pass the `.main.pages` element for a direct personal page or for a personal
page inserted into the vault modal. If omitted, it uses the first
`.main.pages` element. The initializer loads the shared external character
data script, renders the vault interface, and reads page-specific collection
data from `[data-collection]` elements inside `root`.

The function does not initialize automatically. This keeps the script usable
only where the direct page or vault-modal loader explicitly invokes it.
