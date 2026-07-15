function defineAgeFromBirthday(tagName, varKey = "GAME_LATEST_DATE") {
  class AgeFromBirthday extends HTMLElement {
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
            this._observer.disconnect(); // Clean up memory instantly
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

    _renderAge() {
      const parts = this.textContent.trim().split(".");
      if (parts.length !== 3) return;

      const [day, month, year] = parts;
      const dob = new Date(year, month, day);

      const today = window[varKey] ? new Date(window[varKey]) : new Date();

      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      const suffix = this.hasAttribute("data-suffix");

      this.innerHTML = suffix ? `${age} ${this._getSuffix(age)}` : age;
    }

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
