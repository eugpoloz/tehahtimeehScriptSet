export default function submitPostOnHotkey() {
  if (typeof FORUM.editor === "object" && typeof FORUM.topic === "object") {
    const textarea = document.querySelector("#main-reply");
    const submitInput = document.querySelector(`input[name="submit"]`);

    if (textarea instanceof HTMLTextAreaElement) {
      function checkClicked({ key, ctrlKey, metaKey }) {
        if (key === "Enter" && (ctrlKey || metaKey)) {
          submitInput?.click();
          textarea.value = "";
        }
      }

      textarea.addEventListener("keydown", checkClicked);

      const tehTarget = document.querySelector("#teh-target");
      const html = `<div id="teh-fastsubmit" class="fastsubmit">Для быстрой отправки нажмите <strong><kbd>Ctrl</kbd>+<kbd>Enter</kbd></strong> (<strong><kbd>Cmd</kbd>+<kbd>Enter</kbd></strong> для Mac).</div>`;

      tehTarget?.insertAdjacentHTML("afterbegin", html);
    }
  }
}
