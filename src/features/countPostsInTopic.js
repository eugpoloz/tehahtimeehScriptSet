/**
 Sparse map: Unicode code unit → Windows-1251 byte (0–255).
 Filled from a fixed ordered list, then Cyrillic А–я (1040–1103) is overwritten.
 */
const UNICODE_CODE_UNIT_TO_WIN1251 = (() => {
  const table = [];

  const orderedCodePoints = [
    1026,
    1027,
    8218,
    1107,
    8222,
    8230,
    8224,
    8225,
    8364,
    8240,
    1033,
    8249,
    1034,
    1036,
    1035,
    1039,
    1106,
    8216,
    8217,
    8220,
    8221,
    8226,
    8211,
    8212,
    "0",
    8482,
    1113,
    8250,
    1114,
    1116,
    1115,
    1119,
    160,
    1038,
    1118,
    1032,
    164,
    1168,
    166,
    167,
    1025,
    169,
    1028,
    171,
    172,
    173,
    174,
    1031,
    176,
    177,
    1030,
    1110,
    1169,
    181,
    182,
    183,
    1105,
    8470,
    1108,
    187,
    1112,
    1029,
    1109,
    1111,
    1040,
    1041,
    1042,
    1043,
    1044,
    1045,
    1046,
    1047,
    1048,
    1049,
    1050,
    1051,
    1052,
    1053,
    1054,
    1055,
    1056,
    1057,
    1058,
    1059,
    1060,
    1061,
    1062,
    1063,
    1064,
    1065,
    1066,
    1067,
    1068,
    1069,
    1070,
    1071,
    1072,
    1073,
    1074,
    1075,
    1076,
    1077,
    1078,
    1079,
    1080,
    1081,
    1082,
    1083,
    1084,
    1085,
    1086,
    1087,
    1088,
    1089,
    1090,
    1091,
    1092,
    1093,
    1094,
    1095,
    1096,
    1097,
    1098,
    1099,
    1100,
    1101,
    1102,
    1103
  ];

  for (let i = 0; i < orderedCodePoints.length; i += 1) {
    table[orderedCodePoints[i]] = i + 128;
  }

  for (let cp = 1040; cp <= 1103; cp += 1) {
    table[cp] = cp - 848;
  }

  return table;
})();

/**
 Encodes a string as a URI-safe form where non–Win1251 text is approximated via `escape` + optional numeric entities, then bytes are produced using the table above.
 */
