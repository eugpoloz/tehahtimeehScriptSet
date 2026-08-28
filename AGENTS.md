# Repository instructions

These instructions apply to the entire repository.

## Scope and change discipline

- Implement only the behavior requested for the current task. Treat future
  features and examples as context, not authorization to implement them.
- Requests to “outline,” “scaffold,” or “prepare for” a feature authorize only
  that preparatory work, not the feature itself.
- When implementing a larger feature or refactor, prefer small, reviewable
  steps. After each step, summarize the changes and validation, then wait for
  review before starting the next step.
- Preserve existing runtime behavior and public `window.teh` APIs unless the
  task explicitly requests a behavior change or breaking change.
- Keep changes focused. Do not include unrelated cleanup.
- If the requested boundary or file structure is unclear, present the proposed
  structure and wait for approval before editing.
- Before adding any dependency, explain why it is necessary and wait for
  explicit approval.

## Repository architecture

- This is a Yarn 4 workspace monorepo of browser scripts for mybb/rusff forums.
- Keep buildable scripts in `scripts/<kebab-case-name>`.
- Keep shared browser utilities in `lib/utils`.
- Organize script code into small feature modules under `src/features` and
  reusable helpers under `src/helpers`.
- Each script must build as an IIFE into the root `dist/` directory and expose
  its public API through `window.teh`.
- Load `@teh/core` before any package that extends the shared `window.teh`
  namespace.

## JavaScript and markup standards

- Keep application source in JavaScript unless the task explicitly requires
  TypeScript. Use ESM imports and exports.
- Use JSDoc with strict `checkJs` for type safety. Document public functions and
  non-obvious data structures.
- Follow the repository Prettier configuration: 2-space indentation and no
  trailing commas.
- Optimize for human readability:
  - Prefer explicit conditionals to multiline or nested ternary expressions.
  - Use early returns for unsupported pages, missing DOM elements, and failed
    access checks.
  - Always use braces for control-flow blocks, including single-statement
    branches.
  - Put `return` on its own line. After a block that returns, leave a blank line
    before the next statement.
- Generate markup with HTML template strings. Do not construct generated markup
  element by element with `document.createElement` or equivalent APIs.
- Preserve Russian user-facing text unless the task explicitly changes the
  copy.

## Editing, building, and validation

- Scaffold a new script package with `make new-script NAME=<kebab-name>`.
- Edit source files, never generated files in `dist/`. Regenerate `dist/`
  artifacts through the build.
- After changing checked JavaScript or JSDoc types, run `make typecheck`.
- Build a changed script with `make <script-name>`.
- Run `make build` instead when a change affects multiple packages or the build
  system.
- Run `make format` only when repository-wide formatting changes are intended;
  it rewrites all matching files.
- Before handing off, report every validation command run and any check that
  could not be run.

## Documentation and commits

- Update `README.md` when commands, packages, architecture, or public APIs
  change.
- When creating a commit, follow the repository's Conventional Commit style,
  for example `feat(scope): description` or `fix(scope): description`.
