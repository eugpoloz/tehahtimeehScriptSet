import { handleError, handleLogs } from "@teh/utils";

const COUNTER_MODULE_NAME = "countPostsInTopic";

/**
 * @typedef {object} CountPostsInTopicOptions
 * @property {number[]} [forumsToTrack]
 * @property {string} [fldId]
 * @property {string} [nextFldSelector]
 * @property {boolean} [countTopicStarter]
 * @property {boolean} [debug]
 */

/**
 * @param {CountPostsInTopicOptions} [options]
 * @returns {Promise<void>}
 */
const countPostsInTopic = async ({
  forumsToTrack = [],
  fldId = "5",
  nextFldSelector = ".pa-posts",
  countTopicStarter = false,
  debug = false
} = {}) => {
  // пока что феноменально тупая версия счетчика: чисто добавляет те посты, что есть
  // TODO:
  // - обновлять счетчик автоматически при _удалении_ постов
  const COUNTER_NEW_POST_KEY = "countNewPost";

  try {
    let forumId;
    const newPost = document.getElementById("pun-post");

    // for topic thread
    if (FORUM.topic && typeof FORUM.topic === "object") {
      forumId = +FORUM.topic.forum_id; // string needs to be converted to number
    } else if (newPost) {
      const newPostForumId = newPost.dataset.forumId;
      forumId = newPostForumId ? +newPostForumId : undefined;
    }

    if (forumId === undefined || !forumsToTrack.includes(forumId)) {
      return;
    }

    // handle posting to topic as game posts
    handleLogs({
      debug,
      module: COUNTER_MODULE_NAME,
      message: "tracking this topic"
    });

    // handle form submission from topic page only
    // because editing takes place somewhere else for now, thankfully
    const postForm = document.querySelector("#pun-main.multipage #post");
    if (postForm) {
      postForm.addEventListener("submit", function (event) {
        localStorage.setItem(
          COUNTER_NEW_POST_KEY,
          String(Math.floor(Date.now() / 1000))
        ); // in seconds
        handleLogs(
          {
            debug,
            module: COUNTER_MODULE_NAME,
            message: "postForm submitted"
          },
          {
            event,
            localStorage: localStorage.getItem(COUNTER_NEW_POST_KEY)
          }
        );
      });
    }

    // handle previously set localStorage flag
    const counterNewPost = localStorage.getItem(COUNTER_NEW_POST_KEY);
    if (!counterNewPost) {
      handleLogs({
        debug,
        module: COUNTER_MODULE_NAME,
        message: "no counterNewPost, exiting"
      });
      return;
    }

    const latestPost = document.querySelector(
      countTopicStarter ? ".post.endpost" : ".post.endpost:not(.topicpost)"
    );

    if (latestPost) {
      const forumGlobals = /** @type {Record<string, unknown>} */ (
        /** @type {unknown} */ (window)
      );
      const userFieldKey = `UserFld${fldId}`;
      const userFieldValue = forumGlobals[userFieldKey];
      const initialCounter = userFieldValue ? +String(userFieldValue) : 0;
      const updatedCounter = initialCounter + 1;

      const url = `/profile.php?section=fields&id=${window.UserID}`;

      const iframeHTML = `<iframe name="profileiframe" src="${window.location.origin + url}" width="0" height="0" tabindex="-1" class="hidden" hidden></iframe>`;
      document.body.insertAdjacentHTML("beforeend", iframeHTML);
      const iframe = /** @type {HTMLIFrameElement | null} */ (
        document.querySelector("iframe[name=profileiframe]")
      );
      if (!iframe) {
        return;
      }

      const updateCounterOnProfileRefresh = () => {
        const error =
          iframe.contentWindow?.document.getElementById("pun-message");

        if (!!error) {
          throw new Error("Failed to update profile");
        }

        forumGlobals[userFieldKey] = updatedCounter;

        const authorsPostsInTopic = document.querySelectorAll(
          `.post[data-user-id="${UserID}"] .post-author`
        );

        authorsPostsInTopic.forEach((author) => {
          const counter = /** @type {HTMLElement | null} */ (
            author.querySelector(`.pa-fld${fldId}`)
          );

          if (counter) {
            counter.innerText = String(updatedCounter);
          } else {
            const html = `<li class="pa-fld${fldId}" title="Постов:"> ${updatedCounter}</li>`;

            author
              .querySelector(nextFldSelector)
              ?.insertAdjacentHTML("beforebegin", html);
          }
        });

        localStorage.removeItem(COUNTER_NEW_POST_KEY);
        iframe.remove();
      };

      const updateProfileOnLoad = () => {
        const profileForm = /** @type {HTMLFormElement | null} */ (
          iframe.contentWindow?.document.getElementById("profile8") ?? null
        );
        if (!profileForm) {
          throw new Error("Failed to load profile form");
        }

        const changingFld = /** @type {HTMLInputElement | null} */ (
          profileForm.querySelector(`[name="form[fld${fldId}]"]`)
        );
        if (!changingFld) {
          throw new Error(`Failed to find profile field ${fldId}`);
        }
        changingFld.value = String(updatedCounter);

        iframe.addEventListener("load", updateCounterOnProfileRefresh, {
          once: true
        });
        profileForm.submit();
      };
      iframe.addEventListener("load", updateProfileOnLoad, {
        once: true
      });

      handleLogs(
        {
          debug,
          module: COUNTER_MODULE_NAME,
          message: `fld${fldId}`
        },
        {
          initialCounter,
          updatedCounter
        }
      );
    }
  } catch (error) {
    handleError(COUNTER_MODULE_NAME, error);
  }
};

export default countPostsInTopic;
