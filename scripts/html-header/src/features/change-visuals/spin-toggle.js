/**
 * Returns the animated light/dark theme toggle markup.
 *
 * @param {string} controlId
 * @returns {string}
 */
export const spinToggleMarkup = (controlId) => `
  <button class="theme__button theme__spin" type="button" id="${controlId}" aria-label="Переключить тему" aria-pressed="false">
    <svg class="theme__spin-icon" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <clipPath id="theme-spin-clip">
          <path class="theme__spin-clip" d="M0 0h25a1 1 0 0010 10v14H0Z"></path>
        </clipPath>
      </defs>
      <g stroke="currentColor" stroke-linecap="round">
        <circle class="theme__spin-disc" cx="12" cy="12" r="5" fill="currentColor" clip-path="url(#theme-spin-clip)"></circle>
        <g fill="none" stroke-width="2" stroke-linejoin="round">
          <path class="theme__spin-ray" d="M12 1.4v2.4"></path>
          <path class="theme__spin-ray" d="m20.3 3.7-2.5 2.5"></path>
          <path class="theme__spin-ray" d="M22.6 12h-2.4"></path>
          <path class="theme__spin-ray" d="m20.3 20.3-2.5-2.5"></path>
          <path class="theme__spin-ray" d="M12 22.6v-2.4"></path>
          <path class="theme__spin-ray" d="m3.7 20.3 2.5-2.5"></path>
          <path class="theme__spin-ray" d="M1.4 12h2.4"></path>
          <path class="theme__spin-ray" d="m3.7 3.7 2.5 2.5"></path>
        </g>
      </g>
    </svg>
  </button>`;
