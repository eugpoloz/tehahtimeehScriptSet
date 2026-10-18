import { handleLogin } from "@teh/utils";
import { isQuickLoginCryptoAvailable } from "../../helpers/crypto";
import errorMessages from "../../helpers/error-messages.json";
import {
  clearQuickLoginError,
  invalidateMultiaccList,
  isFormBusy,
  renderMultiaccList,
  renderQuickLoginNavigation,
  renderQuickLoginPanel,
  setFormBusy,
  setQuickLoginErrorMessage
} from "./render";
import { saveLogin } from "./storage";

/**
 * @param {SubmitEvent} e
 * @param {boolean} localQuickLoginEnabled
 * @param {boolean} debug
 */
const handleQuickLogin = async (e, localQuickLoginEnabled, debug) => {
  if (!(e.target instanceof HTMLFormElement) || isFormBusy()) {
    return;
  }

  const formData = new FormData(e.target);
  const login = formData.get("req_username");
  const password = formData.get("req_password");
  if (typeof login !== "string" || typeof password !== "string") {
    return;
  }

  clearQuickLoginError();
  setFormBusy(true, localQuickLoginEnabled);
  try {
    const succeeded = await handleLogin(
      {
        login,
        password
      },
      {
        reload: false,
        debug
      }
    );
    if (!succeeded) {
      setQuickLoginErrorMessage(errorMessages.loginFailed);
      return;
    }

    if (formData.get("remember-acc")) {
      await saveLogin({
        login,
        password
      });
    }

    window.location.reload();
  } catch {
    setQuickLoginErrorMessage(errorMessages.accountSaveFailed);
  } finally {
    setFormBusy(false, localQuickLoginEnabled);
  }
};

/** @param {{ debug?: boolean }} [options] */
const multiaccQuickLogin = ({ debug = false } = {}) => {
  const navlinks = document.getElementById("pun-navlinks");
  if (!navlinks) {
    return;
  }

  renderQuickLoginNavigation(navlinks);

  const quickForm = renderQuickLoginPanel();
  if (!quickForm) {
    return;
  }

  const localQuickLoginEnabled = isQuickLoginCryptoAvailable();
  setFormBusy(false, localQuickLoginEnabled);
  if (!localQuickLoginEnabled) {
    setQuickLoginErrorMessage(errorMessages.unsupportedEnvironment);
  }

  quickForm.addEventListener("toggle", async () => {
    if (!quickForm.matches(":popover-open")) {
      invalidateMultiaccList();
      const password = /** @type {HTMLInputElement | null} */ (
        quickForm.querySelector('input[name="req_password"]')
      );
      if (password) {
        password.value = "";
      }

      return;
    }

    if (localQuickLoginEnabled) {
      clearQuickLoginError();
    }

    await renderMultiaccList(localQuickLoginEnabled, debug);
  });

  const form = document.getElementById("quick-login");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!localQuickLoginEnabled) {
      return;
    }

    void handleQuickLogin(e, localQuickLoginEnabled, debug);
  });
};

export default multiaccQuickLogin;
