import shuffle from "lodash-es/shuffle";
import { handleError } from "../../utils";

/** This creates HTML markup for the portraits.
 */
function createPortraits({
  users,
  placeholder,
  selector = ".portrait.portrait--char"
}) {
  const portraitNodeList = document.querySelectorAll(selector);

  return users.forEach((user, idx) => {
    const { username, user_id, avatar } = user;

    const html = `<a href="/profile.php?id=${user_id}"><img src="${avatar ? window.location.origin + avatar : placeholder}" alt="${username}" title="${username}" /></a>`;

    if (portraitNodeList?.[idx]) {
      portraitNodeList[idx].innerHTML = html;
    }
  });
}

export default async function randomPortraitGenerator(pickPortraits) {
  try {
    const {
      filteredUsers = [], // usernames
      group_id = [1, 2], // ids of groups to pick
      howMany = 3, // now many portraits to pick
      placeholder = "http://placehold.it/65x65", // any placeholder image
      selector
    } = pickPortraits;

    const groupIds = group_id.join(",");

    const data = await fetch(
      `${window.location.origin}/api.php?method=users.get&fields=user_id,username,avatar&limit=200&group_id=${groupIds}`
    );
    const response = await data.json();

    let { users } = response.response;

    if (filteredUsers.length > 0) {
      const userSet = new Set(filteredUsers);

      users = users.filter(({ username }) => !userSet.has(username));
    }

    const pickedUsers =
      users.length > howMany
        ? shuffle(users).slice(0, howMany)
        : shuffle(users);

    createPortraits({
      users: pickedUsers,
      placeholder,
      selector
    });

    return pickedUsers;
  } catch (error) {
    handleError("optional/randomPortraitGenerator()", error);
  }
}
