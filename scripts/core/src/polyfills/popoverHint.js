/**
 * Safari fallback when `popover="hint"` is unsupported (treated as manual).
 * Closes other open hints before a `popovertarget` click opens a new one.
 */
export function popoverHintPolyfill() {
  const probe = document.createElement("div");
  probe.setAttribute("popover", "hint");
  if (probe.popover === "hint") {
    return;
  }

  document.addEventListener(
    "click",
    (event) => {
      const trigger =
        event.target instanceof Element
          ? event.target.closest("[popovertarget]")
          : null;
      if (!trigger) {
        return;
      }

      const popover = document.getElementById(
        trigger.getAttribute("popovertarget") ?? ""
      );
      if (!popover || popover.getAttribute("popover") !== "hint") {
        return;
      }

      for (const openHint of document.querySelectorAll('[popover="hint"]')) {
        if (openHint !== popover && openHint.matches(":popover-open")) {
          openHint.hidePopover();
        }
      }
    },
    true
  );
}
