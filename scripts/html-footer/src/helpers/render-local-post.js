import DOMPurify from "dompurify";
import { evaluatePostScripts } from "./evaluate-post-scripts";

/**
 * Builds sanitized post output while its source, scripts and CSS are inert.
 * @param {string} html
 * @param {string} workerUrl
 * @returns {Promise<DocumentFragment | HTMLElement>}
 */
export const renderLocalPost = async (html, workerUrl) => {
  if (!DOMPurify.isSupported) {
    throw new Error();
  }

  const source = document.createElement("template");
  source.innerHTML = html;
  const dataBlocks = [
    ...source.content.querySelectorAll('script[type="application/json"]')
  ];
  const json = dataBlocks.map((block) => block.textContent);
  dataBlocks.forEach((block) => block.remove());
  const scripts = [...source.content.querySelectorAll("script")].filter(
    (script) => {
      const type = script.type.trim().toLowerCase();
      if (type === "module") {
        throw new Error("The scoped worker has no module loader");
      }

      return (
        !type || /^(?:text|application)\/(?:x-)?(?:java|ecma)script$/.test(type)
      );
    }
  );
  if (scripts.some((script) => script.hasAttribute("src"))) {
    throw new Error("The scoped worker has no external script loader");
  }

  if (scripts.length) {
    const results = await evaluatePostScripts(
      scripts.map((script) => script.textContent),
      json,
      workerUrl
    );
    scripts.forEach((script, index) => {
      const output = document.createElement("template");
      output.innerHTML = results[index];
      script.replaceWith(output.content);
    });
  }

  const styles = [...source.content.querySelectorAll("style")];
  styles.forEach((style) => style.remove());
  const content = DOMPurify.sanitize(source.innerHTML, {
    RETURN_DOM_FRAGMENT: true,
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target"],
    // Styles are installed separately under @scope. Controls may appear in a
    // post, but must not submit a form or target controls elsewhere on the page.
    FORBID_TAGS: ["style", "form"],
    FORBID_ATTR: [
      "form",
      "formaction",
      "formtarget",
      "autofocus",
      "popovertarget",
      "commandfor"
    ]
  });
  for (const link of content.querySelectorAll("a[target], area[target]")) {
    link.setAttribute("rel", (link.getAttribute("rel") ?? "") + " noopener");
  }

  if (!styles.length || typeof CSSScopeRule === "undefined") {
    for (const element of content.children) {
      element.setAttribute("data-teh-local-post", "");
    }
    return content;
  }

  // Sibling elements in a styled block need one common parent for native @scope.
  const root = document.createElement("div");
  root.setAttribute("data-teh-local-post", "");
  for (const authorStyle of styles) {
    // Parse each rule before nesting it so malformed source cannot close @scope.
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(authorStyle.textContent);
    const scoped = new CSSStyleSheet();
    // Namespace declarations describe selectors throughout this stylesheet.
    // CSS requires them to appear before the rules that use them.
    for (const rule of sheet.cssRules) {
      if (rule.type === CSSRule.NAMESPACE_RULE) {
        scoped.insertRule(rule.cssText, scoped.cssRules.length);
      }
    }
    const index = scoped.insertRule("@scope {}", scoped.cssRules.length);
    const scope = /** @type {CSSGroupingRule} */ (scoped.cssRules[index]);
    for (const rule of sheet.cssRules) {
      if (rule.type === CSSRule.NAMESPACE_RULE) {
        continue;
      }

      try {
        scope.insertRule(rule.cssText, scope.cssRules.length);
      } catch (error) {
        if (!(error instanceof DOMException)) {
          throw error;
        }
        // The browser rejected this rule inside @scope. Keep the other rules.
      }
    }
    const style = document.createElement("style");
    style.media = authorStyle.media;
    style.textContent = Array.from(
      scoped.cssRules,
      (rule) => rule.cssText
    ).join("\n");
    root.append(style);
  }
  root.append(content);
  return root;
};
