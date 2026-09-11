const ADMIN_INDEX_URL = "https://hehedges.rusff.me/admin_index.php";

/**
 * Checks whether the current session can load the admin index.
 * This is a client-side UI check, not an authorization boundary.
 * @returns {Promise<boolean>}
 */
export const isUserAdmin = async () => {
  try {
    const response = await fetch(ADMIN_INDEX_URL, {
      credentials: "include",
      redirect: "manual"
    });

    if (!response.ok) {
      return false;
    }

    return document.querySelector("#pun.isadmin") !== null;
  } catch {
    return false;
  }
};

/**
 * Checks the current user's lightweight admin group marker.
 * This is a client-side UI check, not an authorization boundary.
 * @returns {boolean}
 */
export const isUserAdminByGroup = () => {
  return Number(window.GroupID) === 1;
};
