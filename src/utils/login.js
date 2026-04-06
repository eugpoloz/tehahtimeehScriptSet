export const handleLogin = async ({ login, password } = {}) => {
  if (!login || !password) {
    return;
  }

  try {
  const formData = new FormData();
  formData.append("form_sent", "1");
  formData.append("req_username", login);
  formData.append("req_password", password);
  formData.append("login", "Submit");

  const response = await fetch(`${window.location.origin}/login.php?action=in`, {
    body: formData,
    credentials: "include",
    headers: {
      "Cache-Control": "max-age=0",
      "Upgrade-Insecure-Requests": "1"
    },
    method: "POST"
  });

  if (response.status === 200) {
    window.location.reload();
    return;
  } else {
      throw new Error(`[bss] Failed to login: ${response.statusText}`);
    }
    
  } catch (error) {
    handleError("utils/handleLogin", error);
  }
};
