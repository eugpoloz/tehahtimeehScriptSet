import { hasTopic, handleError } from "@teh/utils";
import { randomDelay, sleep } from "../helpers/delay";
import { handleFastVote } from "../helpers/fast-vote";

const ALL_LIKED_TEXT = "На этой странице всё пролайкано!";
const SUPERLIKE_TOOLTIP_ID = "superlike-tooltip";

async function autoReactToPosts() {
  if (!hasTopic) {
    return;
  }

  const controlsContainer =
    document.querySelector("#topic-modmenu .container") ??
    document.querySelector("#topic-feed .container");

  if (!controlsContainer) {
    return;
  }

  try {
    if (document.getElementById(SUPERLIKE_TOOLTIP_ID)) {
      return;
    }

    const html = `<div class="superlike__container">
      <button type="button" class="superlike">Лайкнуть всех</button>
      <div class="tooltip" popover="manual" id="${SUPERLIKE_TOOLTIP_ID}" role="tooltip" aria-live="polite" aria-atomic="true" style="position-anchor: auto"></div>
    </div>`;
    controlsContainer.insertAdjacentHTML("beforeend", html);

    const superlikeBtn = controlsContainer.querySelector(".superlike");
    const superlikeTooltip = document.getElementById(SUPERLIKE_TOOLTIP_ID);

    if (!(superlikeBtn instanceof HTMLElement) || !superlikeTooltip) {
      return;
    }
    /** @type {number | undefined} */
    let hideTooltipTimeout;

    /** @param {string} content */
    const showSuperlikeTooltip = (content) => {
      superlikeTooltip.textContent = content;
      if (!superlikeTooltip.matches(":popover-open")) {
        superlikeTooltip.showPopover({ source: superlikeBtn });
      }
    };

    const hideSuperlikeTooltip = () => {
      if (superlikeTooltip.matches(":popover-open")) {
        superlikeTooltip.hidePopover();
      }
    };

    async function handleAutoReact() {
      try {
        if (hideTooltipTimeout !== undefined) {
          clearTimeout(hideTooltipTimeout);
          hideTooltipTimeout = undefined;
        }

        const reactionsToAdd = document.querySelectorAll(
          `.post:not(.mylike):not([data-user-id="${UserID}"]) .post-rating a`
        );
        const superlikesLength = reactionsToAdd.length;
        let successfulLikes = 0;
        let failedLikes = 0;

        showSuperlikeTooltip(
          superlikesLength
            ? `Суперлайк в процессе: 0/${superlikesLength}`
            : ALL_LIKED_TEXT
        );

        for (const [index, reaction] of reactionsToAdd.entries()) {
          const href = reaction
            .closest(".post")
            ?.querySelector(".post-vote a")
            ?.getAttribute("href");

          try {
            if (!href) {
              throw new Error("Не найдена ссылка для лайка");
            }

            await handleFastVote(href);
            successfulLikes++;
          } catch (error) {
            failedLikes++;
            handleError("enhance-reactions/autoReactToPosts", error);
          }

          showSuperlikeTooltip(
            `Суперлайк в процессе: ${index + 1}/${superlikesLength}`
          );

          if (index < superlikesLength - 1) {
            await sleep(randomDelay());
          }
        }

        if (failedLikes) {
          showSuperlikeTooltip(
            `Лайки поставлены: ${successfulLikes}/${superlikesLength}. Ошибок: ${failedLikes}`
          );
        } else {
          showSuperlikeTooltip(ALL_LIKED_TEXT);
        }
      } catch (error) {
        handleError("enhance-reactions/autoReactToPosts", error);
        showSuperlikeTooltip("Не удалось завершить суперлайк");
      } finally {
        hideTooltipTimeout = window.setTimeout(() => {
          hideSuperlikeTooltip();
          hideTooltipTimeout = undefined;
        }, 3000);

        superlikeBtn?.removeAttribute("disabled");
        superlikeBtn?.classList.remove("cursor-wait");
      }
    }

    superlikeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      superlikeBtn.setAttribute("disabled", "");
      superlikeBtn.classList.add("cursor-wait");

      void handleAutoReact().catch((error) => {
        handleError("enhance-reactions/autoReactToPosts", error);
      });
    });
  } catch (error) {
    handleError("enhance-reactions/autoReactToPosts", error);
  }
}

export default autoReactToPosts;
