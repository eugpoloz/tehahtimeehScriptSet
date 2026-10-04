import { escapeHtml } from "@teh/utils";

export const DEFAULT_ICON = "https://cdn.imgchest.com/files/7b7d928ec1eb.png";
export const DEFAULT_PLAQUE = "https://cdn.imgchest.com/files/c37f246a483c.png";
export const STARTER_COUPONS = [
  "<strong>любая плашка</strong> из магазина",
  "<strong>любая иконка</strong> из магазина"
];

const supportedCharacters = new Set(
  new TextDecoder("windows-1251").decode(
    Uint8Array.from({ length: 128 }, (_, index) => index + 128)
  )
);

/** Preserve accents and other Unicode in HTML submitted through Windows-1251 forms. @param {string} value */
const escapeForumHtml = (value) =>
  escapeHtml(value).replace(/[^\x00-\x7f]/gu, (character) => {
    if (supportedCharacters.has(character)) {
      return character;
    }

    return `&#${character.codePointAt(0)};`;
  });

/** Starter collection for a new main profile. */
export const getStarterCollection =
  () => `<span hidden data-character-vault-page></span>

<span hidden id="coins">
<!-- ЧЕКАННЫЕ МОНЕТЫ ЧИСЛОМ -->
0
<!-- / СТОП ЧЕКАННЫЕ МОНЕТЫ -->
</span>

<div hidden data-collection="coupon">
<!-- КУПОНЫ, КАЖДЫЙ — НА СВОЕЙ СТРОКЕ -->

${STARTER_COUPONS.join("\n")}

<!-- / СТОП КУПОНЫ -->
</div>

<div hidden data-collection="icon">
<!-- ИКОНКИ, КАЖДАЯ — НА СВОЕЙ СТРОКЕ -->

${DEFAULT_ICON}
https://cdn.imgchest.com/files/5bf991bab422.png

<!-- / СТОП ИКОНКИ -->
</div>

<div hidden data-collection="plashka">
<!-- ПЛАШКИ, КАЖДАЯ — НА СВОЕЙ СТРОКЕ -->

${DEFAULT_PLAQUE}
https://cdn.imgchest.com/files/dd7a83b76718.png

<!-- / СТОП ПЛАШКИ -->
</div>

<div hidden data-collection="gift">
<!-- ПОДАРКИ ОСНОВНОГО ПРОФИЛЯ, КАЖДЫЙ — НА СВОЕЙ СТРОКЕ -->

<!-- СТОП ПОДАРКИ -->
</div>`;

/** @param {string} name @param {number} number */
export const getTwinGift = (name, number) =>
  `<div hidden data-collection="gift" data-profile="${escapeForumHtml(name)}">
<!-- ПОДАРКИ ТВИНКА ${number}, КАЖДЫЙ — НА СВОЕЙ СТРОКЕ -->

<!-- / СТОП ПОДАРКИ ТВИНКА ${number} -->
</div>`;

/** @param {import('./character-data').AcceptanceInput} input @param {string} address */
export const getProfileFields = (input, address) => {
  let collectionHref = address;
  if (typeof input.character.main === "string") {
    collectionHref += `?${new URLSearchParams({ char: input.name })}`;
  }

  return {
    "form[fld2]": `<a href="/viewtopic.php?id=${input.source.topicId}#p${input.source.postId}" target="_blank">${escapeForumHtml(String(input.character.ru))}, ${input.age}</a>`,
    "form[fld5]": `<button type="button" class="link" data-vault-href="${escapeForumHtml(collectionHref)}">Коллекция</button>`,
    "form[fld1]": `<profile-icon src="${DEFAULT_ICON}"></profile-icon>\n<profile-plashka src="${DEFAULT_PLAQUE}"></profile-plashka>`
  };
};

const SHARED_LETTER = `[block="hehe hehe-max hehe-welcome"]
[block=poster][block=title]Welcome[/block] [img]https://forumstatic.ru/files/001c/ab/7e/69922.png[/img][/block]

[block=wrapper]

[block=nav]
[url=https://hehedges.rusff.me/viewtopic.php?id=17]обкашлять вопросики[/url] [url=https://hehedges.rusff.me/viewtopic.php?id=32]найти связи и игру[/url] [url=https://hehedges.rusff.me/viewtopic.php?id=98#p5805]зайти в магазин[/url] [url=https://hehedges.rusff.me/viewtopic.php?id=16]забрать шаблон эпизода[/url] [url=https://hehedges.rusff.me/viewforum.php?id=13]завести персонажу соцсети[/url] [url=https://hehedges.rusff.me/viewforum.php?id=18]заглянуть во флуд[/url] [url=https://hehedges.rusff.me/viewforum.php?id=20]запилить личную тему[/url]
[/block]

[hr]

[block=subtitle]Что дальше?[/block]

[ul]
Оставьте здесь сообщение под [b]хронологию[/b], чтобы мы могли унести это письмо счастья и оставить тему в вашем распоряжении. Складывать в нее дальше можно все о вашем персонаже: рандомные факты о жизни и среде обитания, инвентарь и артефакты, отношения, аватарки, в общем, на что хватит фантазии.

Не забудьте закрепить первое сообщение, если вы еще не.

Личное звание и дефолтные плашки вы можете проставить сами на странице "Дополнительно" вашего профиля. (%
[/ul]
[/block][/block]`;

const MAIN_LETTER = `[block=hehe hehe-max][hr][/block]

[block=hehe hehe-max hehe-welcome wrapper]
[block=subtitle]Для красивого старта:[/block]

[table layout=fixed width=100%]
[tr]
[td][/td]
[td width=283px][block=gifts][iconprofile]https://cdn.imgchest.com/files/7b7d928ec1eb.png[/iconprofile][plashka=https://cdn.imgchest.com/files/c37f246a483c.png]looking for the [i]truth[/i][/plashka][plashka=https://cdn.imgchest.com/files/dd7a83b76718.png]in pursuit of [i]magic[/i][/plashka][iconprofile]https://cdn.imgchest.com/files/5bf991bab422.png[/iconprofile][/block][/td]
[td width=113px][block=gifts flex-col][coupon][b]любая плашка[/b] из магазина[/coupon][coupon][b]любая иконка[/b] из магазина[/coupon][/block][/td]
[td][/td]
[/tr]
[/table]
[/block]`;

const TWIN_LETTER = `[block=hehe hehe-max][hr][/block]

[block=hehe hehe-max wrapper]
[block=subtitle]Купоны за твинка:[/block]
[align=center][coupon][b]любая плашка[/b] из магазина[/coupon] [coupon][b]любая иконка[/b] из магазина[/coupon][/align]
[/block]`;

/** Exact agreed BBCode, shared text followed by one profile modifier. @param {import('./character-data').AcceptanceInput} input */
export const getAcceptanceLetter = (input) => {
  let modifier = MAIN_LETTER;
  if (typeof input.character.main === "string") {
    modifier = TWIN_LETTER;
  }

  return `${SHARED_LETTER}\n\n${modifier}`;
};
