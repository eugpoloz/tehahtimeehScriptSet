"use strict";

import generateRandomPortraits from "./features/optional/generateRandomPortraits";
import generateCustomFields from "./features/optional/generateCustomFields";

// module exports
export { generateCustomFields, generateRandomPortraits };

// config example
//
//teh.generateRandomPortraits({
//  howMany: 4,
//  group_id: [1, 2, 5],
//  filteredUsers: ["Hedge Bitch"],
//  placeholder: "https://forumstatic.ru/files/001c/ab/7e/68132.png?v=1",
//  selector: ".hehe-portrait",
//});
