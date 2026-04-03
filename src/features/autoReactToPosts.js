import { hasTopic } from "../utils";

const DELAY_MAX = 1300;
const DELAY_MIN = 700;

const randomDelay = () => DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ALL_LIKED_TEXT = "На этой странице всё пролайкано!";

async function autoReactToPosts() {
  if (hasTopic) {
    let superlikeBtn;

    async function handleAutoReact() {
      const postsToLike = document.querySelectorAll(
        `.post:not(.mylike):not([data-user-id="${UserID}"]) .post-rating a`
      );
      const superlikesLength = postsToLike.length;

      if (superlikesLength) {
        console.log("postsToLike", { postsToLike, superlikesLength });

        const superlikeNotificationContent = (idx) =>
          `Суперлайк в процессе: ${idx}/${superlikesLength}`;

        $.jGrowl(superlikeNotificationContent(0), {
          sticky: true
        });

        for (let i = 0; i < superlikesLength; i++) {
          if (document.querySelector(".jGrowl-message")) {
            document.querySelector(".jGrowl-message").textContent =
              superlikeNotificationContent(i);
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
            console.error("[bss] autoReactToPosts >>> ERROR!", e);
          }

          await sleep(randomDelay());
        }

        if (document.querySelector(".jGrowl-message")) {
          document.querySelector(".jGrowl-message").textContent =
            ALL_LIKED_TEXT;

          setTimeout(() => {
            $.jGrowl("close");
          }, 3000);
        }
      }

      if (!document.querySelector(".jGrowl-message")) {
        $.jGrowl(ALL_LIKED_TEXT);
      }

      superlikeBtn.removeAttribute("disabled");
      superlikeBtn.classList.remove("cursor-wait");
    }

    const modmenu =
      document.querySelector("#topic-modmenu .container") ??
      document.querySelector("#topic-feed .container");

    superlikeBtn = document.createElement("button");
    superlikeBtn.setAttribute("type", "button");
    superlikeBtn.textContent = "Лайкнуть всех";
    superlikeBtn.classList.add("superlike");

    superlikeBtn.addEventListener("click", (e) => {
      superlikeBtn.setAttribute("disabled", "");
      superlikeBtn.classList.add("cursor-wait");

      handleAutoReact();
      e.target.blur();
    });

    modmenu.insertAdjacentElement("beforeend", superlikeBtn);
  }
}

export default autoReactToPosts;
