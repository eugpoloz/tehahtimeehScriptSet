# Repository guidelines

## Architecture

- This repository is a Yarn 4 workspace monorepo for browser scripts targeting
  mybb/rusff forums.
- Keep application source in JavaScript. Do not convert source files to
  TypeScript unless the task explicitly requires it.
- Use JSDoc and strict `checkJs` for type safety.
- Put shared browser utilities in `lib/utils`.
- Put buildable scripts in `scripts/<kebab-case-name>`.
- Each script builds an IIFE into the root `dist/` directory and attaches its
  public API to `window.teh`.
- Load `@teh/core` before packages that attach to the shared namespace.

## Code style

- Use ESM imports and exports.
- Follow the repository Prettier configuration: 2 spaces and no trailing
  commas.
- Prefer HTML template strings over creating DOM elements imperatively. Do not
  use `document.createElement` or equivalent element-by-element construction
  when generating markup.
- Prefer small feature modules under `src/features` and reusable helpers under
  `src/helpers`.
- Optimize for human readability. Prefer explicit conditionals over multiline
  or nested ternary expressions.
- Use early returns for unsupported pages, missing DOM elements, and failed
  access checks.
- Add JSDoc to public functions and non-obvious data structures.
- Preserve Russian user-facing text unless the task explicitly changes copy.
- Preserve existing public `window.teh` APIs unless a breaking change is
  requested.

## Workflow

- Use `make new-script NAME=<kebab-name>` to scaffold a script package.
- Run `make typecheck` after changing checked JavaScript or JSDoc types.
- Build the affected package with `make <script-name>`. Use `make build` for
  cross-package or build-system changes.
- Run `make format` only when formatting changes are intended; it rewrites
  matching files across the repository.
- Do not hand-edit files in `dist/`; regenerate them through the build.
- Do not add production dependencies without explaining why they are needed.

## Change policy

- Prefer focused changes over unrelated cleanup.
- Update `README.md` when commands, packages, architecture, or public APIs
  change.
- Follow the repository's Conventional Commit-style history, for example
  `feat(scope): description` or `fix(scope): description`.
- Before handing off a change, report which validation commands ran and any
  checks that could not run.
