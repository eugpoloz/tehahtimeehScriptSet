/** @typedef {import("../types.js").BlogTopic} BlogTopic */

/**
 * @typedef {object} ApiTopic
 * @property {string | number} id
 * @property {string} username
 * @property {string} subject
 */

const BLOG_FORUM_ID = "13";
const PAGE_SIZE = 500;
const MAX_SKIP = 10000;

/** @type {Promise<ApiTopic[]> | undefined} */
let blogTopicsRequest;

/** @param {string} text @returns {string} */
const normalizeText = (text) => text.trim().replace(/\s+/g, " ");

/** @returns {Promise<ApiTopic[]>} */
const loadBlogTopics = async () => {
  /** @type {Map<string, ApiTopic>} */
  const topics = new Map();
  const params = new URLSearchParams({
    method: "topic.get",
    forum_id: BLOG_FORUM_ID,
    fields: "id,username,subject",
    sort_by: "last_post",
    sort_dir: "desc",
    limit: String(PAGE_SIZE)
  });

  try {
    for (let skip = 0; skip <= MAX_SKIP; skip += PAGE_SIZE) {
      params.set("skip", String(skip));
      const response = await fetch(`/api.php?${params}`, {
        credentials: "include",
        priority: "low"
      });
      if (!response.ok) {
        blogTopicsRequest = undefined;
        break;
      }

      const { response: page } = /** @type {{ response?: ApiTopic[] }} */ (
        await response.json()
      );
      if (!Array.isArray(page)) {
        blogTopicsRequest = undefined;
        break;
      }

      for (const topic of page) {
        const id = String(topic.id);
        if (
          /^\d+$/.test(id) &&
          typeof topic.username === "string" &&
          typeof topic.subject === "string"
        ) {
          topics.set(id, topic);
        }
      }

      if (page.length < PAGE_SIZE) {
        break;
      }
    }
  } catch {
    blogTopicsRequest = undefined;
  }

  return [...topics.values()];
};

/** @param {string} handle @returns {Promise<BlogTopic[]>} */
const getBlogTopics = async (handle) => {
  const normalizedHandle = normalizeText(handle);
  blogTopicsRequest ??= loadBlogTopics();
  const topics = await blogTopicsRequest;

  /** @type {BlogTopic[]} */
  const blogs = [];
  for (const topic of topics) {
    if (normalizeText(topic.username) !== normalizedHandle) {
      continue;
    }

    const title = normalizeText(topic.subject);
    if (title) {
      blogs.push({ title, url: `/viewtopic.php?id=${topic.id}` });
    }
  }

  return blogs;
};

export default getBlogTopics;
