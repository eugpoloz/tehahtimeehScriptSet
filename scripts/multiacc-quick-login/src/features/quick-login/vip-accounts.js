import { handleError } from "@teh/utils";

/** @returns {Promise<NodeListOf<Element> | undefined>} */
export const getVIPMultiAccList = async () => {
  try {
    const url = `/profile.php?section=multi&id=${window.UserID}`;

    const profileResponse = await fetch(`${url}&nohead`, {
      method: "GET",
      credentials: "include"
    });

    const responseHTML = await profileResponse.arrayBuffer().then((buffer) => {
      const decoder = new TextDecoder("windows-1251"); // Or 'koi8-r'
      const text = decoder.decode(buffer);
      return text;
    });

    const parser = new DOMParser();
    const profile9 = parser.parseFromString(responseHTML, "text/html");

    return profile9.querySelectorAll("#profile9 .list li");
  } catch (e) {
    handleError("footer/handleQuickLogin", e);
  }
};
