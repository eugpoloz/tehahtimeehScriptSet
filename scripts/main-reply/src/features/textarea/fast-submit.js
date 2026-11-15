export default function submitPostOnHotkey() {
  if (typeof FORUM.editor === "object" && typeof FORUM.topic === "object") {
    const textarea = document.querySelector("#main-reply");
    if (textarea instanceof HTMLTextAreaElement) {
      const submitInput = textarea.form?.querySelector('input[name="submit"]');

      /** @param {KeyboardEvent} event */
      function checkClicked(event) {
        const { key, ctrlKey, metaKey } = event;
        if (key === "Enter" && (ctrlKey || metaKey)) {
          if (submitInput instanceof HTMLElement) {
            submitInput.click();
          }
        }
      }

      textarea.addEventListener("keydown", checkClicked);

      const submitControls = submitInput?.closest(".formsubmit");
      const html = `<small id="teh-fastsubmit" class="reply__hint">Для быстрой отправки нажмите <kbd class="reply__emphasis"><kbd>Ctrl</kbd>+<kbd>Enter</kbd></kbd> (<kbd class="reply__emphasis"><kbd>Cmd</kbd>+<kbd>Enter</kbd></kbd> для Mac).</small>`;

      submitControls?.insertAdjacentHTML("beforeend", html);
    }
  }
}
