/** @typedef {import("../types.js").BlogTopic} BlogTopic */

const BLOG_FORUM_ID = "13";
// The working RusFF GET form submits "Отправить" encoded as Windows-1251.
const SEARCH_SUBMIT_VALUE = "%CE%F2%EF%F0%E0%E2%E8%F2%FC";

/** @param {string} handle @returns {string} */
const getSearchUrl = (handle) => {
  const params = new URLSearchParams({
    action: "search",
    keywords: "",
    author: handle,
    forum: BLOG_FORUM_ID,
    search_in: "-1",
    sort_by: "0",
    sort_dir: "DESC",
    show_as: "topics"
  });

  return `/search.php?${params}&search=${SEARCH_SUBMIT_VALUE}`;
};

/** @param {string | null} text @returns {string} */
const normalizeText = (text) => text?.trim().replace(/\s+/g, " ") ?? "";

/**
 * @param {Element} row
 * @param {string} normalizedHandle
 * @returns {BlogTopic | undefined}
 */
const parseTopicRow = (row, normalizedHandle) => {
  const starter = normalizeText(
    row.querySelector(".byuser-username")?.textContent ?? null
  );
  if (starter !== normalizedHandle) {
    return;
  }

  const anchor = row.querySelector(".tclcon a");
  const href = anchor?.getAttribute("href");
  const title = normalizeText(anchor?.textContent ?? null);
  if (!href || !title) {
    return;
  }

  const url = new URL(href, window.location.origin);

  return {
    title,
    url: `${url.pathname}${url.search}${url.hash}`
  };
};

/** @param {Element} container @param {string} handle @returns {BlogTopic[]} */
const parseTopicRows = (container, handle) => {
  const topics = new Map();
  for (const row of container.querySelectorAll("tbody tr")) {
    const topic = parseTopicRow(row, handle);
    if (topic && !topics.has(topic.url)) {
      topics.set(topic.url, topic);
    }
  }

  return [...topics.values()];
};

/** @param {Element} container @returns {string[]} */
const getPaginationUrls = (container) => {
  /** @type {string[]} */
  const urls = [];
  for (const anchor of container.querySelectorAll(".pagelink a[href]")) {
    const href = anchor.getAttribute("href");
    if (!href) {
      continue;
    }

    const url = new URL(href, window.location.origin);
    if (url.pathname !== "/search.php") {
      continue;
    }

    url.hash = "";
    urls.push(`${url.pathname}${url.search}`);
  }

  return urls;
};

/** @param {string} handle @returns {Promise<BlogTopic[]>} */
const getBlogTopics = async (handle) => {
  const topics = new Map();
  const normalizedHandle = normalizeText(handle);

  try {
    const pending = [getSearchUrl(handle)];
    const visited = new Set();

    while (pending.length > 0) {
      const url = pending.shift();
      if (!url || visited.has(url)) {
        continue;
      }

      visited.add(url);
      const response = await fetch(url, {
        credentials: "include",
        priority: "low"
      });
      if (!response.ok) {
        return [...topics.values()];
      }

      const html = new TextDecoder("windows-1251").decode(
        await response.arrayBuffer()
      );
      const page = new DOMParser().parseFromString(html, "text/html");
      const container = page.querySelector("#pun-searchtopics");
      if (!container) {
        return [...topics.values()];
      }

      for (const topic of parseTopicRows(container, normalizedHandle)) {
        topics.set(topic.url, topic);
      }
      pending.push(...getPaginationUrls(container));
    }

    return [...topics.values()];
  } catch {
    return [...topics.values()];
  }
};

export default getBlogTopics;
