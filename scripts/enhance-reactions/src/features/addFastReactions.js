import { handleError } from "@teh/utils";

/**
 * @param {string} href
 * @returns {Promise<void>}
 */
const handleFastVote = async (href) => {
  try {
    const url = new URL(window.location.origin + href + `&format=json`);

    const voteRequest = await fetch(url, {
      method: "GET",
      credentials: "include"
    });
    const voteResponse =
      /** @type {{ error?: { message?: string }, delta?: number }} */ (
        await voteRequest.json()
      );

    if (voteResponse?.error?.message) {
      throw new Error(voteResponse?.error?.message);
    }

    if (voteResponse?.delta) {
      const pid = url.searchParams.get("id");
      const post = document.getElementById(`p${pid}`);
      const rating = post?.querySelector(".post-rating a");

      if (!post || !rating) {
        return;
      }

      const userId = post.dataset.userId;

      post.classList.add("mylike");

      const postRating = rating.textContent.split("+").join("");
      rating.textContent = `+${Number(postRating) + 1}`;

      const userPostReputation = document.querySelectorAll(
        `.post[data-user-id="${userId}"] .pa-respect span:not(.fld-name)`
      );

      userPostReputation.forEach((respect) => {
        const userRespect = respect.textContent.split("+").join("");
        respect.textContent = `+${Number(userRespect) + 1}`;
      });
    }
  } catch (e) {
    handleError("enhance-reactions/addFastReactions", e);
    $.jGrowl(e instanceof Error ? e.message : String(e));
  }
};

const addFastReactions = () => {
  try {
    if (typeof FORUM.topic !== "object") {
      return;
    }

    document.querySelectorAll(".post").forEach((post) => {
      const rating = post.querySelector(".post-rating a");
      const vote = post.querySelector(".post-vote a");

      if (!rating || !vote) {
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
      const fetchVote = (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        handleFastVote(href);

        if (e.currentTarget instanceof HTMLElement) {
          e.currentTarget.blur();
        }
      };

      rating.addEventListener("click", fetchVote, { passive: false });
    });
  } catch (error) {
    handleError("enhance-reactions/addFastReactions", error);
  }
};

export default addFastReactions;
