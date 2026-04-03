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
    }

    const bssTarget = document.querySelector("#bss-target");
    const html = `<div id="bss-fastsubmit" class="fastsubmit">Для быстрой отправки нажмите <strong>Ctrl+Enter</strong> (<strong>Cmd+Enter</strong>).</div>`;

    bssTarget?.insertAdjacentHTML("afterbegin", html);
  }
}
