import { handleLogs } from "./logger";

const HANDLE_LOGIN_MODULE_NAME = "utils/handleLogin";

/**
 * @typedef {object} LoginCredentials
 * @property {string} [login]
 * @property {string} [password]
 *
 * @typedef {object} LoginOptions
 * @property {boolean} [reload=true] Reload after confirmed success.
 * @property {boolean} [debug=false] Enable credential-free diagnostic logging.
 */

/**
 * Reads authenticated identity from server-rendered navigation only.
 * @param {Document} page
 * @param {string} origin
 * @returns {string | null}
 */
const getAuthenticatedUserId = (page, origin) => {
  const links = page.querySelectorAll("#navprofile a[href]");
  if (!page.querySelector("#navlogout") || links.length !== 1) {
    return null;
  }

  const profile = new URL(links[0].getAttribute("href") ?? "", origin);
  const ids = profile.searchParams.getAll("id");
  if (
    profile.origin !== origin ||
    profile.pathname !== "/profile.php" ||
    ids.length !== 1 ||
    !/^[1-9]\d*$/.test(ids[0])
  ) {
    return null;
  }

  return ids[0];
};

/**
 * Parses the forum's Windows-1251 response without executing its scripts.
 * @param {Response} response
 * @returns {Promise<Document>}
 */
const readLoginPage = async (response) =>
  new DOMParser().parseFromString(
    new TextDecoder("windows-1251").decode(await response.arrayBuffer()),
    "text/html"
  );

/**
 * Confirms this attempt and the authenticated username before reporting success.
 * @param {LoginCredentials} [credentials]
 * @param {LoginOptions} [options]
 * @returns {Promise<boolean>} False for rejected, uncertain, or failed attempts.
 */
export const handleLogin = async (
  { login, password } = {},
  { reload = true, debug = false } = {}
) => {
  if (!login || !password) {
    return false;
  }

  try {
    const origin = window.location.origin;
    const marker = Array.from(
      crypto.getRandomValues(new Uint8Array(16)),
      (byte) => byte.toString(16).padStart(2, "0")
    ).join("");
    const redirect = new URL("/", origin);
    redirect.searchParams.set("teh_login", marker);

    const formData = new FormData();
    formData.append("form_sent", "1");
    formData.append("req_username", login);
    formData.append("req_password", password);
    formData.append("redirect_url", redirect.href);

    const response = await fetch(`${origin}/login.php?action=in`, {
      body: formData,
      cache: "no-store",
      credentials: "include",
      headers: {
        "Cache-Control": "max-age=0",
        "Upgrade-Insecure-Requests": "1"
      },
      method: "POST"
    });

    if (
      !response.ok ||
      !response.redirected ||
      response.url !== redirect.href
    ) {
      return false;
    }

    const userId = getAuthenticatedUserId(
      await readLoginPage(response),
      origin
    );
    if (userId === null) {
      return false;
    }

    const profile = new URL("/profile.php", origin);
    profile.searchParams.set("id", userId);
    profile.searchParams.set("teh_login", marker);
    const profileResponse = await fetch(profile.href, {
      credentials: "include",
      cache: "no-store"
    });
    if (!profileResponse.ok || profileResponse.url !== profile.href) {
      return false;
    }

    const profilePage = await readLoginPage(profileResponse);
    const names = profilePage.querySelectorAll("#profile-name strong");
    if (
      getAuthenticatedUserId(profilePage, origin) !== userId ||
      names.length !== 1 ||
      names[0].textContent !== login
    ) {
      return false;
    }

    if (reload) {
      window.location.reload();
    }

    return true;
  } catch {
    handleLogs({
      debug,
      module: HANDLE_LOGIN_MODULE_NAME,
      message: "Failed to confirm login"
    });
    return false;
  }
};
