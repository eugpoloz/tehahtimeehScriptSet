import { viewprofile } from "../../utils";

function addProfileLinkToPosts(forums = [14, 15, 16, 17, 5]) {
  const profileName = document.getElementById("profile-name");

  if (viewprofile && profileName) {
    const forumsStr = forums.join(",");

    const html = `<a href="/search.php?action=search&keywords=&author=${profileName.textContent}&forums=${forumsStr}&search_in=posts&sort_by=0&sort_dir=DESC&show_as=posts">Показать все посты</a> | `;

    const topicsLink = document.getElementById("user-topics");

    topicsLink.insertAdjacentHTML("beforebegin", html);
  }
}

export default addProfileLinkToPosts;
