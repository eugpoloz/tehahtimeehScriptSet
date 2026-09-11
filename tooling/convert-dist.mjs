#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const windows1251Characters = new Set([
  ...Array.from(
    "\u0402\u0403\u201a\u0453\u201e\u2026\u2020\u2021\u20ac\u2030\u0409\u2039\u040a\u040c\u040b\u040f\u0452\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u0098\u2122\u0459\u203a\u045a\u045c\u045b\u045f\u00a0\u040e\u045e\u0408\u00a4\u0490\u00a6\u00a7\u0401\u00a9\u0404\u00ab\u00ac\u00ad\u00ae\u0407\u00b0\u00b1\u0406\u0456\u0491\u00b5\u00b6\u0451\u2116\u0454\u00ba\u00bb\u0458\u0405\u0455\u0457"
  ),
  ...Array.from({ length: 64 }, (_, index) =>
    String.fromCodePoint(0x0410 + index)
  )
]);

const escapeUnsupportedCharacters = (source) =>
  Array.from(source, (character) => {
    const codePoint = character.codePointAt(0);
    if (codePoint < 128 || windows1251Characters.has(character)) {
      return character;
    }

    if (codePoint <= 0xffff) {
      return `\\u${codePoint.toString(16).padStart(4, "0")}`;
    }

    const adjusted = codePoint - 0x10000;
    const highSurrogate = 0xd800 + (adjusted >> 10);
    const lowSurrogate = 0xdc00 + (adjusted & 0x3ff);
    return `\\u${highSurrogate.toString(16)}\\u${lowSurrogate.toString(16)}`;
  }).join("");

const files = readdirSync(dist).filter((file) =>
  /^teh\..+\.iife\.js$/.test(file)
);

for (const file of files) {
  const source = join(dist, file);
  const target = join(dist, file.replace(/\.js$/, ".windows-1251.js"));
  const sourceText = escapeUnsupportedCharacters(readFileSync(source, "utf8"));
  const converted = execFileSync(
    "iconv",
    ["-f", "UTF-8", "-t", "WINDOWS-1251"],
    { input: sourceText }
  );

  writeFileSync(target, converted);
  console.log(target);
}
