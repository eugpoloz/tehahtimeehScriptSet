/**
 * Disables unused Rusff platform features.
 *
 * This must run after the forum initializes `RusffCore` and before dependent
 * platform features are initialized.
 *
 * @returns {void}
 */
function configureCoreSettings() {
  RusffCore.sets.show_reportBtn = 0;
  RusffCore.sets.rusff_smilepack = 0;
  RusffCore.sets.use_awards = 0;
  RusffCore.sets.files.button = false;
  RusffCore.sets.share = false;
  RusffCore.sets.tags = false;
  RusffCore.sets.graffiti = false;
}

export default configureCoreSettings;
