import { STARTER_COUPONS, getTwinGift } from "./acceptance-templates";

/** Compare coupon labels without changing their original HTML. @param {string} markup */
const couponLabel = (markup) =>
  new DOMParser()
    .parseFromString(markup, "text/html")
    .body.textContent.trim()
    .replace(/\s+/g, " ");

/** Patch only coupon text and append the twin's gift block; keep all other source bytes. @param {string} source @param {string} name */
export const addTwinCollection = (source, name) => {
  const doc = new DOMParser().parseFromString(source, "text/html");
  const gifts = [
    ...doc.querySelectorAll('[data-collection="gift"][data-profile]')
  ];
  if (gifts.some((gift) => gift.getAttribute("data-profile") === name)) {
    throw new Error(
      "Раздел подарков этого твина уже существует. Проверьте купоны вручную."
    );
  }

  const blocks = [
    ...source.matchAll(
      /<div\b[^>]*\bdata-collection\s*=\s*["']coupon["'][^>]*>([\s\S]*?)<\/div>/gi
    )
  ];
  if (blocks.length !== 1) {
    throw new Error("На личной странице должен быть один раздел купонов.");
  }

  const block = blocks[0];
  const body = block[1];
  const lines = body.split(/(?<=\n)/);
  for (const coupon of STARTER_COUPONS) {
    let found = false;
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const match =
        /^(\s*)(.*?)(?:\s*\|\s*([1-9]\d*))?(\s*\|\s*reusable)?([ \t]*)(\r?\n)?$/i.exec(
          line
        );
      if (!match || couponLabel(match[2]) !== couponLabel(coupon)) {
        continue;
      }

      if (found) {
        throw new Error("Один из стартовых купонов записан несколько раз.");
      }

      found = true;
      const quantity = Number(match[3] || 1) + 1;
      lines[index] =
        `${match[1]}${match[2]} | ${quantity}${match[4] || ""}${match[5]}${match[6] || ""}`;
    }
    if (!found) {
      // Insert before the closing comment, keeping every existing line intact.
      const comment = lines.findIndex((line) =>
        /<!--\s*\/\s*СТОП КУПОНЫ/.test(line)
      );
      const insertion = comment < 0 ? lines.length : comment;
      if (insertion > 0 && !lines[insertion - 1].endsWith("\n")) {
        lines[insertion - 1] += "\n";
      }
      lines.splice(insertion, 0, `${coupon}\n`);
    }
  }

  const bodyStart =
    /** @type {number} */ (block.index) + block[0].indexOf(">") + 1;
  const updated =
    source.slice(0, bodyStart) +
    lines.join("") +
    source.slice(bodyStart + body.length);
  return `${updated}\n\n${getTwinGift(name, gifts.length + 1)}`;
};
