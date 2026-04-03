const changeFontSize = () => {
  const LOCALSTORAGE_SIZE_KEY = "userFontSize";
  const CSS_VARIABLE_SIZE_KEY = "--dynamic-font-size";

  try {
    const pun = document.getElementById("pun");
    const postContent = document.querySelector(".post-content");

    if (!postContent) {
      return;
    }
    const getComputedFontSizeFromPost = () =>
      Number(window.getComputedStyle(postContent).fontSize.slice(0, -2));

    const setDynamicFontSize = (size) => {
      pun.style.setProperty(CSS_VARIABLE_SIZE_KEY, `${size}px`);
      localStorage.setItem(LOCALSTORAGE_SIZE_KEY, size);

      console.log("changeFontSize() >>> setDynamicFontSize()", {
        size
      });
    };

    const userFontSize = Number(
      localStorage.getItem(LOCALSTORAGE_SIZE_KEY) ??
        getComputedFontSizeFromPost()
    );

    if (userFontSize) {
      setDynamicFontSize(userFontSize);
    }

    const increaseFontSize = () => {
      const currentFontSize = getComputedFontSizeFromPost();
      const updatedFontSize = currentFontSize + 1;

      if (updatedFontSize > 36) {
        return false;
      }

      setDynamicFontSize(updatedFontSize);
    };

    const decreaseFontSize = () => {
      const currentFontSize = getComputedFontSizeFromPost();
      const updatedFontSize = currentFontSize - 1;

      if (updatedFontSize < 8) {
        return false;
      }

      setDynamicFontSize(updatedFontSize);
    };

    const resetFontSize = () => {
      pun.style.removeProperty(CSS_VARIABLE_SIZE_KEY);
      localStorage.removeItem(LOCALSTORAGE_SIZE_KEY);
    };

    const btnIncrease = document.getElementById("text-increase");
    btnIncrease.addEventListener("click", increaseFontSize);

    const btnDecrease = document.getElementById("text-decrease");
    btnDecrease?.addEventListener("click", decreaseFontSize);

    const btnReset = document.getElementById("text-clear");
    btnReset?.addEventListener("click", resetFontSize);
  } catch (e) {
    console.error("changeFontSize() >>> FAILED! Error:", e);
  }
};

export default changeFontSize;
