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
    }

    if(voteResponse?.delta) {
      const pid = url.searchParams.get('id');
      const post = document.getElementById(`p${pid}`);
      const userId = post.dataset.userId;
      const rating = post.querySelector('.post-rating a');

      post.classList.add('mylike');

      const postRating = rating.textContent.split('+').join('');
      rating.textContent = `+${Number(postRating) + 1}`;

      const userPostReputation = document.querySelectorAll(`.post[data-user-id="${userId}"] .pa-respect span:not(.fld-name)`);

      userPostReputation.forEach(respect => {
        const userRespect = respect.textContent.split('+').join('');
        respect.textContent = `+${Number(userRespect) + 1}`;
      })
    }
  } catch (e) {
    console.error('[bss] addFastReactions >>> ERROR!', e?.message);
    $.jGrowl(e?.message);
  }
};

const addFastReactions = () => {
  if (typeof FORUM.topic !== "object") {
    return;
  }

  const reputationForm = document.getElementById("rep_form");
  const sendReputationBtn = document.getElementById("reputationButtonSend");

  document.querySelectorAll('.post').forEach(post => {
    const rating = post.querySelector(".post-rating a");
    rating.setAttribute('title', 'Быстрый лайк');

    // replace post vote link inner content
    const vote = post.querySelector(".post-vote a");

    if (vote) {
      const href = vote.getAttribute("href");

      vote.setAttribute('title', 'Лайк с комментом');
      vote.innerHTML = `<span class="vote-name">+</span>`;

      const fetchVote = (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        handleFastVote(href);

        e.target?.blur();
      };

      rating.addEventListener("click", fetchVote, { passive: false });
    }
  });
};

export default addFastReactions;
