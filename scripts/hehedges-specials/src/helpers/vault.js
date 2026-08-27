export const VAULT_MODAL_HTML = `<dialog id="vault-modal" closedby="any">
  <article id="vault-content" class="vault-modal"></article>
</dialog>`;

/**
 * Fetches vault content without the forum header.
 *
 * @param {string} url
 * @returns {Promise<HTMLElement>}
 */
export const fetchVault = async (url) => {
  const response = await fetch(`${url}&nohead`, {
    method: "GET",
    credentials: "same-origin"
  });

  if (!response.ok) {
    throw new Error(`Vault fetch failed: ${response.status}`);
  }

  const html = new TextDecoder("windows-1251").decode(
    await response.arrayBuffer()
  );
  const page = new DOMParser().parseFromString(html, "text/html");
  const main = page.getElementById("pun-main");

  if (!main) {
    throw new Error("Vault page does not contain #pun-main");
  }

  return main;
};

/**
 * Recreates scripts from fetched markup so the browser executes them.
 *
 * @param {HTMLElement} container
 * @param {HTMLElement} content
 * @returns {void}
 */
export const executeScripts = (container, content) => {
  content.querySelectorAll("script").forEach((oldScript) => {
    const newScript = document.createElement("script");

    Array.from(oldScript.attributes).forEach((attribute) => {
      newScript.setAttribute(attribute.name, attribute.value);
    });

    newScript.textContent = oldScript.textContent;
    container.append(newScript);
  });
};
