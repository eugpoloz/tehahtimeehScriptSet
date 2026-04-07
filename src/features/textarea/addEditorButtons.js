const addEditorButtons = (btnConfig = []) => {
  console.log("[tehMainReply] addEditorButtons()", btnConfig);
  btnConfig.forEach((btn) => {
    const btnTarget = document.getElementById(btn.target);

    const btnHTML = `<td id="${btn.id}" title="${btn.title}"><img onclick="${btn.onclick}" src="/i/blank.gif"></td>`;

    if (btnTarget instanceof HTMLElement) {
      btnTarget.insertAdjacentHTML("afterend", btnHTML);
    }
  });
};

export default addEditorButtons;
