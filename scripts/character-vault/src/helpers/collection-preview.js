/**
 * Watches a collection while it is in the vault. The modal removes its old
 * contents from the document when a new vault opens.
 *
 * @param {HTMLElement} target
 * @param {() => void} update
 */
const watchSize = (target, update) => {
  const observer = new ResizeObserver(() => {
    if (!target.isConnected) {
      observer.disconnect();
      return;
    }

    update();
  });
  observer.observe(target);
};

/**
 * @param {HTMLElement} target
 * @param {HTMLElement} count
 * @param {HTMLButtonElement} button
 * @param {number} rows
 * @returns {(reset?: boolean) => void}
 */
export const initCollectionPreview = (target, count, button, rows) => {
  let expanded = false;
  /** @type {{ limit: number, total: number, expanded: boolean } | undefined} */
  let previous;

  /** @param {boolean} [reset] */
  const update = (reset = false) => {
    if (reset) {
      expanded = false;
    }

    const tracks = getComputedStyle(target).gridTemplateColumns;
    // An unstyled or hidden vault can report an unresolved track list.
    const columns = tracks
      .split(/\s+/)
      .filter((track) => /^\d+(?:\.\d+)?px$/.test(track)).length;
    const total = target.childElementCount;
    const limit = columns ? Math.min(rows * columns, total) : total;
    if (
      !reset &&
      previous?.limit === limit &&
      previous.total === total &&
      previous.expanded === expanded
    ) {
      return;
    }

    if (previous?.total !== total) {
      count.textContent = String(total);
    }

    button.toggleAttribute("hidden", total <= limit);
    if (previous?.expanded !== expanded) {
      button.setAttribute("aria-expanded", String(expanded));
      button.textContent = expanded ? "Свернуть" : "Показать\u00a0все";
    }

    Array.from(target.children).forEach((item, index) => {
      item.toggleAttribute("hidden", !expanded && index >= limit);
    });
    previous = { limit, total, expanded };
  };

  button.addEventListener("click", () => {
    expanded = !expanded;
    update();
  });
  watchSize(target, update);
  return update;
};

/** @param {HTMLElement} target */
export const initCouponScroll = (target) => {
  watchSize(target, () => {
    if (target.scrollHeight > target.clientHeight) {
      target.tabIndex = 0;
    } else {
      target.removeAttribute("tabindex");
    }
  });
};
