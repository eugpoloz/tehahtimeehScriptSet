import {
  hasProfile,
  isProperWindow,
  isAMS,
  handleError,
  handleLogs
} from "../../utils";

const CUSTOMFLDS_MODULE_NAME = "optional/generateCustomFields";

const getImgSrc = (container, proxy) => {
  const src = container?.querySelector("img")?.getAttribute("src") ?? "";

  return proxy && src.startsWith(proxy) ? src.split(proxy)[1] : src;
};

const getMaxLength = (maxlength) =>
  !!maxlength ? `maxlength=${maxlength}` : "";

const fieldConfig = [
  {
    name: "icon", // [data-custom-fld="${name}"]
    inputs: [
      {
        label: "Иконка",
        name: "icon",
        type: "img",
        mask: (src) => `<i><img src="${src}" alt="Кастомная иконка" /></i>`,
        options: [
          {
            value: "https://cdn.imgchest.com/files/7b7d928ec1eb.png"
          },
          {
            value: "https://cdn.imgchest.com/files/5bf991bab422.png"
          }
        ]
      }
    ],
    userAccess: true
  },
  {
    name: "plashka",
    inputs: [
      {
        label: "Плашка",
        name: "plashka",
        type: "img",
        mask: (src) => `<img src="${src}" alt="Кастомная плашка" />`,
        options: [
          {
            value: "https://cdn.imgchest.com/files/c37f246a483c.png"
          },
          {
            value: "https://cdn.imgchest.com/files/dd7a83b76718.png"
          }
        ]
      },
      {
        label: "Текст плашки",
        name: "plashka-txt",
        type: "text",
        mask: (text) => `<p>${text}</p>`
      }
    ],
    userAccess: true
  },
  {
    name: "admin",
    inputs: [
      {
        label: "Дополнительный статус АМС",
        type: "text",
        maxlength: "38",
        mask: (text) => `<span>${text}</span>`
      }
    ],
    userAccess: false
  }
];

