/**
 * Registers a custom element that replaces `DD.MM.YYYY` text with a computed age.
 * Uses `window[varKey]` as “today” when set (e.g. in-game date), otherwise `new Date()`.
 *
 * @param {string} tagName Custom element tag to define.
 * @param {string} [varKey] Window key for an override “today” date.
 * @returns {void}
 */
function defineAgeFromBirthday(tagName, varKey = "GAME_LATEST_DATE") {
  class AgeFromBirthday extends HTMLElement {
    /** @type {MutationObserver | undefined} */
    _observer;

    constructor() {
      super();
    }

    connectedCallback() {
      // If HTML parser already loaded the text, process it immediately
      if (this.textContent.trim()) {
        this._renderAge();
      } else {
        // Wait for the HTML parser to append the text node child
        this._observer = new MutationObserver(() => {
          if (this.textContent.trim()) {
            /** @type {MutationObserver} */ (this._observer).disconnect(); // Clean up memory instantly
            this._renderAge();
          }
        });

        this._observer.observe(this, { childList: true });
      }
    }

    disconnectedCallback() {
      // Guard against memory leaks if element is removed before parsing finishes
      if (this._observer) {
        this._observer.disconnect();
      }
    }

    /** @returns {void} */
    _renderAge() {
      const parts = this.textContent.trim().split(".");
      if (parts.length !== 3) return;

      const [day, month, year] = parts;
      const dob = new Date(
        /** @type {number} */ (/** @type {unknown} */ (year)),
        /** @type {number} */ (/** @type {unknown} */ (month)),
        /** @type {number} */ (/** @type {unknown} */ (day))
      );

      const today = /** @type {any} */ (window)[varKey]
        ? new Date(/** @type {any} */ (window)[varKey])
        : new Date();

      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      const suffix = this.hasAttribute("data-suffix");

      this.innerHTML = /** @type {string} */ (
        /** @type {unknown} */ (suffix ? `${age} ${this._getSuffix(age)}` : age)
      );
    }

    /**
     * Russian year-word inflection for a given age.
     *
     * @param {number} age
     * @returns {string}
     */
    _getSuffix(age) {
      const lastDigit = age % 10;
      const lastTwoDigits = age % 100;

      switch (true) {
        case lastDigit === 1 && lastTwoDigits !== 11:
          return "год";
        case [2, 3, 4].includes(lastDigit) &&
          ![12, 13, 14].includes(lastTwoDigits):
          return "года";
        default:
          return "лет";
      }
    }
  }

  customElements.define(tagName, AgeFromBirthday);
}

export default defineAgeFromBirthday;
