import { getField, getForm, getSubmitter } from "../helpers/iframe";
import { getPostId } from "../helpers/parse-character-application";
import { parsePositiveId } from "../helpers/character-data";
import { getAcceptanceLetter } from "../helpers/acceptance-templates";
import { saveJournal } from "../helpers/acceptance-journal";
/** @typedef {{id: number, authorId: number}} TopicPost */

/** Read posts across actual topic pagination, including replies on later pages.
 * @param {import('../helpers/iframe').AcceptanceIframe} iframe
 * @param {number} topicId
 */
const readPosts = async (iframe, topicId) => {
  const pages = new Set([`/viewtopic.php?id=${topicId}`]);
  const posts = /** @type {Map<number, TopicPost>} */ (new Map());
  for (const address of pages) {
    const doc = await iframe.load(address);
    getForm(doc, "form#post");
    for (const post of doc.querySelectorAll(".post")) {
      const id = getPostId(post);
      if (id !== null) {
        posts.set(id, {
          id,
          authorId: Number(post.getAttribute("data-user-id"))
        });
      }
    }
    for (const link of doc.querySelectorAll(".pagelink a[href]")) {
      const url = new URL(link.getAttribute("href") || "", doc.URL);
      if (
        url.pathname === "/viewtopic.php" &&
        Number(url.searchParams.get("id")) === topicId
      ) {
        // Canonical page keys avoid revisiting page 1 through a different URL.
        const page = Number(url.searchParams.get("p") || 1);
        if (page > 1) {
          pages.add(`/viewtopic.php?id=${topicId}&p=${page}`);
        }
      }
    }
  }

  return [...posts.values()];
};

/** Read a known post in its source topic without crawling unrelated pages.
 * @param {import('../helpers/iframe').AcceptanceIframe} iframe
 * @param {number} topicId
 * @param {number} postId
 */
const readKnownPost = async (iframe, topicId, postId) => {
  const doc = await iframe.load(`/viewtopic.php?pid=${postId}#p${postId}`);
  const post = doc.querySelector(`.post#p${postId}`);
  if (!post) {
    return null;
  }

  const form = getForm(doc, "form#post");
  const action = new URL(form.action, doc.URL);
  if (
    action.pathname !== "/post.php" ||
    Number(action.searchParams.get("tid")) !== topicId
  ) {
    return null;
  }

  return { id: postId, authorId: Number(post.getAttribute("data-user-id")) };
};

/** Publish once; unresolved submissions require explicit review before resending.
 * @param {import('./save-character-config').AcceptanceContext} context
 */
export const postAcceptanceLetter = async ({ input, journal, iframe }) => {
  const topicId = input.source.topicId;
  const expected = getAcceptanceLetter(input);
  const previous = journal.letter;
  /** @type {TopicPost[]} */
  let posts = [];
  if (previous?.postId !== undefined && !previous.resendApproved) {
    const post = await readKnownPost(iframe, topicId, previous.postId);
    if (post) {
      posts.push(post);
    }
  } else {
    // First writes, approved resends and uncertain results need the full topic.
    posts = await readPosts(iframe, topicId);
  }
  if (previous) {
    const matches = [];
    for (const post of posts) {
      let candidate = post.id > previous.lastPostId;
      if (previous.postId !== undefined) {
        candidate = post.id === previous.postId;
      }
      if (!candidate || post.authorId !== previous.authorId) {
        continue;
      }

      const doc = await iframe.load(`/edit.php?id=${post.id}`);
      const text = getField(getForm(doc, "form#post"), "req_message").value;
      if (text.replace(/\r\n?/g, "\n") === previous.expected) {
        matches.push(post.id);
      }
    }
    if (matches.length === 1) {
      previous.postId = matches[0];
      previous.url = `/viewtopic.php?pid=${matches[0]}#p${matches[0]}`;
      previous.state = "complete";
      previous.reviewRequired = false;
      previous.resendApproved = false;
      saveJournal(journal);
      return;
    }

    if (previous.state === "complete" || matches.length > 1) {
      throw new Error(
        "Сохранённое письмо изменено, удалено или найдено несколько копий. Проверьте тему вручную."
      );
    }

    if (!previous.resendApproved) {
      previous.reviewRequired = true;
      saveJournal(journal);
      throw new Error(
        "Публикация письма не подтверждена. Проверьте тему. Повторная отправка доступна только после подтверждения ниже."
      );
    }
  }

  const doc = await iframe.load(`/viewtopic.php?id=${topicId}`);
  const form = getForm(doc, "form#post");
  const action = new URL(form.action, doc.URL);
  if (
    action.pathname !== "/post.php" ||
    Number(action.searchParams.get("tid")) !== topicId
  ) {
    throw new Error("Форма ответа относится к другой теме.");
  }

  const authorId = parsePositiveId(doc.defaultView?.UserID);
  const formUser = getField(form, "form_user").value;
  if (authorId === null || !formUser) {
    throw new Error(
      "Не удалось подтвердить автора письма. Проверьте вход в форум."
    );
  }

  getField(form, "req_message").value = expected;
  journal.letter = {
    state: "pending",
    expected,
    authorId,
    lastPostId: Math.max(0, ...posts.map((post) => post.id))
  };
  saveJournal(journal);
  const result = await iframe.submit(form, getSubmitter(form, "submit"), {
    req_message: expected,
    form_user: formUser
  });
  const resultUrl = new URL(result.URL);
  const postId = parsePositiveId(
    resultUrl.searchParams.get("pid") || resultUrl.hash.replace(/^#p/, "")
  );
  if (postId !== null) {
    journal.letter.postId = postId;
    saveJournal(journal);
  }
  // Verification also recovers a successful POST whose response omitted its permalink.
  await postAcceptanceLetter({ input, journal, iframe });
};
