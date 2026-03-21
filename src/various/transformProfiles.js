import DOMPurify from 'dompurify';

const transformProfiles = () => {
  const replaceFldContentWithHTML = (parent, selector) => {
    const fldsToReplace = parent.querySelectorAll(selector);

    fldsToReplace.forEach((fld) => {
      if (fld.textContent.includes("<")) {
        const cleanContent = DOMPurify.sanitize(fld.textContent);

        fld.innerHTML = cleanContent;
        fld.dataset.ready = "1";
      }
    });
  };

  if (typeof FORUM.topic === "object") {
    const profiles = document.querySelectorAll(".post-author ul");

    profiles.forEach((profile) =>
      replaceFldContentWithHTML(profile, 'li[class^="pa-fld"]')
    );
  }

  if (!!document.getElementById("viewprofile-next")) {
    replaceFldContentWithHTML(
      document.getElementById("profile-right"),
      'li[id^="pa-fld"] strong'
    );
  }
};

export default transformProfiles;