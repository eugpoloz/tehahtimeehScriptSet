/** Ambient forum / platform globals used by mybb/rusff pages. */

interface ForumTopic {
  forum_id: string | number;
  [key: string]: unknown;
}

interface ForumEditor {
  [key: string]: unknown;
}

interface Forum {
  topic?: ForumTopic | null;
  editor?: ForumEditor | object | null;
  get?: (path: string) => unknown;
  [key: string]: unknown;
}

/**
 * HTMLElement on profile pages, function elsewhere.
 */
declare const profile: HTMLElement | ((...args: unknown[]) => unknown);

declare const FORUM: Forum;

declare const UserID: string | number | undefined;

declare const GroupID: string | number | undefined;

interface RusffCoreSettings {
  show_reportBtn: number;
  rusff_smilepack: number;
  use_awards: number;
  files: {
    button: boolean;
  };
  share: boolean;
  tags: boolean;
  graffiti: boolean;
}

interface RusffCore {
  sets: RusffCoreSettings;
}

declare const RusffCore: RusffCore;

/** Editor helpers injected by the forum UI. */
declare function bbcode(open: string, close?: string): void;
declare function insert(text: string): void;

interface Window {
  UserID?: string | number;
  UserLogin?: string;
  GroupID?: string | number;
  teh?: TehNamespace;
}

/** Runtime namespace populated by @teh/core (and extended by other IIFEs). */
interface TehNamespace {
  [key: string]: unknown;
}

declare const teh: TehNamespace;

interface JQueryDocumentEvents {
  on(events: string, handler: (event: Event) => void): JQueryDocumentEvents;
  off(events: string): JQueryDocumentEvents;
}

/** jQuery APIs supplied by the forum. */
interface JQueryStatic {
  (target: Document): JQueryDocumentEvents;
  jGrowl(message: string, options?: { sticky?: boolean }): void;
}

declare const $: JQueryStatic;
