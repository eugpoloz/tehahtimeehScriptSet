import { handleLogs } from "@teh/utils";
import { hasProfile, isProperWindow, isAMS } from "@teh/utils";
import { CUSTOMFLDS_MODULE_NAME } from "../const";
import {
  getImgSrc,
  getMaxLength,
  getCollectionPageHref,
  parseDataFromHTML,
  loadCollectionPage,
  mergeOptionsWithCollection,
  getCollectionName
} from "../helpers/collection";

/**
 * @typedef {object} CustomFieldOption
 * @property {string} [label] Visible label HTML (used when value is empty or for non-img types).
 * @property {string} [value] Stored value (image URL for `img`, class name for `className`, etc.).
 */

/**
 * @typedef {"img" | "text" | "className"} CustomFieldInputType
 */

/**
 * @typedef {object} CustomFieldInput
 * @property {string} label Field label shown in the editor UI.
 * @property {string} [name] Input name; also used as `data-collection` when `collection` is `true`.
 * @property {CustomFieldInputType} type How the value is read/written into the custom field HTML.
 * @property {(value: string) => string} [mask] Wraps the value for preview / saved HTML.
 * @property {CustomFieldOption[]} [options] Built-in radio options (defaults before collection merge).
 * @property {boolean | string} [collection] Load extra options from `[data-collection]` on the personal page. `true` uses `name`; a string sets the collection key explicitly.
 * @property {string} [maxlength] Max length for free-text inputs.
 * @property {boolean} [strict] When true, hide the free-text input even for AMS (options only).
 */

/**
 * @typedef {object} CustomFieldSection
 * @property {string} name Section key written as `[data-custom-fld="${name}"]`.
 * @property {CustomFieldInput[]} inputs Controls rendered for this section.
 * @property {boolean} userAccess Whether non-admin character groups may edit this section.
 */

/**
 * @typedef {object} GenerateCustomFieldsOptions
 * @property {string} fldId Profile field that stores the generated custom-field HTML.
 * @property {string} collectionFldId Profile field with the personal page URL or `<a href="…">`.
 * @property {CustomFieldSection[]} config Field sections to render.
 * @property {string} proxy Image proxy prefix applied to img URLs in preview/saved HTML.
 * @property {number[]} userAccessGroups Extra group IDs (beyond AMS) allowed to use the editor.
 * @property {boolean} [debug] Enable debug logging.
 */

/**
 * Renders the profile custom-fields editor and syncs choices into `form[fld…]`.
 * @param {GenerateCustomFieldsOptions} options
 * @returns {Promise<void>}
 */
