$(function() {
  const transformProfiles = () => {
    const replaceFldContentWithHTML = (parent, selector) => {
      const fldsToReplace = parent.querySelectorAll(selector);
      console.log('replaceFldContentWithHTML', fldsToReplace);

      fldsToReplace.forEach(fld => {
        if (fld.textContent.includes('<')) {
          fld.innerHTML = fld.textContent;
        }
      });
    }

    if (typeof FORUM.topic === "object") {
      const profiles = document.querySelectorAll('.post-author ul');

      profiles.forEach(profile => replaceFldContentWithHTML(profile, 'li[class^="pa-fld"]'));
    }
    
    if (!!document.getElementById('viewprofile-next')) {
      replaceFldContentWithHTML(document.getElementById('profile-right'), 'li[id^="pa-fld"] strong');
    }
  };

  transformProfiles();
});