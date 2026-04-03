function transformNodes() {
  const profileNodes = document.querySelectorAll(".post .pa-author");

  if (profileNodes.length > 0) {
    profileNodes.forEach((node) => {
      const link = node.querySelector("a");

      if (!link) {
        const nicknameNode = node.childNodes[1];

        const nickname = nicknameNode.textContent;

        const html = `<a href="javascript:to('${nickname}')" rel="nofollow">${nickname}</a>`;

        node.insertAdjacentHTML("beforeend", html);
        node.removeChild(nicknameNode);
      }
    });
  }
}

export default function clickableGuestNames(forum_id) {
  if (typeof FORUM.topic === "object") {
    const current_forum = Number(FORUM.topic.forum_id);

    if (forum_id && forum_id === current_forum) {
      return transformNodes();
    }
  }
  
  return false;
}
