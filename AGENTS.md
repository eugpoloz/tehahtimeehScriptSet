# Repository instructions

These instructions apply to the entire repository.

## Scope and change discipline

- Implement only the behavior requested for the current task. Treat future
  features and examples as context, not authorization to implement them.
- Read only files relevant to the current task and avoid broad repository
  scans.
- Requests to “outline,” “scaffold,” or “prepare for” a feature authorize only
  that preparatory work, not the feature itself.
- When implementing a larger feature or refactor, prefer small, reviewable
  steps. After each step, summarize the changes and validation, then wait for
  review before starting the next step.
- Backwards compatibility is not required: this repository is in beta and is
  used only by the repository owner. Make breaking changes when they directly
  satisfy the current task.
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

- Treat small tasks as one implementation step.
- For every implementation step that changes code, run `make typecheck` and
  the appropriate build. Documentation-only changes do not require these
  checks. Do not run any other checks unless the user explicitly requests
  them.
- Do not rerun a check unless files affecting it changed since the last
  successful run.
- Do not run `git diff --check`; it is not needed for this repository.
- Scaffold a new script package with `make new-script NAME=<kebab-name>`.
- Edit source files, never generated files in `dist/`. Regenerate `dist/`
  artifacts through the build.
- Build a changed script with `make <script-name>`.
- Run `make build` instead when a change affects multiple packages or the build
  system.
- Run `make format` as the final step immediately before handing files off for
  review. Documentation-only changes require only this final format step. If
  files change afterward, run `make format` again before handoff.
- Before handing off, report the applicable validation commands run, and any
  required checks that could not be run.

## Communication efficiency

- Keep progress updates and final responses concise.
- Summarize successful command output; include detailed output only when a
  command fails or the details are necessary.
- Do not restate repository instructions or explain obvious edits.

## Documentation and commits

- Update `README.md` when commands, packages, architecture, or public APIs
  change.
- When creating a commit, follow the repository's Conventional Commit style,
  for example `feat(scope): description` or `fix(scope): description`.
