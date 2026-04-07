import { handleError } from "./error";

const getResponse = async (url) => {
  try {
    const getResponse = await fetch(`${url}&nohead`, {
      method: "GET",
      credentials: "include"
    });

    return getResponse;
  } catch (e) {
    handleError("utils/getResponse", e);
  }
};

const parseHTMLResponse = async (response) => {
  try {
    const responseHTML = await response.arrayBuffer().then((buffer) => {
      const decoder = new TextDecoder("windows-1251"); // Or 'koi8-r'
      const text = decoder.decode(buffer);
      return text;
    });

    const parser = new DOMParser();

    return parser.parseFromString(responseHTML, "text/html");
  } catch (e) {
    handleError("utils/getResponseParser", e);
  }
};

export { getResponse, parseHTMLResponse };
