# Store

Auto-initializing catalog and cart controls for the store markup in
`hehedges-backups/posts/5805_store.txt`.

Loading the bundle initializes the first matching store automatically and
exposes the initializer as `teh.store()` for explicit reuse.

Each catalog icon or plashka can appear in the cart once. Clicking its button
again removes it; other products can be added repeatedly.

Store styles live in the `content` layer of
`hehedges-backups/styles/style_cs.css`. Classes provide styling hooks;
`data-store-*` attributes provide JavaScript hooks, and IDs connect labels,
dialogs, and popovers. Short BEM blocks (`store`, `catalog`, `cart`, and `picker`)
describe the UI.
The `store__item--added` and `store__price--coupon` modifiers represent visual
states.

Markup reuses the shared layout, spacing, scrolling, and icon utilities.
Catalog items and profile triggers extend `.button` through its custom
properties; icon-only controls use `.button-icon`.

Build with:

```sh
make store
```

The generated bundle is `dist/teh.store.iife.js`.
