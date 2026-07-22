/**
 * @param {Element} webComponent
 * @returns {string | null}
 */
export const getSubject = (webComponent) => {
  const punbbId = /** @type {Element} */ (
    document.querySelector(".punbb")
  ).getAttribute("id");

  switch (punbbId) {
    case "pun-edit":
    case "pun-post":
      return /** @type {HTMLInputElement} */ (
        document.querySelector("input[name='req_subject']")
      ).value;
    case "pun-searchposts":
      return /** @type {HTMLElement} */ (
        /** @type {Element} */ (webComponent.closest(".post")).querySelector(
          "h3 a[href^=viewtopic]"
        )
      ).innerText;
    default:
      return /** @type {HTMLElement} */ (
        document.querySelector("#pun-main h1")
      ).textContent;
  }
};
