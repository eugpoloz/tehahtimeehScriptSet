import { escapeHtml } from "./escape-html";

/**
 * @typedef {object} ProfilePickerOptions
 * @property {string} id Unique prefix for the label and popover IDs.
 * @property {string} label Accessible picker label.
 * @property {string} [key] Consumer key exposed through data-profile-picker.
 * @property {string} [value] Initial button text.
 * @property {string} [status] Initial menu status.
 * @property {boolean} [disabled]
 * @property {boolean} [hideLabel]
 */

/** Render a profile picker; the caller supplies choices and handles selection.
 * @param {ProfilePickerOptions} options
 * @returns {string}
 */
export const getProfilePickerMarkup = ({
  id,
  label,
  key = id,
  value = "Выберите профиль",
  status = "",
  disabled = false,
  hideLabel = false
}) => {
  const prefix = escapeHtml(id);
  return /* HTML */ `<fieldset
    class="picker"
    data-profile-picker="${escapeHtml(key)}"
    ${disabled ? "disabled" : ""}
  >
    <legend
      class="picker__label${hideLabel ? " sr-only" : ""}"
      id="${prefix}-label"
    >
      ${escapeHtml(label)}
    </legend>
    <button
      class="button picker__trigger flex items-center justify-between gap-xs w-full"
      data-profile-picker-trigger
      type="button"
      popovertarget="${prefix}-popover"
      aria-haspopup="dialog"
      aria-labelledby="${prefix}-label ${prefix}-value"
    >
      <span class="picker__value" id="${prefix}-value" data-profile-picker-value
        >${escapeHtml(value)}</span
      >
      <i class="material-symbols-sharp icon-16 shrink-0" aria-hidden="true"
        >keyboard_arrow_down</i
      >
    </button>
    <div
      class="picker__menu popover-custom popover-panel popover-panel--rounded"
      id="${prefix}-popover"
      popover="auto"
      role="dialog"
      aria-labelledby="${prefix}-label"
    >
      <div class="picker__body relative w-full">
        <div class="picker__scroll scrollable w-full">
          <p
            class="picker__status"
            data-profile-picker-status
            ${status ? "" : "hidden"}
          >
            ${escapeHtml(status)}
          </p>
          <div
            class="picker__options flex flex-col"
            data-profile-picker-options
          ></div>
        </div>
      </div>
    </div>
  </fieldset>`;
};

/** Render radio choices for a profile picker.
 * @param {string[]} profiles
 * @param {string} name Unique radio group name.
 * @param {string} [selected]
 * @returns {string}
 */
export const getProfilePickerOptionsMarkup = (profiles, name, selected = "") =>
  profiles
    .map(
      (profile) =>
        /* HTML */ `<label
          class="picker__option flex items-center justify-between gap-sm"
        >
          <input
            class="picker__radio sr-only"
            data-profile-picker-option
            type="radio"
            name="${escapeHtml(name)}"
            value="${escapeHtml(profile)}"
            ${profile === selected ? " checked" : ""}
          />
          <span>${escapeHtml(profile)}</span>
          <i class="material-symbols-sharp picker__check" aria-hidden="true"
            >check</i
          >
        </label>`
    )
    .join("");