const generateCustomFields = async ({
  fldId,
  collectionFldId,
  config,
  proxy,
  userAccessGroups,
  debug = false
}) => {
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

  /** @type {Map<string, string[]>} */
  const collectionOptionsByName = new Map();

  const collectionInputs = config.flatMap((configFld) =>
    configFld.inputs
      .map((input) => ({
        input,
        collectionName: getCollectionName(input.collection, input.name)
      }))
      .filter(({ collectionName }) => !!collectionName)
  );

  if (collectionInputs.length) {
    const collectionFld = profileForm.querySelector(
      `[name="form[fld${collectionFldId}]"]`
    );
    const pageHref = getCollectionPageHref(collectionFld?.value ?? "");

    handleLogs(
      {
        debug,
        module: CUSTOMFLDS_MODULE_NAME,
        message: "collection source"
      },
      { collectionFldId, pageHref }
    );

    if (pageHref) {
      const pageUrl = new URL(pageHref, window.location.origin).href;
      const collectionDoc = await loadCollectionPage(pageUrl);

      if (collectionDoc) {
        collectionInputs.forEach(({ collectionName }) => {
          if (collectionOptionsByName.has(collectionName)) {
            return;
          }

          const urls = parseDataFromHTML(
            collectionDoc,
            `[data-collection="${collectionName}"]`
          );
          collectionOptionsByName.set(collectionName, urls);

          handleLogs(
            {
              debug,
              module: CUSTOMFLDS_MODULE_NAME,
              message: "collection loaded"
            },
            { collectionName, count: urls.length }
          );
        });
      }
    }
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
    let updatedContents = "";

    config.forEach((configFld) => {
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

      handleLogs(
        {
          debug,
          module: CUSTOMFLDS_MODULE_NAME,
          message: "input contents"
        },
        { name: input.name, contents }
      );

      const collectionName = getCollectionName(input.collection, input.name);
      const resolvedOptions = mergeOptionsWithCollection(
        input.options,
        collectionName
          ? (collectionOptionsByName.get(collectionName) ?? [])
          : []
      );

      let optionsHTML = "";
      if (resolvedOptions.length) {
        resolvedOptions.forEach((option) => {
          const getOptionLabel = () => {
            switch (input.type) {
              case "img":
                return option.value
                  ? proxy + option.value
                  : (option.label ?? option.value);
              default:
                return option.label ?? option.value;
            }
          };
          const optionLabel = getOptionLabel();

          const dataAttr =
            input.name === configFld.name
              ? ` data-custom-fld="${configFld.name}"`
              : "";

          const optionLabelHTML =
            !!option.value && !!input.mask
              ? input.mask?.(optionLabel)
              : optionLabel;

          const html = `<label>
            <span${dataAttr}>${optionLabelHTML}</span>
            <input type="radio" name="${input.name}" value="${option.value}"/>
          </label>`;

          optionsHTML += html;
        });
      }

      const inputId = `input_${input.name}`;

      const isHiddenInput =
        resolvedOptions.length && (!isAMS() || input.strict) ? "hidden" : "";

      // create label & input
      fieldContainer.insertAdjacentHTML(
        "beforeend",
        `<div id="${inputId}_fldContainer">
          <strong>${input.label}</strong>
          ${optionsHTML.length ? `<div class="relative"><div class="scrollable">${optionsHTML}</div></div>` : ""}
          <input type="text" id="${inputId}" ${getMaxLength(input.maxlength)} ${isHiddenInput}/>
        </div>`
      );

      // create & insert initial preview
      switch (input.type) {
        case "className":
          if (contents.length) {
            previewContainer.classList.add(contents);
          }
          break;
        case "text":
          previewContainer.insertAdjacentHTML(
            "beforeend",
            input.mask?.(contents) ?? contents
          );
          break;
        case "img":
          const proxifiedContents = contents.length
            ? proxy + contents
            : contents;

          previewContainer.insertAdjacentHTML(
            "beforeend",
            input.mask?.(proxifiedContents) ?? proxifiedContents
          );
      }

      const previewNode = Array.from(previewContainer.childNodes)[i];
      const inputContainer = fieldContainer.querySelector(
        `div:has(> #${inputId})`
      );
      const inputNode = document.getElementById(inputId);

      // handle options
      const optionNodesArr = Array.from(
        inputContainer.querySelectorAll(`input[type="radio"]`)
      );
      const selectExistingOption = (value) => {
        if (!resolvedOptions.length) {
          return;
        }

        const selectedOption = inputContainer.querySelector(
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

            if (!previewImg) {
              break;
            }

            if (value.length) {
              previewImg.setAttribute("src", proxy + value);
              previewImg.removeAttribute("hidden");
            } else {
              previewImg.removeAttribute("src");
              previewImg.setAttribute("hidden", "");
            }
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
        }
      };

      if (input.type === "img") {
        updatePreviewOnInputChange(contents);
      }

      const handleTextInputChange = (e) => {
        updatePreviewOnInputChange(e.target.value);
        refreshCustomizationFld();

        selectExistingOption(e.target.value);
      };
      inputNode.addEventListener("change", handleTextInputChange, true);

      if (resolvedOptions.length) {
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
