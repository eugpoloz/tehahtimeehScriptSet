import { handleError } from "../../utils/logger";
import { hasProfile, isProperWindow, isAMS } from "../../utils/DOM";

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
        maxlength: "50",
        mask: (text) => `<p>${text}</p>`
      },
      {
        label: "Расположение текста плашки",
        name: "justify",
        type: "className",
        options: [
          {
            label: "Слева",
            value: "justify-start"
          },
          {
            label: "По центру",
            value: ""
          },
          {
            label: "Справа",
            value: "justify-end"
          }
        ],
        strict: true
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
        mask: (text) => `<p>${text}</p>`
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
  userAccessGroups = [5, 7],
  debug = true
} = {}) => {
  const profileForm = document.getElementById("profile8");

  if (!isProperWindow || !hasProfile || !profileForm) {
    return;
  }

  const access = {
    hasUserAccess: [1, 2, ...userAccessGroups].some(
      (groupId) => groupId === GroupID
    ),
    hasFullAccess: [1, 2].some((groupId) => groupId === GroupID)
  };

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
      let fldClassNames = "";

      const sectionInputsArr = Array.from(
        document
          .getElementById(`custom-fld-${configFld.name}`)
          .querySelectorAll(`input[type="text"]`)
      );

      configFld.inputs.forEach((input, i) => {
        const currentValue = sectionInputsArr[i].value;

        switch (input.type) {
          case "img":
            if (!currentValue) {
              return;
            }

            const proxifiedValue = proxy + currentValue;

            fldContents += input.mask?.(proxifiedValue) ?? proxifiedValue;
            break;
          case "text":
            if (!currentValue) {
              return;
            }
            
            fldContents += input.mask?.(currentValue) ?? currentValue;
            break;
          case "className":
            fldClassNames += fldClassNames.length
              ? " " + currentValue
              : currentValue;
            break;
        }
      });

      const fldClassNamesStr = fldClassNames.length
        ? ` class="${fldClassNames.trim()}"`
        : "";

      updatedContents += !!fldContents
        ? `<div data-custom-fld="${configFld.name}"${fldClassNamesStr}>${fldContents}</div>\n`
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

    // create fields from config
    configFld.inputs.forEach((input, i) => {
      const getContents = () => {
        switch (input.type) {
          case "img":
            return getImgSrc(initialFldContainer, proxy);
          case "text":
            return initialFldContainer?.querySelector("p").innerHTML ?? "";
          case "className":
            return initialFldContainer?.classList.toString() ?? "";
        }
      };

      const contents = getContents();

      let optionsHTML = "";
      if (input.options) {
        input.options.forEach((option) => {
          const getOptionLabel = () => {
            switch (input.type) {
              case "img":
                return proxy + option.value;
              default:
                return option.label ?? option.value;
            }
          };
          const optionLabel = getOptionLabel();

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

      const isHiddenInput =
        input.options?.length && (!isAMS() || input.strict) ? "hidden" : "";

      // create label & input
      fieldContainer.insertAdjacentHTML(
        "beforeend",
        `<div>
          <strong>${input.label}</strong>
          ${optionsHTML.length ? `<div>${optionsHTML}</div>` : ""}
          <input type="text" id="${inputId}" ${getMaxLength(input.maxlength)} ${isHiddenInput}/>
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
            previewNode.innerHTML = value;
            break;
          case "className":
            if (previewContainer.classList.length) {
              previewContainer.removeAttribute("class");
            }

            if (value.length) {
              previewContainer.classList.add(value);
            }
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
