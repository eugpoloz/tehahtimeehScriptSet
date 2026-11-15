export default function submitPostOnHotkey() {
  if (typeof FORUM.editor === "object" && typeof FORUM.topic === "object") {
    const textarea = document.querySelector("#main-reply");
    if (textarea instanceof HTMLTextAreaElement) {
      const submitInput = textarea.form?.querySelector('input[name="submit"]');
      let shortcutPressed = false;
      let enterReleased = false;

      /** @param {KeyboardEvent} event */
      function checkPressed(event) {
        const { key, ctrlKey, metaKey } = event;
        if (
          key === "Enter" &&
          (ctrlKey || metaKey) &&
          submitInput instanceof HTMLElement
        ) {
          event.preventDefault();
          shortcutPressed = true;
          enterReleased = false;
        }
      }

      /** @param {KeyboardEvent} event */
      function checkReleased(event) {
        if (!shortcutPressed) {
          return;
        }

        if (event.key === "Enter") {
          enterReleased = true;
        }

        if (enterReleased && !event.ctrlKey && !event.metaKey) {
          shortcutPressed = false;
          if (submitInput instanceof HTMLElement) {
            // Let the forum finish saving this keyup before it clears the draft.
            setTimeout(() => submitInput.click(), 0);
          }
        }
      }

      textarea.addEventListener("keydown", checkPressed);
      // Wait for both keys to be released before submitting.
      textarea.addEventListener("keyup", checkReleased);
      textarea.addEventListener("blur", () => {
        shortcutPressed = false;
      });

      const submitControls = submitInput?.closest(".formsubmit");
      const html = `<small id="teh-fastsubmit" class="reply__hint">Для быстрой отправки нажмите <kbd class="reply__emphasis"><kbd>Ctrl</kbd>+<kbd>Enter</kbd></kbd> (<kbd class="reply__emphasis"><kbd>Cmd</kbd>+<kbd>Enter</kbd></kbd> для Mac).</small>`;

      submitControls?.insertAdjacentHTML("beforeend", html);
    }
  }
}