const encodeURIToWin1251 = (str) => {
  const chars = str.split("");

  for (let i = 0; i < chars.length; i += 1) {
    const escapedChar = escape(chars[i]);
    if (escapedChar.search(/%u[0-9A-Z]+/i) === 0) {
      const codePoint = parseInt(escapedChar.slice(2), 16);
      if (codePoint > 1200) {
        chars[i] = `&#${codePoint};`;
      }
    }
  }

  const expanded = chars.join("");
  const bytes = [];

  for (let i = 0; i < expanded.length; i += 1) {
    let b = expanded.charCodeAt(i);
    if (UNICODE_CODE_UNIT_TO_WIN1251[b] !== undefined) {
      b = UNICODE_CODE_UNIT_TO_WIN1251[b];
    }
    if (b <= 255) {
      bytes.push(b);
    }
  }
  return escape(String.fromCharCode(...bytes))
    .replace(/\+/g, "%2B")
    .replace(/%20/g, "+")
    .replace(/\//g, "%2F");
};

const countPostsInTopic = async ({
  forumsToTrack = [],
  fldId = "5",
  countTopicStarter = false,
} = {}) => {
  // пока что феноменально тупая версия счетчика: чисто добавляет те посты, что есть
  // TODO:
  // - обновлять счетчик автоматически при _удалении_ постов
  const COUNTER_NEW_POST_KEY = "countNewPost";

  try {
    let forumId;
    const newPost = document.getElementById("pun-post");

    // for topic thread
    if (typeof FORUM.topic === "object") {
      const topic = FORUM.topic;
      forumId = +FORUM.topic.forum_id; // string needs to be converted to number
    } else if (newPost) {
      forumId = +newPost.dataset.forumId;
    }

    if (!forumsToTrack.includes(forumId)) {
      return;
    }

    // handle posting to topic as game posts
    console.log("countPostsInTopic() >>> tracking this topic");

    // handle form submission from topic page only
    // because editing takes place somewhere else for now, thankfully
    const postForm = document.querySelector("#pun-main.multipage #post");
    if (postForm) {
      postForm.addEventListener("submit", function (event) {
        localStorage.setItem(
          COUNTER_NEW_POST_KEY,
          Math.floor(Date.now() / 1000)
        ); // in seconds
        console.log("countPostsInTopic() >>> postForm submitted", {
          event,
          localStorage: localStorage.getItem(COUNTER_NEW_POST_KEY)
        });
      });
    }

    // handle previously set localStorage flag
    const counterNewPost = localStorage.getItem(COUNTER_NEW_POST_KEY);
    if (!counterNewPost) {
      console.log("countPostsInTopic() >>> no counterNewPost, exiting");
      return;
    }

    const latestPost = document.querySelector(
      countTopicStarter
        ? ".post.endpost"
        : ".post.endpost:not(.topicpost)"
    );

    if (latestPost) {
      const initialCounter = window[`UserFld${fldId}`]
        ? +window[`UserFld${fldId}`]
        : 0;
      const updatedCounter = initialCounter + 1;

      const url = `/profile.php?section=fields&id=${window.UserID}`;

      const profileResponse = await fetch(`${url}&nohead`, {
        method: "GET",
        credentials: "include"
      });
      const profileHTML = await profileResponse.arrayBuffer().then((buffer) => {
        const decoder = new TextDecoder("windows-1251"); // Or 'koi8-r'
        const text = decoder.decode(buffer);
        return text;
      });

      const parser = new DOMParser();

      const profile8 = parser.parseFromString(profileHTML, "text/html");
      const profileForm = profile8.getElementById("profile8");

      const changingFld = profileForm.querySelector(
        `[name="form[fld${fldId}]"]`
      );
      changingFld.value = updatedCounter;

      const formData = new FormData(profileForm);
      formData.append("update", "Отправить");

      const uriEncodedFormArray = [];

      for (const [key, value] of formData) {
        uriEncodedFormArray.push(
          `${encodeURIToWin1251(key)}=${encodeURIToWin1251(value)}`
        );
      }

      const uriEncodedData = uriEncodedFormArray.join("&");

      console.log(`countPostsInTopic() >>> fld${fldId}`, {
        initialCounter,
        updatedCounter
      });

      // save updated counter
      const updateProfileResponse = await fetch(profileForm.action, {
        method: "POST",
        referrer: window.location.origin + url,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: uriEncodedData
      });

      const updateProfileHTML = await updateProfileResponse
        .arrayBuffer()
        .then((buffer) => {
          const decoder = new TextDecoder("windows-1251"); // Or 'koi8-r'
          const text = decoder.decode(buffer);
          return text;
        });

      const updatedProfile8 = parser.parseFromString(
        updateProfileHTML,
        "text/html"
      );
      const error = updatedProfile8.getElementById("pun-message");

      if (!!error) {
        throw new Error("Failed to update profile");
      }

      window[`UserFld${fldId}`] = updatedCounter;

      const authorsPostsInTopic = document.querySelectorAll(`.post[data-user-id="${UserID}"] .post-author`);

      authorsPostsInTopic.forEach(author => {
        const counter = author.querySelector(`.pa-fld${fldId}`);
        const previousFld = author.querySelector(`.pa-posts`);
        
        if (counter) {
          counter.innerText = updatedCounter;
        } else {
          const html = `<li class="pa-fld${fldId}" title="Постов:"> ${updatedCounter}</li>`;
          
          previousFld.insertAdjacentHTML('afterend', html);
        }
      });

      localStorage.removeItem(COUNTER_NEW_POST_KEY);
    }
  } catch (error) {
    console.error("countPostsInTopic() >>> FAILED! Error:", error);
  }
};

export default countPostsInTopic;
