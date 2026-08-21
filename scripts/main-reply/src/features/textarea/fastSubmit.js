export default function submitPostOnHotkey() {
  if (typeof FORUM.editor === "object" && typeof FORUM.topic === "object") {
    const textarea = document.querySelector("#main-reply");
    const submitInput = document.querySelector(`input[name="submit"]`);

    if (textarea instanceof HTMLTextAreaElement) {
      const editor = textarea;

      /** @param {KeyboardEvent} event */
      function checkClicked(event) {
        const { key, ctrlKey, metaKey } = event;
        if (key === "Enter" && (ctrlKey || metaKey)) {
          if (submitInput instanceof HTMLElement) {
            submitInput.click();
          }
          editor.value = "";
        }
      }

      textarea.addEventListener("keydown", checkClicked);

      const tehTarget = document.querySelector("#teh-target");
      const html = `<div id="teh-fastsubmit" class="fastsubmit">Для быстрой отправки нажмите <strong><kbd>Ctrl</kbd>+<kbd>Enter</kbd></strong> (<strong><kbd>Cmd</kbd>+<kbd>Enter</kbd></strong> для Mac).</div>`;

      tehTarget?.insertAdjacentHTML("afterbegin", html);
    }
  }
}
