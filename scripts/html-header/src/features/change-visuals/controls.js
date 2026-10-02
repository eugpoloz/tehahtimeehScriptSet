import { fontSizeControlsMarkup } from "./font-size";
import { newMsgLinkControlMarkup } from "./add-new-msg-link";
import { themeControlsMarkup } from "./theme";

const VISUAL_CONTROLS_HTML = `
  <li class="flex items-center shrink-0 grow-0 ms-auto" id="visual-controls">
    <button class="button-icon theme__toggle flex flex-col flex-nowrap items-center justify-center" type="button" popovertarget="theme-settings-popover" aria-haspopup="dialog">
      <span class="sr-only" id="theme-settings-title">Настройки отображения</span>
      <svg class="icon-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6.044 6.05 2.122 2.122M10.994 11l9.192 9.192M15.944 6.05l-2.122 2.122m-5.656 5.656L6.044 15.95M17.994 11h-3m-8 0h-3m7 7v-3m0-8V4" />
      </svg>
    </button>
    <div class="theme__menu popover-custom" id="theme-settings-popover" popover="auto" role="dialog" aria-labelledby="theme-settings-title">
      ${fontSizeControlsMarkup()}
      ${themeControlsMarkup()}
      ${newMsgLinkControlMarkup()}
    </div>
  </li>`;

/**
 * Adds the visual controls to the forum navigation.
 *
 * @returns {boolean} Whether the controls are available.
 */
export const insertVisualControls = () => {
  if (document.getElementById("visual-controls")) {
    return true;
  }

  const navLinks = document.querySelector("#pun-navlinks ul");
  if (!navLinks) {
    return false;
  }

  navLinks.insertAdjacentHTML("beforeend", VISUAL_CONTROLS_HTML);

  return true;
};
