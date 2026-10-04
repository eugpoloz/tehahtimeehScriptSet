# Repository instructions

These instructions apply throughout `tehahtimeehScriptSet`.

## Scope

- Implement only the current request; read only relevant files and avoid
  unrelated cleanup or broad scans. Future features and examples are context.
  “Outline,” “scaffold,” and “prepare for” authorize preparation only.
- If scope or file structure is unclear, propose it and wait for approval.
- Explain any new dependency and obtain approval before adding it.
- Agree on milestones before larger features or refactors; validate each and
  wait for review. Treat small tasks as one step.
- Breaking changes are allowed when required by the request; preserve unrelated
  behavior and APIs.

## Workspace boundaries

- Keep plans for both repositories in `hehedges-backups/plans/`.
- Editing either or both repositories is allowed within the current task;
  crossing repository boundaries needs no separate approval.
- Read `hehedges-backups/AGENTS.md` before working there. Apply each repository's
  instructions only to its own files.
- Before editing scripts in `tehahtimeehScriptSet` to accommodate style changes
  in `hehedges-backups`, describe the proposed script changes and ask for
  approval. Wait for approval before making those edits.

## Repository architecture

- Yarn 4 workspace monorepo of browser scripts for mybb/rusff forums.
- Buildable scripts: `scripts/<kebab-case-name>`; shared utilities: `lib/utils`.
  Use small modules in `src/features` and reusable helpers in `src/helpers`.
- Build each script as an IIFE into root `dist/`; expose public APIs through
  `window.teh`. Load `@teh/core` before packages extending that namespace.

## JavaScript and markup standards

- Use JavaScript and ESM unless TypeScript is explicitly requested. Use JSDoc
  with strict `checkJs`; document public functions and non-obvious structures.
- Follow Prettier: 2-space indentation, no trailing commas.
- Prefer explicit conditionals over multiline or nested ternaries. Use early
  returns for unsupported pages, missing elements, and failed access checks.
- Always brace control flow. Put `return` on its own line and leave a blank line
  after a returning block.
- Generate markup with HTML template strings, not element-by-element DOM APIs.
- Use classes for CSS hooks. Reserve IDs and data attributes for JavaScript
  hooks or required DOM relationships, never CSS selectors.
- Preserve Russian user-facing text unless copy changes are requested.

## Editing, building, and validation

- For each code-changing step, run `make typecheck` and the appropriate build:
  `make <script-name>`, or `make build` for multiple packages or build-system
  changes. Documentation-only changes need neither.
- Run no other checks unless requested, and rerun successful checks only when
  relevant files change. Never run `git diff --check`.
- Scaffold a new script package with `make new-script NAME=<kebab-name>`.
- Edit source, never generated `dist/` files; regenerate artifacts by building.
- Run `make format` last before review, including documentation-only changes.
  If files change afterward, format again.
- Report validation commands run and any required checks that could not run.

## Communication and documentation

- Keep progress updates and final responses concise.
- Summarize successful output; show details only for failures or when needed.
  Do not restate instructions or explain obvious edits.
- Update `README.md` for command, package, architecture, or public API changes.
- Use Conventional Commits, e.g. `feat(scope): description`.
