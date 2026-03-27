const handleFastVote = async (href) => {
  try {
    const url = new URL(window.location.origin + href + `&format=json`);

    const voteRequest = await fetch(url, {
      method: "GET",
      credentials: "include"
    });
    const voteResponse = await voteRequest.json();
    
    if (voteResponse?.error?.message) {
      throw new Error(voteResponse?.error?.message);
      return;
    }

    if(voteResponse?.delta) {
      const urlParams = url.searchParams;
      const pid = urlParams.get('id');

      const post = document.getElementById(`p${pid}`);
      const rating = post.querySelector('.post-rating a');

      post.classList.add('mylike');
      rating.textContent = `${Number(rating.textContent + 1)}`;
    }
  } catch (e) {
    console.error('handleFastVote >>> ERROR!', e?.message);
    $.jGrowl(e?.message);
  }
};

const addFastReactions = () => {
  if (typeof FORUM.topic !== "object") {
    return;
  }

  const reputationForm = document.getElementById("rep_form");
  const sendReputationBtn = document.getElementById("reputationButtonSend");

  // remove unnecessary pluses
  document
    .querySelectorAll(".post-rating a")
    .forEach((rating) => (rating.innerText = rating.innerText.split('+').join('')));

  // replace post vote link inner content
  document.querySelectorAll(".post-vote a").forEach((vote) => {
    const href = vote.getAttribute("href");

    vote.setAttribute('title', 'Быстрый лайк');
    vote.innerHTML = `<span class="vote-name">+</span>`;

    const fetchVote = (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      handleFastVote(href);

      e.target?.blur();
    };

    vote.addEventListener("click", fetchVote, { passive: false });
  });
};

export default addFastReactions;
