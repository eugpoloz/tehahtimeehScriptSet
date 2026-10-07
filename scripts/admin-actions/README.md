# Admin actions

Administrator controls for accepting characters and adding NPCs.

Load core and configure [character loading](../../README.md#forum-setup), then
load `dist/teh.admin-actions.iife.js`. Initialize after the topic DOM is ready:

```js
await teh.acceptNewFullCharacter({
  forumId: 10,
  npcTopicId: 30
});
```

`forumId` is required. Defaults: `npcTopicId: 30`, `characterGroupId: 5`,
`acceptedForumId: 11`. Use `stylesUrl` for an extra stylesheet; the forum's form
styles live in `hehedges-backups/styles/style_cs.css`.

## Acceptance

Group-1 administrators with verified admin access get «Принять» in the application
forum and «Добавить NPC» on NPC posts except the opening post. Review the
prefilled fields before saving; drafts survive closing the dialog.

Regular acceptance saves the config, prepares the collection, assigns the group,
updates the profile, posts the acceptance letter, and moves the topic without a
redirect. NPCs save only the config. Each step is verified before continuing.

Regular characters require a profile ID, DOB, and the source topic ID; in-game age
uses `GAME_LATEST_DATE`. NPCs need no profile ID or DOB. Their application link is
optional, but must match the selected post when supplied.

Review the collection address for main profiles: 1–48 letters, digits, hyphens,
or underscores. Occupied pages are never overwritten with starter content.
Twins use the main profile's collection and receive one icon and one plaque coupon.

## Recovery

Reload in the same browser and choose «Продолжить принятие» to resume an interrupted
acceptance. Saved steps are verified before retrying; conflicting changes require
manual review. NPCs use «Проверить сохранение» for config recovery.

If the letter is unconfirmed, open the linked topic and check it. Only when it is
absent, select «Проверил тему: письмо не опубликовано…» and continue to permit
resending. Edited/deleted letters or multiple matches require manual review.

## Shared character form

The bundle also exposes the form used by acceptance and the character editor:

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

Supply a `<form autocomplete="off" novalidate>` and action buttons. An optional
`#char-form-reset` button resets values; `[role="status"]` displays errors.
Use one character form per page because field IDs are fixed.

| Method                               | Purpose                                                                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `fill(name?, character?)`            | Set values and reset baseline; no arguments starts a blank regular character, a character without `id` selects NPC mode |
| `reset()`                            | Restore baseline values                                                                                                 |
| `isDirty()`                          | Detect unsaved edits                                                                                                    |
| `read()`                             | Return validated `{ name, character }`; throw on invalid input                                                          |
| `refreshMainProfiles()`              | Refresh suggestions from `window.characters`                                                                            |
| `focus()`                            | Focus the English name                                                                                                  |
| `getDraft()` / `restoreDraft(draft)` | Preserve raw edits and the reset baseline                                                                               |

`onSubmit` runs after validation and may be async; the caller handles saving and
busy state. `onChange` runs after edits, fill, or reset. Unknown character
properties are preserved. The shared form allows missing DOB; acceptance requires
it for regular characters.

## Deployment

Upload the bundle and set `teh.adminActionsScriptUrl` to its versioned forumstatic
URL in the header after core. The character editor uses this URL to load the form
API. The forum footer loads it for administrators on topic pages and initializes
forum 10/topic 30. Bump `?v=` for subsequent builds.
