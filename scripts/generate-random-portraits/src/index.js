import shuffle from "lodash-es/shuffle";
import { handleError } from "@teh/utils";

const PORTRAIT_CACHE_TTL = 5 * 60 * 1000;

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
      <img src="${avatar ? window.location.origin + avatar : placeholder}" alt="${username}" fetchpriority="low" />
      <span class="tooltip" popover="hint" id="${popoverId}" role="tooltip">${username}</span>
    </a>`;

    if (portraitNodeList?.[idx]) {
      portraitNodeList[idx].innerHTML = html;
    }
  });
}

/**
 * @param {string} groupIds
 * @returns {Promise<PortraitUser[]>}
 */
async function loadPortraitUsers(groupIds) {
  const cacheKey = "teh.portraitUsers";

  try {
    const cached =
      /** @type {{ expiresAt: number, users: PortraitUser[] } | null} */ (
        JSON.parse(sessionStorage.getItem(cacheKey) ?? "null")
      );
    if (
      cached &&
      cached.expiresAt > Date.now() &&
      Array.isArray(cached.users)
    ) {
      return cached.users;
    }
  } catch {
    // A missing or unreadable cache must not prevent the request.
  }

  const data = await fetch(
    `${window.location.origin}/api.php?method=users.get&fields=user_id,username,avatar&limit=200&group_id=${groupIds}`
  );
  if (!data.ok) {
    throw new Error(`Could not load portrait users: ${data.status}`);
  }

  const response = /** @type {{ response: { users: PortraitUser[] } }} */ (
    await data.json()
  );
  const { users } = response.response;
  if (!Array.isArray(users)) {
    throw new Error("Invalid portrait user list");
  }

  try {
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ expiresAt: Date.now() + PORTRAIT_CACHE_TTL, users })
    );
  } catch {
    // The fetched list is still usable when storage is unavailable.
  }

  return users;
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

    let users = await loadPortraitUsers(group_id.join(","));

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
