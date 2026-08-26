/**
 * Sends a fast-vote request and reflects the confirmed result in the page.
 *
 * @param {string} href Vote endpoint from the post controls.
 * @returns {Promise<void>}
 * @throws {Error} When the forum does not confirm the vote.
 */
export const handleFastVote = async (href) => {
  const url = new URL(href, window.location.origin);
  url.searchParams.set("format", "json");

  const voteRequest = await fetch(url, {
    method: "GET",
    credentials: "include"
  });

  if (!voteRequest.ok) {
    throw new Error(`Не удалось поставить лайк (HTTP ${voteRequest.status})`);
  }

  const voteResponse =
    /** @type {{ error?: { message?: string }, delta?: number }} */ (
      await voteRequest.json()
    );

  if (voteResponse.error?.message) {
    throw new Error(voteResponse.error.message);
  }

  const delta = Number(voteResponse.delta);
  if (!Number.isFinite(delta) || delta === 0) {
    throw new Error("Сервер не подтвердил лайк");
  }

  const pid = url.searchParams.get("id");
  const post = pid ? document.getElementById(`p${pid}`) : null;
  const rating = post?.querySelector(".post-rating a");

  if (!post || !rating) {
    return;
  }

  const userId = post.dataset.userId;

  post.classList.toggle("mylike", delta > 0);

  const postRating = rating.textContent.split("+").join("");
  rating.textContent = `+${Number(postRating) + delta}`;

  const userPostReputation = document.querySelectorAll(
    `.post[data-user-id="${userId}"] .pa-respect span:not(.fld-name)`
  );

  userPostReputation.forEach((respect) => {
    const userRespect = respect.textContent.split("+").join("");
    respect.textContent = `+${Number(userRespect) + delta}`;
  });
};
