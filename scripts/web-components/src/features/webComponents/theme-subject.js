import { getSubject } from "../../helpers/getSubject";

class ThemeSubject extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open", slotAssignment: "manual" });

    this.shadowRoot.innerHTML = `
        <style>p { margin-block: 0; }</style>
        <p><slot id="subject">Название эпизода</slot></p>
      `;
  }

  connectedCallback() {
    this.updateSlots();
  }

  updateSlots() {
    const subject = this.shadowRoot.getElementById("subject");

    let content = "";

    if (this.childNodes.length > 0) {
      content = Array.from(this.childNodes)
        .map((node) => node.textContent)
        .join("\n");
    } else {
      const episodeSubject = getSubject(this).split(/[|/\\\\]/);

      content =
        episodeSubject.length > 1
          ? episodeSubject[1]
          : episodeSubject.textContent;
    }

    this.innerHTML = "";

    const slotNode = document.createTextNode(content.trim());
    this.appendChild(slotNode);

    subject.assign(slotNode);
  }
}

export default ThemeSubject;
