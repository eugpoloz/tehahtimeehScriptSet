/** @typedef {import("../types.js").Profile} Profile */

/** @param {string | number} id @returns {Promise<Profile | undefined>} */
const getProfile = async (id) => {
  try {
    const response = await fetch(`/profile.php?id=${id}&nohead`, {
      credentials: "include",
      priority: "high"
    });
    const html = new TextDecoder("windows-1251").decode(
      await response.arrayBuffer()
    );
    const profile = new DOMParser().parseFromString(html, "text/html");
    const fields = Array.from(
      profile.querySelectorAll("#profile-right li")
    ).reduce((result, item) => {
      const key = item.id.substring(3);
      const value = item.querySelector("strong")?.innerHTML ?? "";
      result[key] = key === "posts" ? value.split(" - ")[0] : value;

      return result;
    }, /** @type {Record<string, string>} */ ({}));

    return {
      ...fields,
      avatar:
        profile
          .querySelector(
            "#profile-avatar img, .pa-avatar img, #profile-left img"
          )
          ?.getAttribute("src") ?? undefined
    };
  } catch (error) {
    console.error(`Could not fetch profile ${id}`, error);
  }
};

export default getProfile;
