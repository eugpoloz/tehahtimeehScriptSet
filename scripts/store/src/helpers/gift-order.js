import { escapeHtml, suggestCollectionAddress } from "@teh/utils";

/** @typedef {{url:string, recipient:string, message:string, signature:string}} Gift */
/** @typedef {Record<string,{id?:number,main?:string}>} Profiles */

/** @param {Profiles} profiles @param {string} recipient */
export const vaultAddress = (profiles, recipient) => {
  const character = profiles[recipient];
  const owner = character?.main || recipient;
  if (!character?.id || !profiles[owner]?.id || profiles[owner].main) {
    return "";
  }

  return suggestCollectionAddress(owner);
};

/** @param {string} text */
const orderText = (text) =>
  escapeHtml(text).replace(/\[/g, "&#91;").replace(/\]/g, "&#93;");

/** Write a single line for the vault's pipe-delimited gift reader. @param {Gift} gift */
const formatGiftRecord = ({ url, message, signature }) => {
  const field = (/** @type {string} */ text) =>
    orderText(text.replace(/%/g, "%25").replace(/\|/g, "%7C")).replace(
      /\r\n?|\n/g,
      "<br>"
    );

  const image = orderText(url.replace(/\|/g, "%7C"));
  return `${image}|${field(message)}|${field(signature)}`;
};

/** @param {Gift[]} gifts @param {Profiles} profiles @param {string} blockBreak */
export const giftOrder = (gifts, profiles, blockBreak) => {
  /** @type {Map<string, Map<string,string[]>>} */
  const owners = new Map();
  for (const gift of gifts) {
    const address = vaultAddress(profiles, gift.recipient);
    const recipients = owners.get(address) ?? new Map();
    owners.set(address, recipients);
    const records = recipients.get(gift.recipient) ?? [];
    recipients.set(gift.recipient, records);
    records.push(formatGiftRecord(gift));
  }
  const delivery = [];
  for (const [address, recipients] of owners) {
    for (const [recipient, records] of recipients) {
      delivery.push(
        `Вручить [url="${location.origin}/admin_pages.php?edit_page=${address}"]${orderText(recipient)}[/url]:${blockBreak}[code]${records.join("\n")}[/code]`
      );
    }
  }
  return `[hide=99999999999999999999]${blockBreak}${delivery.join(blockBreak)}${blockBreak}[/hide]`;
};
