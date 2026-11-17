/**
 * Registers a custom element that replaces `DD.MM.YYYY` text with a computed age.
 * Uses the configured game date.
 *
 * @param {string} tagName Custom element tag to define.
 * @returns {Promise<void>}
 */
async function defineAgeFromBirthday(tagName) {
  const { gamePeriod } = await teh.siteContentPromise;
  const [gameYear, gameMonth, gameDay] = gamePeriod[gamePeriod.length - 1]
    .split("-")
    .map(Number);
  class AgeFromBirthday extends HTMLElement {
    /** @type {MutationObserver | undefined} */
    _observer;

    connectedCallback() {
      if (this.textContent.trim()) {
        this._renderAge();
        return;
      }

      this._observer = new MutationObserver(() => {
        if (this.textContent.trim()) {
          this._observer?.disconnect();
          this._renderAge();
        }
      });
      this._observer.observe(this, { childList: true });
    }

    disconnectedCallback() {
      this._observer?.disconnect();
    }

    /** @returns {void} */
    _renderAge() {
      const parts = this.textContent.trim().split(".");
      if (parts.length !== 3) {
        return;
      }

      const [day, month, year] = parts.map(Number);
      let age = gameYear - year;
      if (gameMonth < month || (gameMonth === month && gameDay < day)) {
        age--;
      }

      const suffix = this.hasAttribute("data-suffix");
      this.replaceChildren(
        suffix ? `${age} ${this._getSuffix(age)}` : String(age)
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
