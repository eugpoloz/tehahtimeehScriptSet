import { handleError } from "@teh/utils";
import { handleFastVote } from "../helpers/fast-vote";

const addFastReactions = () => {
  try {
    if (typeof FORUM.topic !== "object") {
      return;
    }

    document.querySelectorAll(".post").forEach((post) => {
      const rating = post.querySelector(".post-rating a");
      const vote = post.querySelector(".post-vote a");

      if (!rating || !vote || rating.hasAttribute("data-ready")) {
        return;
      }

      const href = vote.getAttribute("href");
      if (!href) {
        return;
      }

      rating.setAttribute("title", "Быстрый лайк");
      vote.setAttribute("title", "Лайк с комментом");
      vote.innerHTML = `<span class="vote-name">+</span>`;

      /** @param {Event} e */
      const fetchVote = async (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();

        try {
          await handleFastVote(href);
        } catch (error) {
          handleError("enhance-reactions/addFastReactions", error);
          $.jGrowl(error instanceof Error ? error.message : String(error));
        }
      };

      rating.addEventListener("click", fetchVote, { passive: false });
      rating.setAttribute("data-ready", "");
    });
  } catch (error) {
    handleError("enhance-reactions/addFastReactions", error);
  }
};

export default addFastReactions;
