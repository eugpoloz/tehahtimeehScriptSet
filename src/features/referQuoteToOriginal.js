const referQuoteToOriginal = () => {
  const getViewtopicHref = (pid) => `/viewtopic.php?pid=${pid.slice(1)}#${pid}`;

  if (typeof FORUM.topic === "object") {
    // transform quote links
    const posts = document.querySelectorAll(".post");

    posts.forEach((post) => {
      const quoteLink = post.querySelector(".pl-quote a");

      const pid = post.getAttribute("id");
      const href = post.querySelector(".pl-quote a").getAttribute("href");

      const updatedHref = href.replace("('", `('#${pid},`);

      quoteLink.setAttribute('href', updatedHref);
    });
  }

  const quoteCites = [...document.querySelectorAll(".answer-box cite")].filter(
    (cite) => cite?.textContent.startsWith("#")
  );
  if (quoteCites.length > 0) {
    quoteCites.forEach((cite) => {
      const [pidWithHash, username] = cite.textContent.split(",");
      const pid = pidWithHash.slice(1);

      const postInTopic = document.querySelector(`#${pid}.post`);

      cite.innerHTML = `<a class="qc-post-link" href="${postInTopic ? `#${pid}` : getViewtopicHref(pid)}">${username}</a>`
    });
  }
};

export default referQuoteToOriginal;
