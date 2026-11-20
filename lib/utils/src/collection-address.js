/** Remove accents and derive a forum page address from the name. @param {string} name */
export const suggestCollectionAddress = (name) =>
  name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\p{Mark}/gu, "")
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