const generateCustomFields = async ({
  fldId = "1",
  config = fieldConfig,
  proxy = "https://external-content.duckduckgo.com/iu/?u=",
  // Персонажи, Персонажи в архиве
  userAccessGroups = ["5", "7"],
  debug = true
} = {}) => {
  const profileForm = document.getElementById("profile8");

  if (!isProperWindow || !hasProfile || !profileForm) {
    return;
  }

  let profileGroupID;

  const profileId = new URLSearchParams(window.location.search).get("id");
  if (profileId !== UserID) {
    // get user data from API for access controls
    try {
      const data = await fetch(
        `${window.location.origin}/api.php?method=users.get&fields=user_id,username,group_id&limit=200&user_id=${profileId}`
      );

      const response = await data.json();

      let { users } = response.response;

      profileGroupID = users[0].group_id;
    } catch (e) {
      handleError(CUSTOMFLDS_MODULE_NAME, e);
    }
  } else {
    profileGroupID = GroupID;
  }

  const access = {
    hasUserAccess: ["1", "2", ...userAccessGroups].some(
      (groupId) => groupId === profileGroupID
    ),
    hasFullAccess: ["1", "2"].some((groupId) => groupId === profileGroupID)
  };

  // lets see
  handleLogs(
    {
      debug,
      module: CUSTOMFLDS_MODULE_NAME,
      message: "custom fld access"
    },
    {
      profileId,
      profileGroupID,
      access
    }
  );

  const fldSelector = `[name="form[fld${fldId}]"]`;

  const formFld = profileForm.querySelector(fldSelector);
  const fieldset = profileForm.querySelector(`fieldset:has(${fldSelector})`);

  formFld.setAttribute("readonly", "");
  if (!isAMS) {
    fieldset.querySelector(".areafield").setAttribute("hidden", "");
  }

  if (!access.hasUserAccess) {
    return;
  }

  const initialContainer = document.createElement("div");
  initialContainer.innerHTML = formFld.value;

  fieldset
    .querySelector(".fs-box")
    .insertAdjacentHTML(
      "afterbegin",
      `<article class="teh-customFld" id="custom-flds" hidden></article>`
    );

  const customFldsContainer = document.getElementById("custom-flds");

  const refreshCustomizationFld = () => {
    const inputsArr = Array.from(
      customFldsContainer.querySelectorAll(`input[type="text"]`)
    );

    let updatedContents = "";

    config.forEach((configFld, i) => {
      if (!configFld.userAccess && !access.hasFullAccess) {
        return;
      }

      let fldContents = "";

      const sectionInputsArr = Array.from(
        document
          .getElementById(`custom-fld-${configFld.name}`)
          .querySelectorAll(`input[type="text"]`)
      );

      configFld.inputs.forEach((input, i) => {
        const currentValue = sectionInputsArr[i].value;

        if (!currentValue) {
          return;
        }

        const proxifiedValue =
          input.type === "img" ? proxy + currentValue : currentValue;

        fldContents += input.mask?.(proxifiedValue) ?? proxifiedValue;
      });

      updatedContents += !!fldContents
        ? `<div data-custom-fld="${configFld.name}">${fldContents}</div>\n`
        : "";
    });

    formFld.value = updatedContents.trimEnd();
  };

  config.forEach((configFld) => {
    if (!configFld.userAccess && !access.hasFullAccess) {
      return;
    }

    const initialFldContainer = initialContainer.querySelector(
      `[data-custom-fld=${configFld.name}]`
    );

    const sectionId = `custom-fld-${configFld.name}`;
    const sectionFldsId = sectionId + "_flds";
    const sectionPreviewId = sectionId + "_preview";

    const fldHTML = `<section class="teh-customFld__section" id="${sectionId}">
      <div id="${sectionFldsId}" class="teh-customFld__fields"></div>
      <div class="teh-customFld__preview">
        <div id="${sectionPreviewId}" data-custom-fld="${configFld.name}"></div>
      </div>
    </section>`;

    customFldsContainer.insertAdjacentHTML("beforeend", fldHTML);

    const section = document.getElementById(sectionId);
    const fieldContainer = document.getElementById(sectionFldsId);
    const previewContainer = document.getElementById(sectionPreviewId);

    // lets see
    // handleLogs(
    //   {
    //     debug,
    //     module: CUSTOMFLDS_MODULE_NAME,
    //     message: "containers created"
    //   },
    //   {
    //     section,
    //     fieldContainer,
    //     previewContainer
    //   }
    // );

    // create fields from config
    configFld.inputs.forEach((input, i) => {
      const contents =
        input.type === "img"
          ? getImgSrc(initialFldContainer, proxy)
          : (initialFldContainer?.innerText ?? "");

      let optionsHTML = "";
      if (input.options) {
        input.options.forEach((option) => {
          const optionLabel =
            input.type === "img" ? proxy + option.value : option.value;

          const dataAttr =
            input.name === configFld.name
              ? ` data-custom-fld="${configFld.name}"`
              : "";

          const html = `<label>
            <span${dataAttr}>${input.mask?.(optionLabel) ?? optionLabel}</span>
            <input type="radio" name="${input.name}" value="${option.value}" />
          </label>`;

          optionsHTML += html;
        });
      }

      const inputId = `input_${input.name}`;

      // create label & input
      fieldContainer.insertAdjacentHTML(
        "beforeend",
        `<div>
          <strong>${input.label}</strong>
          ${optionsHTML.length ? `<div>${optionsHTML}</div>` : ""}
          <input type="text" id="${inputId}" ${getMaxLength(input.maxlength)} />
        </div>`
      );

      // create & insert initial preview
      previewContainer.insertAdjacentHTML(
        "beforeend",
        input.mask?.(contents) ?? contents
      );

      const previewNode = Array.from(previewContainer.childNodes)[i];
      const inputContainer = fieldContainer.querySelector(
        `div:has(#${inputId})`
      );
      const inputNode = document.getElementById(inputId);

      // handle options
      const optionNodesArr = Array.from(
        inputContainer.querySelectorAll(`input[type="radio"]`)
      );
      const selectExistingOption = (value) => {
        if (!input.options) {
          return;
        }

        const selectedOption = fieldContainer.querySelector(
          `input[type="radio"][value="${value}"]`
        );
        if (selectedOption) {
          selectedOption.checked = true;
        } else {
          optionNodesArr.forEach((optionInputNode) => {
            optionInputNode.checked = false;
          });
        }
      };

      // set input value & event listener?
      inputNode.value = contents;
      selectExistingOption(contents);

      // refresh preview
      const updatePreviewOnInputChange = (value) => {
        switch (input.type) {
          case "img":
            const previewImg =
              previewNode.nodeName === "IMG"
                ? previewNode
                : previewNode.querySelector("img");

            previewImg.setAttribute("src", value);
            break;
          case "text":
          default:
            previewNode.innerHTML = value;
            break;
        }
      };

      const handleTextInputChange = (e) => {
        updatePreviewOnInputChange(e.target.value);
        refreshCustomizationFld();

        selectExistingOption(e.target.value);
      };
      inputNode.addEventListener("change", handleTextInputChange, true);

      if (input.options) {
        const handleRadioInputChange = (e) => {
          inputNode.value = e.target.value;

          updatePreviewOnInputChange(e.target.value);
          refreshCustomizationFld();
        };
        optionNodesArr.forEach((optionInputNode) => {
          optionInputNode.addEventListener(
            "change",
            handleRadioInputChange,
            true
          );
        });
      }
    });
  });

  customFldsContainer.removeAttribute("hidden");
};

export default generateCustomFields;
