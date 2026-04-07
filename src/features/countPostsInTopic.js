import { handleError, handleLogs } from "../utils";

const COUNTER_MODULE_NAME = "footer/countPostsInTopic";

const countPostsInTopic = async ({
  forumsToTrack = [],
  fldId = "5",
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
    if (typeof FORUM.topic === "object") {
      const topic = FORUM.topic;
      forumId = +FORUM.topic.forum_id; // string needs to be converted to number
    } else if (newPost) {
      forumId = +newPost.dataset.forumId;
    }

    if (!forumsToTrack.includes(forumId)) {
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
          Math.floor(Date.now() / 1000)
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
      const initialCounter = window[`UserFld${fldId}`]
        ? +window[`UserFld${fldId}`]
        : 0;
      const updatedCounter = initialCounter + 1;

      const url = `/profile.php?section=fields&id=${window.UserID}`;

      const iframeHTML = `<iframe name="profileiframe" src="${window.location.origin + url}" width="0" height="0" tabindex="-1" class="hidden" hidden></iframe>`;
      document.body.insertAdjacentHTML("beforeend", iframeHTML);
      const iframe = document.querySelector("iframe[name=profileiframe]");

      const updateCounterOnProfileRefresh = () => {
        const error =
          iframe.contentWindow?.document.getElementById("pun-message");

        if (!!error) {
          throw new Error("Failed to update profile");
        }

        window[`UserFld${fldId}`] = updatedCounter;

        const authorsPostsInTopic = document.querySelectorAll(
          `.post[data-user-id="${UserID}"] .post-author`
        );

        authorsPostsInTopic.forEach((author) => {
          const counter = author.querySelector(`.pa-fld${fldId}`);
          const previousFld = author.querySelector(`.pa-posts`);

          if (counter) {
            counter.innerText = updatedCounter;
          } else {
            const html = `<li class="pa-fld${fldId}" title="Постов:"> ${updatedCounter}</li>`;

            previousFld.insertAdjacentHTML("afterend", html);
          }
        });

        localStorage.removeItem(COUNTER_NEW_POST_KEY);
        iframe.remove();
      };

      const updateProfileOnLoad = () => {
        const profileForm =
          iframe?.contentWindow.document.getElementById("profile8");

        const changingFld = profileForm.querySelector(
          `[name="form[fld${fldId}]"]`
        );
        changingFld.value = updatedCounter;

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
