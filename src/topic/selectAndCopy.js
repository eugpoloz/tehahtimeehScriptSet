function selectElementText(el) {
  let range = document.createRange();
  range.selectNodeContents(el);
  let selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

function copySelectionText() {
  let copysuccess;
  try {
    copysuccess = document.execCommand("copy"); // run command to copy selected text to clipboard
  } catch (e) {
    copysuccess = false;
  }
  return copysuccess;
}

// OUR CODE
// helper func
function changeText(el, innerHTML) {
  if (el) {
    el.innerHTML = innerHTML;
    return;
  }
}

export default function selectableCodeBox(props) {
  let text = "Выделить и скопировать:";
  let copiedText = "Скопировано в буфер обмена!";

  if (props) {
    if (props.text) {
      text = props.text;
    }

    if (props.copiedText) {
      copiedText = props.copiedText;
    }
  }

  const textHTML = `<a href="#">${text}</a>`;

  function codeSelector(e) {
    e.preventDefault();
    const { target } = e;

    if (
      target instanceof HTMLElement &&
      (target.tagName === "PRE" || target.tagName === "A")
    ) {
      const nearestParent = target.closest(".code-box");

      if (nearestParent instanceof HTMLElement) {
        const elToSelect =
          target.tagName === "PRE"
            ? target
            : nearestParent.querySelector("pre");
        const elLegend = nearestParent.querySelector(".legend");

        if (elToSelect instanceof HTMLPreElement) {
          selectElementText(elToSelect);
          const copysuccess = copySelectionText();
          if (copysuccess === true) {
            // let's show user that our stuff is copied to clipboard
            if (elLegend) {
              changeText(elLegend, copiedText);
              let timer;

              function revertTextBack() {
                window.clearTimeout(timer);
                timer = window.setTimeout(
                  () => changeText(elLegend, textHTML),
                  // in ms
                  3000
                );
              }

              revertTextBack();
            }
          }
        }
      }
    }
  }

  function remakeCodeBoxes() {
    const codeboxNodeList = document.querySelectorAll(".code-box");
    if (codeboxNodeList.length > 0) {
      codeboxNodeList.forEach((node) => {
        const legend = node.querySelector(".legend");
        if (legend) {
          changeText(legend, textHTML);
        }
        node.addEventListener("click", codeSelector);
      });
    }
  }

  if (document.readyState !== "complete") {
    document.addEventListener("DOMContentLoaded", remakeCodeBoxes);
  } else {
    remakeCodeBoxes();
  }
}
