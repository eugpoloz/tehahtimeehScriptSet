import { hasTopic, handleError } from "@teh/utils";
import { randomDelay, sleep } from "../helpers/delay";

const ALL_LIKED_TEXT = "На этой странице всё пролайкано!";

async function autoReactToPosts() {
  try {
    if (!hasTopic) {
      return;
    }

    const modmenu =
      document.querySelector("#topic-modmenu .container") ??
      document.querySelector("#topic-feed .container");

    if (!modmenu) {
      return;
    }

    const html = `<button type="button" class="superlike">Лайкнуть всех</button>`;
    modmenu.insertAdjacentHTML("beforeend", html);

    const superlikeBtn = modmenu.querySelector(".superlike");
    if (!superlikeBtn) {
      return;
    }
    const button = superlikeBtn;

    async function handleAutoReact() {
      const postsToLike = document.querySelectorAll(
        `.post:not(.mylike):not([data-user-id="${UserID}"]) .post-rating a`
      );
      const superlikesLength = postsToLike.length;

      if (superlikesLength) {
        /** @param {number} idx */
        const superlikeNotificationContent = (idx) =>
          `Суперлайк в процессе: ${idx}/${superlikesLength}`;

        $.jGrowl(superlikeNotificationContent(0), {
          sticky: true
        });

        for (let i = 0; i < superlikesLength; i++) {
          const message = document.querySelector(".jGrowl-message");
          if (message) {
            message.textContent = superlikeNotificationContent(i);
          }

          try {
            postsToLike[i].dispatchEvent(
              new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window
              })
            );
          } catch (e) {
            handleError("enhance-reactions/autoReactToPosts", e);
          }

          await sleep(randomDelay());
        }

        const message = document.querySelector(".jGrowl-message");
        if (message) {
          message.textContent = ALL_LIKED_TEXT;

          setTimeout(() => {
            $.jGrowl("close");
          }, 3000);
        }
      }

      if (!document.querySelector(".jGrowl-message")) {
        $.jGrowl(ALL_LIKED_TEXT);
      }

      button.removeAttribute("disabled");
      button.classList.remove("cursor-wait");
    }

    button.addEventListener("click", (e) => {
      button.setAttribute("disabled", "");
      button.classList.add("cursor-wait");

      handleAutoReact();
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.blur();
      }
    });
  } catch (error) {
    handleError("enhance-reactions/autoReactToPosts", error);
  }
}

export default autoReactToPosts;
