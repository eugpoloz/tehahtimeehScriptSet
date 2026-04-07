import { handleError } from "./error";

const HANDLE_LOGIN_MODULE_NAME = "utils/handleLogin";

export const handleLogin = async ({ login, password } = {}) => {
  if (!login || !password) {
    return;
  }

  const redirectUrl = window.location.href;

  try {
    const formData = new FormData();
    formData.append("form_sent", "1");
    formData.append("req_username", login);
    formData.append("req_password", password);
    formData.append("redirect_url", redirectUrl);
    formData.append("login", "Submit");

    const response = await fetch(
      `${window.location.origin}/login.php?action=in`,
      {
        body: formData,
        credentials: "include",
        headers: {
          "Cache-Control": "max-age=0",
          "Upgrade-Insecure-Requests": "1"
        },
        method: "POST"
      }
    );

    console.log(`${HANDLE_LOGIN_MODULE_NAME} >>> response`, response);

    if (response.status === 200) {
      window.location.href = response.url ?? redirectUrl;
      window.location.reload();
      return;
    } else {
      throw new Error(`Failed to login: ${response.statusText}`);
    }
  } catch (error) {
    handleError(HANDLE_LOGIN_MODULE_NAME, error);
  }
};
