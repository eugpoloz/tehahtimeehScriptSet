"use strict";

import addProfileLinkToPosts from "./features/addProfileLinkToPosts";
import countPostsInTopic from "./features/countPostsInTopic";

// run by default
addProfileLinkToPosts();

export default countPostsInTopic;

// config example
//
// teh.countPostsInTopic({
//   fldId: "5",
//   forumsToTrack: [7, 8, 16, 18],
//   countTopicStarter: false
// });
