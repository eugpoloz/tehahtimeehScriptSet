/**
 * Restores the last reserved post to the main reply textarea.
 *
 * @returns {void}
 */
function restoreReservedPost() {
  try {
    // TODO: Enhance this with a topic-specific storage key getter.
    const reservedPost = localStorage.getItem("ReservePost");
    const mainReply = /** @type {HTMLTextAreaElement | null} */ (
      document.getElementById("main-reply")
    );

    if (!mainReply || reservedPost === null) {
      return;
    }

    mainReply.value = reservedPost;
  } catch (error) {
    console.error("Can't get localStorage.ReservePost", error);
  }
}

export default restoreReservedPost;
