import { handleLogs } from "@teh/utils";

/**
 * @param {boolean} [debug=false]
 * @returns {Promise<NodeListOf<Element> | undefined>}
 */
export const getVIPMultiAccList = async (debug = false) => {
  try {
    const url = `/profile.php?section=multi&id=${window.UserID}`;

    const profileResponse = await fetch(`${url}&nohead`, {
      method: "GET",
      credentials: "include"
    });

    const buffer = await profileResponse.arrayBuffer();
    const responseHTML = new TextDecoder("windows-1251").decode(buffer);

    const parser = new DOMParser();
    const profile9 = parser.parseFromString(responseHTML, "text/html");

    return profile9.querySelectorAll("#profile9 .list li");
  } catch {
    handleLogs({
      debug,
      module: "multiacc-quick-login/vipAccounts",
      message: "Failed to load VIP accounts"
    });
  }
};
