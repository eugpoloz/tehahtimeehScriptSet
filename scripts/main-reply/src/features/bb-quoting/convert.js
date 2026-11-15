import { forumRules } from "./rules";

/**
 * Encode a parameter using entities accepted by the forum renderer.
 * @param {string | null | undefined} value
 */
export function bbParameter(value) {
  const text = value?.trim();
  if (!text || /[\r\n]/.test(text)) {
    return "";
  }

  const escaped = text
    .replace(/&(?=#(?:[xX][0-9a-fA-F]+|\d+);)/g, "&#38;")
    .replace(/"/g, "&#34;");
  return `="${escaped}"`;
}

/**
 * Convert a post, or its intersection with a selection, to BBCode.
 * Unsupported elements retain their readable children.
 * @param {HTMLElement} post
 * @param {Range | null} selection
 * @param {import("./rules").BbQuoteRule[]} [customRules]
 * @returns {string}
 */
export function convertPost(post, selection, customRules = []) {
  /** @param {Node} node */
  function selected(node) {
    return !selection || selection.intersectsNode(node);
  }

  /** @param {Node} node */
  function children(node) {
    return Array.from(node.childNodes, convert).join("");
  }

  /** @param {Node} node @returns {string} */
  function convert(node) {
    if (!selected(node)) {
      return "";
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (!selection) {
        return text;
      }

      const start =
        node === selection.startContainer ? selection.startOffset : 0;
      const end =
        node === selection.endContainer ? selection.endOffset : text.length;
      return text.slice(start, end);
    }

    if (!(node instanceof HTMLElement)) {
      return "";
    }

    if (
      node.matches(
        "script, style, button, input, select, textarea, .tooltip, p.lastedit, dl.post-sig"
      )
    ) {
      return "";
    }

    if (!selection && node.matches(".quote-box.answer-box")) {
      return "";
    }

    const tag = node.tagName.toLowerCase();
    const rule = [...customRules, ...forumRules].find((entry) =>
      node.matches(entry.selector)
    );
    if (rule && /^[a-z][a-z0-9_-]*$/i.test(rule.tag)) {
      let value;
      if (typeof rule.parameter === "function") {
        value = rule.parameter(node);
      } else if (rule.parameter) {
        value = node.getAttribute(rule.parameter);
      }

      const open = `[${rule.tag}${bbParameter(value)}]`;
      if (rule.selfClosing) {
        return open;
      }

      let content = rule.serialize?.(node, children);
      if (content == null) {
        const contentRoot = rule.contentSelector
          ? node.querySelector(rule.contentSelector)
          : node;
        if (!contentRoot) {
          return children(node);
        }

        content = children(contentRoot);
      }

      return content.trim() ? `${open}${content}[/${rule.tag}]` : content;
    }

    if (tag === "br") {
      return "\n";
    }

    if (tag === "hr") {
      return "[hr]";
    }

    if (node instanceof HTMLImageElement) {
      if (node.matches(':not(.postimg)[src*="/img/smilies/"][alt]')) {
        return node.alt;
      }

      const src = node.getAttribute("src");
      return src ? `[img]${src}[/img]` : node.alt;
    }

    if (node instanceof HTMLIFrameElement) {
      const source = node.getAttribute("src");
      return source ? `[video]${source}[/video]` : "";
    }

    if (node.matches(".quote-box.spoiler-box, .quote-box.hide-box")) {
      const body = Array.from(node.children).find(
        (child) => child.tagName === "BLOCKQUOTE"
      );
      if (!body) {
        return children(node);
      }

      let content = children(body).trim();
      const stored = Array.from(node.children).find(
        (child) =>
          child.tagName === "SCRIPT" &&
          child.getAttribute("type") === "text/html"
      );
      if (!content && stored && !selection) {
        const template = document.createElement("template");
        template.innerHTML = stored.textContent || "";
        content = Array.from(template.content.childNodes, convert)
          .join("")
          .trim();
      }

      if (!content) {
        return "";
      }

      if (node.classList.contains("hide-box")) {
        const cite = Array.from(node.children).find(
          (child) => child.tagName === "CITE"
        );
        const count = cite?.textContent?.match(/\b(\d+)\b/)?.[1];
        return `[hide${count ? `=${count}` : ""}]${content}[/hide]`;
      }

      const title = Array.from(node.children).find(
        (child) => child.tagName === "DIV"
      );
      const name = node.classList.contains("media-box") ? "media" : "spoiler";
      return `[${name}${bbParameter(title?.textContent)}]${content}[/${name}]`;
    }

    if (node.matches(".code-box")) {
      const pre = node.querySelector(".blockcode .scrollbox pre");
      const text = pre ? children(pre) : "";
      return text ? `[code]${text}[/code]` : "";
    }

    if (
      node.matches(
        ".quote-box:not(.spoiler-box):not(.hide-box):not(.media-box)"
      )
    ) {
      const body = Array.from(node.children).find(
        (child) => child.tagName === "BLOCKQUOTE"
      );
      if (body) {
        const content = children(body).trim();
        if (!content) {
          return "";
        }

        const cite = Array.from(node.children).find(
          (child) => child.tagName === "CITE"
        );
        const author = cite?.textContent?.replace(/\s+написал\(а\):\s*$/, "");
        return `[quote${bbParameter(author)}]${content}[/quote]`;
      }
    }

    const content = children(node);
    if (tag === "table" || tag === "tr" || tag === "td" || tag === "th") {
      const styles = [
        ["width", node.style.width],
        ["height", node.style.height],
        ["bgcolor", node.style.backgroundColor],
        ["align", node.style.textAlign]
      ];
      const attributes = styles
        .filter(([, value]) => value && /^[#%(),.\w -]+$/.test(value))
        .map(([name, value]) => ` ${name}=${value.replace(/\s+/g, "")}`)
        .join("");
      return `[${tag}${attributes}]${content.trim()}[/${tag}]`;
    }

    if (tag === "div" && /^block-\d+(?:-\d+)?$/.test(node.id)) {
      return content.trim()
        ? `[block${bbParameter(node.getAttribute("class"))}]${content.trim()}[/block]`
        : content;
    }

    if (!content.trim()) {
      return content;
    }

    if (tag === "abbr") {
      const tooltip = node.querySelector(":scope > .tooltip");
      return `[abbr${bbParameter(node.getAttribute("title") || tooltip?.textContent)}]${content}[/abbr]`;
    }

    if (tag === "a" && !node.classList.contains("post-mention")) {
      const href = node.getAttribute("href");
      if (href) {
        return `[url${bbParameter(href)}]${content}[/url]`;
      }
    }

    if (tag === "ul" || tag === "ol") {
      const listType = node.style.listStyleType;
      const suffix =
        listType && listType !== "disc" && /^[a-z][a-z0-9-]*$/i.test(listType)
          ? `=${listType}`
          : "";
      return `[ul${suffix}]${content.trim()}[/ul]\n`;
    }

    if (tag === "li") {
      return `[*]${content.trim()}\n`;
    }

    /** @type {Record<string, string>} */
    const tags = {
      strong: "b",
      b: "b",
      i: "i",
      u: "u",
      s: "s",
      del: "s",
      strike: "s",
      sup: "sup",
      sub: "sub"
    };
    let bbTag = tags[tag];
    if (tag === "em") {
      bbTag = node.classList.contains("bbuline") ? "u" : "i";
    }

    if (node.classList.contains("highlight-text")) {
      bbTag = "mark";
    }

    let result = bbTag ? `[${bbTag}]${content}[/${bbTag}]` : content;
    if (node.style.fontStyle === "italic" && bbTag !== "i") {
      result = `[i]${result}[/i]`;
    }

    for (const [name, value] of [
      ["color", node.style.color],
      ["font", node.style.fontFamily],
      ["size", node.style.fontSize.replace(/px$/, "")],
      ["align", node.style.textAlign]
    ]) {
      if (value) {
        const attribute = bbParameter(value);
        if (attribute) {
          result = `[${name}${attribute}]${result}[/${name}]`;
        }
      }
    }

    if (tag === "p") {
      return `\n${result}\n`;
    }

    return result;
  }

  return children(post).trim();
}
