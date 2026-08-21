import { handleLogs } from "@teh/utils";
import { hasProfile, isProperWindow, isAMS } from "@teh/utils";
import { CUSTOMFLDS_MODULE_NAME } from "../const";
import {
  getMaxLength,
  getCollectionPageHref,
  parseDataFromHTML,
  loadCollectionPage,
  mergeOptionsWithCollection,
  getCollectionName,
  setClassTokens,
  readInputContents,
  maskInputValue,
  getOptionLabel,
  updatePreview
} from "../helpers";

/**
 * @typedef {import("../types.js").CustomFieldOption} CustomFieldOption
 * @typedef {import("../types.js").CustomFieldInput} CustomFieldInput
 * @typedef {import("../types.js").CustomFieldSection} CustomFieldSection
 * @typedef {import("../types.js").GenerateCustomFieldsOptions} GenerateCustomFieldsOptions
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

  const currentGroupId = Number(GroupID);
  const access = {
    hasUserAccess: [1, 2, ...userAccessGroups].some(
      (groupId) => groupId === currentGroupId
    ),
    hasFullAccess: [1, 2].some((groupId) => groupId === currentGroupId)
  };

  if (!access.hasUserAccess) {
    return;
  }

  const fldSelector = `[name="form[fld${fldId}]"]`;
  const formFld = /** @type {HTMLInputElement | HTMLTextAreaElement | null} */ (
    profileForm.querySelector(fldSelector)
  );
  const fieldset = profileForm.querySelector(`fieldset:has(${fldSelector})`);
  const fsBox = fieldset?.querySelector(".fs-box");

  if (!formFld || !fieldset || !fsBox) {
    return;
  }

  formFld.setAttribute("readonly", "");
  if (!isAMS()) {
    fieldset.querySelector(".areafield")?.setAttribute("hidden", "");
  }

  /** @param {CustomFieldSection} section */
  const canEditSection = (section) =>
    section.userAccess || access.hasFullAccess;

  /** @type {Map<string, string[]>} */
  const collectionOptionsByName = new Map();

  const collectionInputs = config.flatMap((section) =>
    section.inputs
      .map((input) => ({
        input,
        collectionName: getCollectionName(input.collection, input.name)
      }))
      .filter(({ collectionName }) => !!collectionName)
  );

  if (collectionInputs.length) {
    const collectionFld = /** @type {HTMLInputElement | null} */ (
      profileForm.querySelector(`[name="form[fld${collectionFldId}]"]`)
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

  const containerId = `custom-flds-${fldId}`;
  document.getElementById(containerId)?.remove();

  fsBox.insertAdjacentHTML(
    "afterbegin",
    `<article class="teh-customFld" id="${containerId}" hidden></article>`
  );

  const customFldsContainer = document.getElementById(containerId);
  if (!customFldsContainer) {
    return;
  }

  /** @param {string} sectionName */
  const getSectionId = (sectionName) => `custom-fld-${fldId}-${sectionName}`;
  /** @param {string} inputName */
  const getInputId = (inputName) => `input_${fldId}_${inputName}`;
  /** @param {string} inputName */
  const getRadioName = (inputName) => `fld${fldId}_${inputName}`;

  const refreshCustomizationFld = () => {
    let updatedContents = "";

    config.forEach((section) => {
      if (!canEditSection(section)) {
        return;
      }

      let fldContents = "";
      let fldClassNames = "";

      const sectionEl = customFldsContainer.querySelector(
        `#${getSectionId(section.name)}`
      );
      if (!sectionEl) {
        return;
      }

      const sectionInputsArr = /** @type {HTMLInputElement[]} */ (
        Array.from(sectionEl.querySelectorAll(`input[type="text"]`))
      );

      section.inputs.forEach((input, i) => {
        const currentValue = sectionInputsArr[i]?.value ?? "";

        if (input.type === "className") {
          fldClassNames += fldClassNames.length
            ? " " + currentValue
            : currentValue;
          return;
        }

        if (!currentValue) {
          return;
        }

        fldContents += maskInputValue(input, currentValue, proxy);
      });

      const fldClassNamesStr = fldClassNames.length
        ? ` class="${fldClassNames.trim()}"`
        : "";

      updatedContents += !!fldContents
        ? `<div data-custom-fld="${section.name}"${fldClassNamesStr}>${fldContents}</div>\n`
        : "";
    });

    formFld.value = updatedContents.trimEnd();
  };

  config.forEach((section) => {
    if (!canEditSection(section)) {
      return;
    }

    const initialFldContainer = initialContainer.querySelector(
      `[data-custom-fld="${section.name}"]`
    );

    const sectionId = getSectionId(section.name);
    const sectionFldsId = sectionId + "_flds";
    const sectionPreviewId = sectionId + "_preview";

    customFldsContainer.insertAdjacentHTML(
      "beforeend",
      `<section class="teh-customFld__section" id="${sectionId}">
        <div id="${sectionFldsId}" class="teh-customFld__fields"></div>
        <div class="teh-customFld__preview">
          <div id="${sectionPreviewId}" data-custom-fld="${section.name}"></div>
        </div>
      </section>`
    );

    const fieldContainer = customFldsContainer.querySelector(
      `#${sectionFldsId}`
    );
    const previewContainer = customFldsContainer.querySelector(
      `#${sectionPreviewId}`
    );

    if (!fieldContainer || !previewContainer) {
      return;
    }

    section.inputs.forEach((input) => {
      const contents = readInputContents(input, initialFldContainer, proxy);

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

      const radioName = getRadioName(input.name);

      let optionsHTML = "";
      if (resolvedOptions.length) {
        resolvedOptions.forEach((option) => {
          const optionValue = option.value ?? "";
          const optionLabel = getOptionLabel(
            input,
            optionValue,
            option.label,
            proxy
          );

          const dataAttr =
            input.name === section.name
              ? ` data-custom-fld="${section.name}"`
              : "";

          const optionLabelHTML =
            !!optionValue && !!input.mask
              ? input.mask?.(optionLabel)
              : optionLabel;

          optionsHTML += `<label>
            <span${dataAttr}>${optionLabelHTML}</span>
            <input type="radio" name="${radioName}" value="${optionValue}"/>
          </label>`;
        });
      }

      const inputId = getInputId(input.name);
      const isHiddenInput =
        resolvedOptions.length && (!isAMS() || input.strict) ? "hidden" : "";

      fieldContainer.insertAdjacentHTML(
        "beforeend",
        `<div id="${inputId}_fldContainer">
          <strong>${input.label}</strong>
          ${optionsHTML.length ? `<div class="relative"><div class="scrollable">${optionsHTML}</div></div>` : ""}
          <input type="text" id="${inputId}" ${getMaxLength(input.maxlength)} ${isHiddenInput}/>
        </div>`
      );

      /** @type {Element | null} */
      let previewNode = null;

      switch (input.type) {
        case "className":
          if (contents.length) {
            setClassTokens(previewContainer.classList, contents);
          }
          break;
        case "text":
          previewContainer.insertAdjacentHTML(
            "beforeend",
            maskInputValue(input, contents, proxy)
          );
          previewNode = previewContainer.lastElementChild;
          break;
        case "img":
          previewContainer.insertAdjacentHTML(
            "beforeend",
            contents.length
              ? maskInputValue(input, contents, proxy)
              : (input.mask?.("") ?? "")
          );
          previewNode = previewContainer.lastElementChild;
      }

      const inputContainer = fieldContainer.querySelector(
        `div:has(> #${inputId})`
      );
      const inputNode = /** @type {HTMLInputElement | null} */ (
        fieldContainer.querySelector(`#${inputId}`)
      );

      if (!inputContainer || !inputNode) {
        return;
      }

      const optionNodesArr = /** @type {HTMLInputElement[]} */ (
        Array.from(inputContainer.querySelectorAll(`input[type="radio"]`))
      );

      /** @param {string} value */
      const selectExistingOption = (value) => {
        if (!resolvedOptions.length) {
          return;
        }

        const selectedOption = optionNodesArr.find(
          (optionInputNode) => optionInputNode.value === value
        );

        if (selectedOption) {
          selectedOption.checked = true;
        } else {
          optionNodesArr.forEach((optionInputNode) => {
            optionInputNode.checked = false;
          });
        }
      };

      /** @param {string} value */
      const syncFromValue = (value) => {
        updatePreview({
          input,
          value,
          previewNode,
          previewContainer,
          proxy
        });
        refreshCustomizationFld();
        selectExistingOption(value);
      };

      inputNode.value = contents;
      selectExistingOption(contents);

      if (input.type === "img") {
        updatePreview({
          input,
          value: contents,
          previewNode,
          previewContainer,
          proxy
        });
      }

      inputNode.addEventListener(
        "change",
        (e) => {
          if (e.currentTarget instanceof HTMLInputElement) {
            syncFromValue(e.currentTarget.value);
          }
        },
        true
      );

      if (resolvedOptions.length) {
        optionNodesArr.forEach((optionInputNode) => {
          optionInputNode.addEventListener(
            "change",
            (e) => {
              if (e.currentTarget instanceof HTMLInputElement) {
                inputNode.value = e.currentTarget.value;
                syncFromValue(e.currentTarget.value);
              }
            },
            true
          );
        });
      }
    });
  });

  customFldsContainer.removeAttribute("hidden");
};

export default generateCustomFields;
