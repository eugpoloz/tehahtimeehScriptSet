import { hasProfile, isProperWindow } from "../../utils";

const CUSTOMFLDS_MODULE_NAME = "optional/generateCustomFields";

const getImgSrc = (container, proxy) => {
  const src = container?.querySelector("img")?.getAttribute("src") ?? "";

  return proxy && src.startsWith(proxy) ? src.split(proxy)[1] : src;
};

const getPreview = (mask, contents) => {
  if (!contents) {
    return "";
  }

  return !!mask ? mask(contents) : contents;
};

const fieldConfig = [
  {
    name: "icon", // [data-custom-fld="${name}"]
    inputs: [
      {
        label: "Иконка",
        type: "img",
        mask: (src) => `<i><img src="${src}" alt="Кастомная иконка" /></i>`
      }
    ],
    userAccess: true
  },
  {
    name: "plashka",
    inputs: [
      {
        label: "Плашка",
        type: "img",
        mask: (src) => `<img src="${src}" alt="Кастомная плашка" />`
      },
      {
        label: "Текст плашки",
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
        label: "Дополнительный статус",
        type: "text",
        maxlength: "38",
        mask: (text) => `<span>${text}</span>`
      }
    ],
    userAccess: false
  }
];

const generateCustomFields = ({
  fldId = "1",
  config = fieldConfig,
  proxy = "https://external-content.duckduckgo.com/iu/?u=",
  debug = true
} = {}) => {
  const profileForm = document.getElementById("profile8");

  if (!isProperWindow || !hasProfile || !profileForm) {
    return;
    // TODO: clean up event listeners?
  }

  const fldSelector = `[name="form[fld${fldId}]"]`;
  const hasFullAccess = document
    .querySelector("#pun")
    .classList.contains("isadmin");

  const formFld = profileForm.querySelector(fldSelector);
  const fieldset = profileForm.querySelector(`fieldset:has(${fldSelector})`);

  if (!hasFullAccess) {
    fieldset.querySelector(".areafield").setAttribute("hidden", "");
  } else {
    formFld.setAttribute("readonly", "");
  }

  const refreshCustomizationFld = () => {
    const inputsArr = Array.from(customFldsContainer.querySelectorAll("input"));

    let updatedContents = "";

    config.forEach((configFld, i) => {
      let fldContents = "";

      const sectionInputsArr = Array.from(
        document
          .getElementById(`custom-fld-${configFld.name}`)
          .querySelectorAll("input")
      );

      configFld.inputs.forEach((input, i) => {
        const currentValue = sectionInputsArr[i].value;

        fldContents += getPreview(
          input.mask,
          input.type === "img" ? proxy + currentValue : currentValue
        );
      });

      updatedContents += !!fldContents
        ? `<div data-custom-fld="${configFld.name}">${fldContents}</div>\n`
        : "";
    });

    formFld.value = updatedContents.trimEnd();
  };

  const initialContainer = document.createElement("div");
  initialContainer.innerHTML = formFld.value;

  fieldset
    .querySelector(".fs-box")
    .insertAdjacentHTML(
      "afterbegin",
      `<article class="teh-customFld" id="custom-flds" hidden></article>`
    );

  const customFldsContainer = document.getElementById("custom-flds");

  config.forEach((configFld) => {
    if (!configFld.userAccess && GroupID > 2) {
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
      const contents =
        input.type === "img"
          ? getImgSrc(initialFldContainer, proxy)
          : (initialFldContainer?.innerText ?? "");

      // create label & input
      fieldContainer.insertAdjacentHTML(
        "beforeend",
        `<label>
          <span>${input.label}</span>
          <br/>
          <input type="text" maxlength=${input.maxlength ? input.maxlength : undefined} />
        </label>`
      );

      // create & insert initial preview
      previewContainer.insertAdjacentHTML(
        "beforeend",
        getPreview(input.mask, contents)
      );

      const labelNode = fieldContainer.querySelectorAll("label")[i];
      const inputNode = labelNode.querySelector("input");
      const previewNode = Array.from(previewContainer.childNodes)[i];

      // set input value & event listener?
      inputNode.value = contents;
      const handleInputChange = (e) => {
        // refresh preview
        switch (input.type) {
          case "img":
            const previewImg =
              previewNode.nodeName === "IMG"
                ? previewNode
                : previewNode.querySelector("img");

            previewImg.setAttribute("src", e.target.value);
            break;
          case "text":
          default:
            previewNode.innerHTML = e.target.value;
            break;
        }

        refreshCustomizationFld();
      };
      inputNode.addEventListener("change", handleInputChange, true);
    });
  });

  customFldsContainer.removeAttribute("hidden");
};

export default generateCustomFields;
