/**
 * Resolves the current topic/post subject for a web component’s page context.
 *
 * @param {Element} webComponent Host element used to locate nearby post markup.
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
      return /** @type {HTMLElement} */ (document.querySelector("#pun-main h1"))
        .textContent;
  }
};
