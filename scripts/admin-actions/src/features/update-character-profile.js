import { getField, getForm, getSubmitter } from "../helpers/iframe";
import { snapshot } from "../helpers/character-data";
import { saveJournal } from "../helpers/acceptance-journal";
import { getProfileFields } from "../helpers/acceptance-templates";
/** @typedef {import('./save-character-config').AcceptanceContext} AcceptanceContext */

/** @param {HTMLFormElement} form @returns {Record<string, string>} */
const readProfileFields = (form) =>
  Object.fromEntries(
    [
      ...form.querySelectorAll(
        'input[name^="form[fld"], textarea[name^="form[fld"]'
      )
    ].map((element) => {
      const field = /** @type {HTMLInputElement | HTMLTextAreaElement} */ (
        element
      );
      return [field.name, field.value];
    })
  );

/** Assign the character group, using the membership submitter rather than ban/delete controls. @param {AcceptanceContext} context @param {number} groupId */
export const updateCharacterGroup = async (
  { input, journal, iframe },
  groupId
) => {
  const url = `/profile.php?section=admin&id=${input.character.id}`;
  const doc = await iframe.load(url);
  const form = getForm(doc, "form#profile11");
  const group = getField(form, "group_id");
  const expected = journal.group?.expected || String(groupId);
  if (group.value === expected) {
    journal.group = {
      state: "complete",
      before: journal.group?.before || group.value,
      expected
    };
    saveJournal(journal);
    return;
  }

  if (
    journal.group &&
    (journal.group.state === "complete" || group.value !== journal.group.before)
  ) {
    throw new Error(
      "Группа профиля изменилась после предыдущей попытки. Проверьте её вручную."
    );
  }

  journal.group = { state: "pending", before: group.value, expected };
  saveJournal(journal);
  group.value = expected;
  await iframe.submit(form, getSubmitter(form, "update_group_membership"), {
    group_id: expected
  });
  const verified = getForm(await iframe.load(url), "form#profile11");
  if (getField(verified, "group_id").value !== expected) {
    throw new Error(
      "Перенос профиля в группу не подтверждён. Нажмите «Продолжить принятие»."
    );
  }

  journal.group.state = "complete";
  saveJournal(journal);
};

/** Save the application/name/age, collection link and default icon/plaque, preserving every other field. @param {AcceptanceContext} context */
export const updateCharacterProfile = async ({ input, journal, iframe }) => {
  const url = `/profile.php?section=fields&id=${input.character.id}`;
  const doc = await iframe.load(url);
  const form = getForm(doc, "form#profile8");
  const current = readProfileFields(form);
  const address = /** @type {NonNullable<typeof journal.collection>} */ (
    journal.collection
  ).address;
  const values = getProfileFields(input, address);
  for (const name of Object.keys(values)) {
    getField(form, name);
  }

  const desired = journal.profile?.expected || values;
  const selected = Object.fromEntries(
    Object.keys(values).map((name) => [name, current[name]])
  );
  if (snapshot(selected) === snapshot(desired)) {
    journal.profile = {
      state: "complete",
      before: journal.profile?.before || selected,
      expected: desired
    };
    saveJournal(journal);
    return;
  }
  if (
    journal.profile &&
    (journal.profile.state === "complete" ||
      snapshot(selected) !== snapshot(journal.profile.before))
  ) {
    throw new Error(
      "Поля профиля изменились после предыдущей попытки. Проверьте их вручную."
    );
  }

  journal.profile = { state: "pending", before: selected, expected: desired };
  saveJournal(journal);
  for (const [name, value] of Object.entries(desired)) {
    getField(form, name).value = value;
  }
  await iframe.submit(form, getSubmitter(form, "update"), desired);
  const verified = getForm(await iframe.load(url), "form#profile8");
  if (
    snapshot(readProfileFields(verified)) !==
    snapshot({ ...current, ...desired })
  ) {
    throw new Error(
      "Сохранение полей профиля не подтверждено. Нажмите «Продолжить принятие»."
    );
  }

  journal.profile.state = "complete";
  saveJournal(journal);
};
