/**
 * Opens and closes a popover when its source gains or loses interest.
 * @param {HTMLElement} source Hover and focus target.
 * @param {HTMLElement} popover Popover controlled by the source.
 * @returns {void}
 */
const addPopoverInterest = (source, popover) => {
  const POPOVER_DELAY = 100;

  let timer = 0;
  let isHovered = false;
  let isFocused = false;
  let hasInterest = false;

  /** @param {boolean} shouldOpen */
  const updatePopover = (shouldOpen) => {
    const isOpen = popover.matches(":popover-open");
    if (isOpen === shouldOpen) {
      return;
    }

    if (shouldOpen) {
      popover.showPopover({ source });
    } else {
      popover.hidePopover();
    }
  };

  /** @param {boolean} shouldOpen */
  const schedulePopover = (shouldOpen) => {
    window.clearTimeout(timer);

    timer = window.setTimeout(() => updatePopover(shouldOpen), POPOVER_DELAY);
  };

  const updateInterest = () => {
    const nextHasInterest = isHovered || isFocused;
    if (nextHasInterest === hasInterest) {
      return;
    }

    hasInterest = nextHasInterest;
    schedulePopover(hasInterest);
  };

  const handleMouseEnter = () => {
    isHovered = true;
    updateInterest();
  };

  const handleMouseLeave = () => {
    isHovered = false;
    updateInterest();
  };

  const handleFocus = () => {
    isFocused = true;
    updateInterest();
  };

  const handleBlur = () => {
    isFocused = false;
    updateInterest();
  };

  source.addEventListener("mouseenter", handleMouseEnter);
  source.addEventListener("mouseleave", handleMouseLeave);
  source.addEventListener("focus", handleFocus);
  source.addEventListener("blur", handleBlur);
};

export default addPopoverInterest;
