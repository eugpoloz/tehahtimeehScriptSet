"use strict";

import addProfileLinkToPosts from "./features/add-profile-link-to-posts";
import countPostsInTopic from "./features/count-posts-in-topic";

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
