import { getField, getForm, getSubmitter } from "../helpers/iframe";
import { snapshot, validateCollectionAddress } from "../helpers/character-data";
import { saveJournal } from "../helpers/acceptance-journal";
import { getStarterCollection } from "../helpers/acceptance-templates";
import { addTwinCollection } from "../helpers/collection-coupons";
/** @typedef {import('./save-character-config').AcceptanceContext} AcceptanceContext */
/** @typedef {import('../helpers/iframe').AcceptanceIframe} AcceptanceIframe */
/** @typedef {import('../helpers/acceptance-journal').CollectionJournal} CollectionJournal */
/**
 * @typedef {object} CollectionPage
 * @property {string} name
 * @property {string} title
 * @property {string} content
 * @property {string} tags
 * @property {string} announcement
 * @property {Record<string, boolean>} groups
 */
/** @typedef {{address: string, form: HTMLFormElement, current?: CollectionPage, expected: CollectionPage}} CollectionPreparation */

/** Browsers submit unsupported Windows-1251 characters as numeric references. @param {string} value */
const readPageTitle = (value) =>
  value.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

/** @param {HTMLFormElement} form @returns {CollectionPage} */
const readPage = (form) => ({
  name: getField(form, "name").value,
  title: readPageTitle(getField(form, "title").value),
  content: getField(form, "content").value,
  tags: getField(form, "tags").value,
  announcement: /** @type {HTMLInputElement} */ (
    form.querySelector('[name="announcement"]:checked')
  ).value,
  groups: Object.fromEntries(
    [...form.querySelectorAll('input[name^="group["]')].map((element) => {
      const input = /** @type {HTMLInputElement} */ (element);
      return [input.name, input.checked];
    })
  )
});

/** @param {AcceptanceIframe} iframe @param {string} address */
const loadPage = async (iframe, address) => {
  const doc = await iframe.load(
    `/admin_pages.php?edit_page=${encodeURIComponent(address)}`
  );
  const form = getForm(doc, "form#editpage");
  const page = readPage(form);
  if (page.name !== address) {
    throw new Error("Открыта другая личная страница. Сохранение остановлено.");
  }

  return { form, page };
};

/** @param {string} tags */
const hasVaultTag = (tags) => tags.split(/[\s,]+/).includes("vault");

/** @param {Document} doc @param {string} name */
const findCollectionRows = (doc, name) =>
  [...doc.querySelectorAll(".page-list tbody tr")].filter(
    (row) =>
      readPageTitle(row.querySelector(".tc2")?.textContent?.trim() || "") ===
        name &&
      hasVaultTag(row.querySelector(".tc-tags")?.textContent?.trim() || "")
  );

/** @param {Document} doc @param {string} address */
const hasPage = (doc, address) =>
  [...doc.querySelectorAll('.page-list a[href*="edit_page="]')].some(
    (link) =>
      new URL(/** @type {HTMLAnchorElement} */ (link).href).searchParams.get(
        "edit_page"
      ) === address
  );

/** Resolve an existing main page, including renamed addresses. @param {AcceptanceContext} context */
const resolveMainPage = async ({ input, iframe }) => {
  const mainName = String(input.character.main);
  const characters =
    /** @type {import('../helpers/character-data').CharactersConfig} */ (
      window.characters
    );
  const main = characters[mainName];
  const profileDoc = await iframe.load(
    `/profile.php?section=fields&id=${main.id}`
  );
  const profileForm = getForm(profileDoc, "form#profile8");
  const storedLink = new DOMParser().parseFromString(
    getField(profileForm, "form[fld5]").value,
    "text/html"
  );
  const href = storedLink
    .querySelector("[data-vault-href]")
    ?.getAttribute("data-vault-href");
  if (href) {
    const address = href.split("?")[0];
    validateCollectionAddress(address);
    return address;
  }

  const doc = await iframe.load("/admin_pages.php");
  getForm(doc, "form#addpage");
  const matches = findCollectionRows(doc, mainName);
  if (matches.length !== 1) {
    throw new Error(
      "Не найдена единственная личная страница основного профиля. Проверьте поле «Личная страница»."
    );
  }

  const address = matches[0].querySelector(".tcl")?.textContent?.trim() || "";
  validateCollectionAddress(address);
  return address;
};

/** @param {CollectionPage} page @param {string} mainName */
const checkMainPage = (page, mainName) => {
  if (page.title !== mainName || !hasVaultTag(page.tags)) {
    throw new Error(
      "Личная страница не соответствует основному персонажу или не имеет тега vault."
    );
  }
};

/** @param {AcceptanceContext} context @param {CollectionPage} page */
const verifyCompletedPage = ({ input, journal }, page) => {
  const expected = /** @type {NonNullable<typeof journal.collection>} */ (
    journal.collection
  ).expected;
  checkMainPage(page, expected.title);
  const doc = new DOMParser().parseFromString(page.content, "text/html");
  let gift;
  if (typeof input.character.main === "string") {
    gift = [...doc.querySelectorAll('[data-collection="gift"]')].find(
      (element) => element.getAttribute("data-profile") === input.name
    );
  } else {
    gift = doc.querySelector('[data-collection="gift"]:not([data-profile])');
  }
  if (!doc.querySelector("[data-character-vault-page]") || !gift) {
    throw new Error(
      "Ранее сохранённая коллекция изменена. Проверьте личную страницу."
    );
  }
};

