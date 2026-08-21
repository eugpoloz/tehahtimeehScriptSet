import debounce from "lodash-es/debounce";

export default function countCharacters(counterText = "Знаков в сообщении") {
  const counterId = "teh-charcounter";

  const html = `<div id=${counterId} class="charcounter">${counterText}: <strong class="count">0</strong></div>`;

  if (typeof FORUM.editor === "object") {
    const textarea = document.getElementById("main-reply");

    /** @param {string} value */
    function updateCharCounter(value) {
      const { length } = value;

      const counter = document.querySelector(`#${counterId} .count`);
      if (counter) {
        counter.textContent = length.toString();
      }
    }

    /** @param {Event} event */
    const updateFromEvent = (event) => {
      if (event.target instanceof HTMLTextAreaElement) {
        updateCharCounter(event.target.value);
      }
    };
    const debouncedUpdate = debounce(updateFromEvent, 15);

    if (textarea instanceof HTMLTextAreaElement) {
      const tehTarget = document.querySelector("#teh-target");
      tehTarget?.insertAdjacentHTML("beforeend", html);

      if (typeof FORUM.topic === "object") {
        const id = window.location.search.substr(4);
        const savedPost = localStorage.getItem(`topic${id}`);

        if (savedPost !== null && savedPost !== undefined) {
          updateCharCounter(savedPost);
        }
      }

      [
        "focus",
        "blur",
        "keypress",
        "keyup",
        "keydown",
        "change",
        "cut",
        "paste",
        "input",
        "selectionchange",
        "propertychange"
      ].forEach((event) => {
        textarea.addEventListener(event, debouncedUpdate);
      });
    }
  }
}
