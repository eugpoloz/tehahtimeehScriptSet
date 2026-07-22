/**
 * Adds the X-Clacks-Overhead tribute meta tag to the document head. A Tribute to Sir Terry Pratchett.
 * @returns {void}
 */
function gnu() {
  /** @type {string} */
  const html = `<meta http-equiv="X-Clacks-Overhead" content="GNU Terry Pratchett">`;

  document.head?.insertAdjacentHTML("beforeend", html);
}

export default gnu;