/** Reopen a recorded page, allowing only a pending new page to be absent.
 * @param {AcceptanceIframe} iframe
 * @param {CollectionJournal} record
 * @returns {Promise<{form: HTMLFormElement, current?: CollectionPage}>}
 */
const loadRecordedCollection = async (iframe, record) => {
  const doc = await iframe.load("/admin_pages.php");
  const form = getForm(doc, "form#addpage");
  if (hasPage(doc, record.address)) {
    const loaded = await loadPage(iframe, record.address);
    return { form: loaded.form, current: loaded.page };
  }

  if (record.before || record.state === "complete") {
    throw new Error(
      "Ранее сохранённая личная страница удалена или переименована. Проверьте её вручную."
    );
  }

  return { form };
};

/** @param {AcceptanceContext} context @returns {Promise<CollectionPreparation>} */
const prepareMainCollection = async ({ input, iframe }) => {
  const address = /** @type {string} */ (input.collectionAddress);
  validateCollectionAddress(address);
  const doc = await iframe.load("/admin_pages.php");
  const form = getForm(doc, "form#addpage");
  const existing = findCollectionRows(doc, input.name)[0];
  if (
    existing &&
    existing.querySelector(".tcl")?.textContent?.trim() !== address
  ) {
    throw new Error(
      "У персонажа уже есть личная страница с другим адресом. Проверьте её вручную."
    );
  }

  if (hasPage(doc, address)) {
    const loaded = await loadPage(iframe, address);
    const current = loaded.page;
    checkMainPage(current, input.name);
    if (
      current.content.trim() !== getStarterCollection().trim() ||
      current.announcement !== "0"
    ) {
      throw new Error(
        "Адрес личной страницы занят. Существующее содержимое не будет заменено."
      );
    }

    return { address, form: loaded.form, current, expected: current };
  }

  return {
    address,
    form,
    expected: {
      ...readPage(form),
      name: address,
      title: input.name,
      content: getStarterCollection(),
      tags: "vault",
      announcement: "0"
    }
  };
};

/** @param {AcceptanceContext} context @returns {Promise<CollectionPreparation>} */
const prepareTwinCollection = async (context) => {
  const address = await resolveMainPage(context);
  const { form, page: current } = await loadPage(context.iframe, address);
  checkMainPage(current, String(context.input.character.main));
  return {
    address,
    form,
    current,
    expected: {
      ...current,
      content: addTwinCollection(current.content, context.input.name)
    }
  };
};

/** Create a main collection or patch the twin's main collection; reconcile uncertain writes before retry. @param {AcceptanceContext} context */
export const updateCharacterCollection = async (context) => {
  const { input, journal, iframe } = context;
  const record = journal.collection;
  /** @type {CollectionPreparation} */
  let prepared;
  if (record) {
    const loaded = await loadRecordedCollection(iframe, record);
    if (record.state === "complete") {
      verifyCompletedPage(
        context,
        /** @type {CollectionPage} */ (loaded.current)
      );
      return;
    }

    prepared = {
      ...loaded,
      address: record.address,
      expected: record.expected
    };
  } else if (typeof input.character.main === "string") {
    prepared = await prepareTwinCollection(context);
  } else {
    prepared = await prepareMainCollection(context);
  }

  const { address, form, current, expected } = prepared;
  if (current && snapshot(current) === snapshot(expected)) {
    journal.collection = {
      address,
      state: "complete",
      expected: { title: expected.title }
    };
    saveJournal(journal);
    return;
  }
  if (record && snapshot(current) !== snapshot(record.before)) {
    throw new Error(
      "Личная страница изменилась после неподтверждённого сохранения. Проверьте подарки и купоны вручную."
    );
  }

  if (!record) {
    journal.collection = {
      address,
      state: "pending",
      before: current,
      expected
    };
    saveJournal(journal);
  }

  const values = { content: expected.content };
  if (!current) {
    Object.assign(values, {
      title: expected.title,
      name: expected.name,
      tags: expected.tags,
      announcement: expected.announcement
    });
    getField(form, "title").value = expected.title;
    getField(form, "name").value = expected.name;
    getField(form, "tags").value = expected.tags;
    /** @type {HTMLInputElement} */ (
      form.querySelector('[name="announcement"][value="0"]')
    ).checked = true;
  }
  getField(form, "content").value = expected.content;
  await iframe.submit(
    form,
    getSubmitter(form, current ? "save" : "add_page"),
    values
  );
  const verified = await loadPage(iframe, address);
  if (snapshot(verified.page) !== snapshot(expected)) {
    throw new Error(
      "Личная страница не подтвердила сохранение. Нажмите «Продолжить принятие»."
    );
  }

  journal.collection = {
    address,
    state: "complete",
    expected: { title: expected.title }
  };
  saveJournal(journal);
};
