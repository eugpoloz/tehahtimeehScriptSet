import shuffle from "lodash-es/shuffle";
import { handleError } from "@teh/utils";

/**
 * @typedef {object} PortraitUser
 * @property {string | number} user_id
 * @property {string} username
 * @property {string} [avatar]
 */

/**
 * @typedef {object} GenerateRandomPortraitsOptions
 * @property {string[]} [filteredUsers]
 * @property {(string | number)[]} [group_id]
 * @property {number} [howMany]
 * @property {string} [placeholder]
 * @property {string} [selector]
 */

/**
 * This creates HTML markup for the portraits.
 *
 * @param {{ users: PortraitUser[], placeholder: string, selector?: string }} options
 * @returns {void}
 */
function createPortraits({
  users,
  placeholder,
  selector = ".portrait.portrait--char"
}) {
  const portraitNodeList = document.querySelectorAll(selector);

  return users.forEach((user, idx) => {
    const { username, user_id, avatar } = user;

    const popoverId = `portrait-tooltip-${user_id}`;
    const html = `<a href="/profile.php?id=${user_id}" interestfor="${popoverId}">
      <img src="${avatar ? window.location.origin + avatar : placeholder}" alt="${username}" />
      <span class="tooltip" popover="hint" id="${popoverId}" role="tooltip">${username}</span>
    </a>`;

    if (portraitNodeList?.[idx]) {
      portraitNodeList[idx].innerHTML = html;
    }
  });
}

/**
 * @param {GenerateRandomPortraitsOptions} [pickPortraits]
 * @returns {Promise<PortraitUser[] | undefined>}
 */
async function generateRandomPortraits(pickPortraits = {}) {
  try {
    const {
      filteredUsers = [], // usernames
      group_id = [1, 2], // ids of groups to pick
      howMany = 3, // now many portraits to pick
      placeholder = "https://placehold.co/65x65", // any placeholder image
      selector
    } = pickPortraits;

    const groupIds = group_id.join(",");

    const data = await fetch(
      `${window.location.origin}/api.php?method=users.get&fields=user_id,username,avatar&limit=200&group_id=${groupIds}`
    );
    const response = /** @type {{ response: { users: PortraitUser[] } }} */ (
      await data.json()
    );

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
    handleError("optional/generateRandomPortraits", error);
  }
}

export default generateRandomPortraits;

// config example
//
//teh.generateRandomPortraits({
//  howMany: 4,
//  group_id: [1, 2, 5],
//  filteredUsers: ["Hedge Bitch"],
//  placeholder: "https://forumstatic.ru/files/001c/ab/7e/68132.png?v=1",
//  selector: ".hehe-portrait",
//});
