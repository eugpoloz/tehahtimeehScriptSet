import { getSubject } from "../../helpers/get-subject";

/**
 * Displays the episode/theme subject: light-DOM children if present,
 * otherwise the relevant part of the forum subject line.
 */
class ThemeSubject extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open", slotAssignment: "manual" });

    /** @type {ShadowRoot} */ (this.shadowRoot).innerHTML = `
        <style>p { margin-block: 0; }</style>
        <p><slot id="subject">Название эпизода</slot></p>
      `;
  }

  /** @returns {void} */
  connectedCallback() {
    this.updateSlots();
  }

  /** @returns {void} */
  updateSlots() {
    const subject = /** @type {HTMLSlotElement} */ (
      /** @type {ShadowRoot} */ (this.shadowRoot).getElementById("subject")
    );

    let content = "";

    if (this.childNodes.length > 0) {
      content = Array.from(this.childNodes)
        .map((node) => node.textContent)
        .join("\n");
    } else {
      const episodeSubject = /** @type {string} */ (getSubject(this)).split(
        /[|/\\\\]/
      );

      content =
        episodeSubject.length > 1 ? episodeSubject[1] : episodeSubject[0];
    }

    this.innerHTML = "";

    const slotNode = document.createTextNode(content.trim());
    this.appendChild(slotNode);

    subject.assign(slotNode);
  }
}

export default ThemeSubject;
