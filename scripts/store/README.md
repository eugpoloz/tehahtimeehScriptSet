# Store

Catalog and cart controls for the store markup in
`hehedges-backups/posts/5805_store.txt`.

Load core and configure [character loading](../../README.md#forum-setup) first.
The bundle initializes the first matching store automatically; call `teh.store()`
to initialize it explicitly.

Each catalog icon or plashka can appear in the cart once. Clicking its button
again removes it; other products can be added repeatedly.

In a profile category, put `data-icon-source` or `data-plashka-source` on the
category itself or on a nested element. For gifts, use `data-category-layout="gifts"`
on the ready-made gift article in a separate `data-group-name` section inside `data-store-source`.
Add `data-gifts-source` to the article or to a nested element that contains the
image URLs. Set `data-unit-price` on the ready-made
article. For the separate custom gift article, use the ordinary product format
with the product name and price on separate lines and `<pre data-comment="…">`
for the image field label. Set `data-output="gift"` on that field to render the gift
form in the cart. Other products use the regular cart. Use `data-output="image"` for an image URL
field with a preview in a regular cart row. For prepared profile assets, put
`data-profile-type="icon"` or `data-profile-type="plashka"` on the same
`<pre>` to use the matching preview. Checkout includes the image URL as a link.

Styles: `hehedges-backups/styles/style_cs.css`.

Profile selectors use the shared picker markup in `@teh/utils`, also used by the
character form.
