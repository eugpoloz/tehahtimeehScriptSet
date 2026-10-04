# Admin actions

Build with `make admin-actions`. Load `dist/teh.core.iife.js` before
`dist/teh.admin-actions.iife.js`.

Initialize after the topic DOM is ready:

```js
await teh.acceptNewFullCharacter({
  forumId: 10,
  npcTopicId: 30
});
```

`forumId` is required; `npcTopicId` defaults to 30, `characterGroupId` to 5
and `acceptedForumId` to 11.
`stylesUrl` is optional for an
extra stylesheet. The editor and acceptance dialog use form styles and utilities
from `hehedges-backups/styles/style_cs.css`.
Load core first and configure its character JSON URL in the forum header. Loading this bundle alone does not initialize any actions.

For group 1, the initializer confirms access to `/admin_index.php` and the page's
admin marker before adding controls. It adds «Принять» in the configured regular application
forum and «Добавить NPC» to topic-30 posts except its actual opening post. Post
numbers identify the opening post across pagination. Existing NPCs have a
disabled «В конфиге» button, matched by post ID only to entries without `id`.
NPC buttons appear immediately before «Удалить» in the post links.
The initializer skips its worker iframe, and returns a promise when setup ends.

The dialog prefills the card heading, introductory lines and FC. Regular names
and profile IDs come from the opening post's author; NPC names come from the
card. Russian names use the first and last words of the full card name; a
single-word name stays unchanged. All prefilled names remain editable.
Unrecognized fields are left for review. Drafts survive closing/reopening
and switching posts; reset restores the source's prefilled values.

Regular acceptance saves the character config, creates or updates the collection,
assigns the character group, fills the profile, posts the acceptance letter and
moves the application to `acceptedForumId` without a redirect. Each step is
verified before continuing; final success requires verifying the destination.
NPCs save only the config.
NPCs need no profile ID or DOB; if DOB is supplied it must be a real
calendar date. Regular characters require DOB; age uses `GAME_LATEST_DATE`
provided by the forum header. Application IDs are prefilled from the source
topic/post. Regular characters must keep the source topic ID. NPC anketa remains
optional in both acceptance and the shared editor; when supplied during
acceptance, it must match the selected post. The existing browser journal marks
that post as added even when its NPC is saved without anketa. Main-profile references are checked against fresh config before writing.

Saving stays in a hidden same-origin iframe. It reads the latest JSON from the
administrative file derived from `teh.charactersConfigUrl`, uses the inspected
`input[type="submit"][name="save"]`, preserves form action/hidden controls and
reopens the file to verify the whole result. It preserves unknown data, Cyrillic
and characters unsupported by Windows-1251. Verified config replaces
`window.characters` and `teh.charactersPromise`; NPC buttons update afterward.
The save overlay blocks edits and duplicate starts while the operation runs.

For a main profile, the dialog prefills the collection address from the English
name: lowercase, accents removed, spaces/symbols replaced by underscores, up to
48 characters. Collection title checks decode the numeric character references
used by Windows-1251 forms. Review or edit the address before starting; it must use
1–48 letters, digits, hyphens or underscores. The new page uses the English name,
tag `vault`, the default viewing permissions and starter coupons/icons/plaques.
An occupied address is never overwritten with starter content.

For a twin, resolve the main collection from the main profile's stored link,
falling back to one exact name/tag match in the administrative page list. Append
the twin's gift section and award one icon and one plaque coupon. Preserve
existing quantities, reusable metadata, purchases, page settings and permissions.

Profile updates use the group-membership submitter, then save the application
link/name/in-game age, collection link and default icon/plaque with empty text.
Other profile fields stay unchanged. Form-data overrides keep submitted values
from being replaced by editor/widget submit handlers. Accents and other Unicode
in generated HTML use character references for Windows-1251 forms.

