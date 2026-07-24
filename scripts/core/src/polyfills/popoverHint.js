/**
 * Safari fallback when `popover="hint"` is unsupported (treated as manual).
 * Closes other open hints before a new hint opens (click or interest/hover).
 *
 * @returns {void}
 */
export function popoverHintPolyfill() {
  const probe = document.createElement("div");
  probe.setAttribute("popover", "hint");
  if (probe.popover === "hint") {
    return;
  }

  document.addEventListener(
    "beforetoggle",
    (event) => {
      if (event.newState !== "open") {
        return;
      }

      const popover = event.target;
      if (
        !(popover instanceof HTMLElement) ||
        popover.getAttribute("popover") !== "hint"
      ) {
        return;
      }

      for (const openHint of document.querySelectorAll('[popover="hint"]')) {
        if (openHint !== popover && openHint.matches(":popover-open")) {
          /** @type {HTMLElement} */ (openHint).hidePopover();
        }
      }
    },
    true
  );
}
