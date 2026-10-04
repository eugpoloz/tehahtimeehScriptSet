import { getField, getForm, getSubmitter } from "../helpers/iframe";
import { saveJournal } from "../helpers/acceptance-journal";

/** Follow the topic's own move action and verify its destination.
 * @param {import('./save-character-config').AcceptanceContext} context
 * @param {number} forumId
 */
export const moveAcceptedTopic = async (
  { input, journal, iframe },
  forumId
) => {
  const topicId = input.source.topicId;
  const doc = await iframe.load(`/viewtopic.php?id=${topicId}`);
  const currentForum = Number(doc.defaultView?.FORUM?.topic?.forum_id);
  if (currentForum === forumId) {
    journal.move = { state: "complete", forumId };
    saveJournal(journal);
    return;
  }

  if (journal.move?.state === "complete") {
    throw new Error(
      "После принятия тема перенесена в другой форум. Проверьте её вручную."
    );
  }

  const moveOption = [...doc.querySelectorAll("#mod-options option")].find(
    (option) => {
      const url = new URL(option.getAttribute("value") || "", doc.URL);
      return (
        url.pathname === "/moderate.php" &&
        Number(url.searchParams.get("move_topics")) === topicId
      );
    }
  );
  if (!moveOption) {
    throw new Error(
      "Не найдена команда переноса этой темы. Проверьте права администратора."
    );
  }

  const moveDoc = await iframe.load(moveOption.getAttribute("value") || "");
  const form = getForm(moveDoc, "form:has(input[name=move_topics_to])");
  if (Number(getField(form, "topics").value) !== topicId) {
    throw new Error("Форма переноса относится к другой теме.");
  }

  getField(form, "move_to_forum").value = String(forumId);
  const redirect = /** @type {HTMLInputElement} */ (
    getField(form, "with_redirect")
  );
  redirect.checked = false;
  journal.move = { state: "pending", forumId };
  saveJournal(journal);
  await iframe.submit(form, getSubmitter(form, "move_topics_to"), {
    move_to_forum: String(forumId),
    with_redirect: null
  });
  const result = await iframe.load(`/viewtopic.php?id=${topicId}`);
  if (Number(result.defaultView?.FORUM?.topic?.forum_id) !== forumId) {
    throw new Error(
      "Перенос темы не подтверждён. Продолжение проверит её форум перед повторной попыткой."
    );
  }

  journal.move.state = "complete";
  saveJournal(journal);
};