The browser-local journal stores reviewed input and the before/expected values
for config, collection, group, profile, letter and topic-move writes, never
passwords or form tokens.
Full config and collection snapshots are retained only while their writes are
pending. Completed records keep the character input and collection address/title
needed for recovery; older completed records are compacted when next saved.
«Продолжить принятие» reopens the forms and verifies previous results before
continuing. Matching saved results need no second POST; unchanged pre-write data
permits retry; conflicting changes stop for manual review. Twin retries never
blindly award coupons again. NPCs retain «Проверить сохранение» for config recovery.
Reload restores the operation in the same browser, including after the topic
has moved to the accepted forum. Older config-only journals
can continue through the new steps after reviewing the collection address.

The letter uses the exact shared BBCode plus the main-profile or twin modifier.
Submission preserves the logged-in author and overrides masks/drafts added by
submit handlers. Verification checks the post's author and its raw BBCode through
the edit form; the journal retains the verified post ID and permalink. Known
post IDs are verified directly. Without a post ID, retries search topic
pagination; an approved resend still reads the topic before sending.
An unconfirmed letter stops acceptance. Open the linked topic and check it;
only if the letter is absent,
check «Проверил тему: письмо не опубликовано…» and continue to permit resending.
The script checks once more before that POST. Edited/deleted verified letters
and multiple matches stop for manual review.

The final move follows this topic's actual moderation URL, preserves the source
forum and hidden topic ID, and submits with `move_topics_to`. `with_redirect` is
excluded from the submitted data. A retry checks the topic's actual forum first;
a completed move needs no second POST.

`hehedges-backups/forms/html_footer.html` loads this bundle for administrators on
topic pages using the versioned `teh.adminActionsScriptUrl` from the header, then
calls the initializer with forum 10/topic 30. Upload the new bundle before
publishing the header/footer changes. The saved backup profile is used only for
read-only markup inspection during development, never for automatic live saves.

## Shared character form

Loading the bundle exposes the form API without adding acceptance buttons or
starting a workflow. Both the acceptance dialog and character editor use these
same fields and controls. Their styles live in
`hehedges-backups/styles/style_cs.css`; the markup contains no inline CSS.
Form styles use `char-form` and `char-form__*` classes; acceptance
dialog styles use `char-accept` and `char-accept__*`.

```js
form.insertAdjacentHTML("afterbegin", teh.getCharacterFormMarkup());
const characterForm = teh.initCharacterForm(form, {
  onSubmit: async ({ name, character }) => {
    await saveCharacter(name, character);
  },
  onChange: updateSaveButton
});
characterForm.fill(name, existingCharacter);
```

`getCharacterFormMarkup()` returns a fieldset. Supply your own
`<form autocomplete="off" novalidate>`, dialog, heading and action buttons.
A `#char-form-reset` button restores the supplied values; an optional `[role="status"]`
element displays validation or submission errors. Use one character form per
page because its field IDs are fixed.

`initCharacterForm(form, options?)` returns:

- `fill(name?, character?)`: set the values and reset baseline. No arguments
  starts a blank regular character; omitting `character.id` selects NPC mode.
- `reset()`: restore that baseline, including every checkbox.
- `isDirty()`: whether the fields differ from the baseline.
- `read()`: validate and return `{ name, character }`; throw on invalid input.
- `refreshMainProfiles()`: rebuild suggestions from `window.characters`.
- `focus()`: focus the English name field.
- `getDraft()` / `restoreDraft(draft)`: keep raw edits, including empty/invalid
  fields and checkbox state, while preserving the reset baseline.

`onSubmit(values)` runs only after validation and may return a promise. The
caller owns saving, busy overlays and post-save refresh. `onChange()` runs after
character-field edits, filling or reset. Controls outside the shared fieldset do
not clear character-form status or trigger `onChange()`. Edited characters retain unknown properties and
unknown `who`/affiliation values. NPC anketa is optional and links to a post;
regular characters require profile and topic IDs. DOB remains optional here.

The character editor loads the bundle from `teh.adminActionsScriptUrl` unless
its form API is already present. After uploading `dist/teh.admin-actions.iife.js`,
set that property to the versioned forumstatic URL in the forum header, after
core, before publishing the updated editor. Change that URL's `?v=` when
publishing later admin-actions builds.
