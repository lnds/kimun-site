---
title: "km impact"
description: "Impact of a diff"
---

Measures how far a change reaches, for a PR or for uncommitted work, before it is merged.

## What the blast radius is

The **blast radius** of a change is the part of the system that can behave differently because of it, beyond the files it edits. A change to a function is not only that function: it is every piece of code that calls it, and what calls those. If the function's own tests pass and something that uses it breaks in production, the break was inside the radius and outside the tests.

`km impact` measures it at two levels, and reports what guards it:

| Level | The radius is | Read from |
|-------|---------------|-----------|
| Projects | The projects of the repository that depend on the changed ones, directly or through others | Manifests |
| Source files | The files that call the functions that changed, and the files that use those | The dependency graph of the code |

At each level the radius is a count over a total: `3 of 6 projects`, `2 of 618 source files`. It answers **how much of the system to worry about**. Next to it comes **what is unprotected**: the files inside the radius that no test exercises. A wide radius fully covered by tests is a change to make with care; one file in the radius with no test is where it will break without warning, and the report names it.

Two more measures describe the change itself rather than its reach: how spread it is (**diffusion**), and which files usually change with it and were left out (**logical radius**).


```bash
km impact --since-ref origin/main [path]         # the branch you are on
km impact --since-ref main --until-ref feature   # a branch, without checking it out
git diff main... | km impact --diff -               # a patch
km impact --pr 123                               # a GitHub pull request
```

## What is measured

| Source | The change | History ends at | Manifests and files read from |
|--------|------------|-----------------|-------------------------------|
| `--since-ref REF` | From where `REF` and `HEAD` diverged to the working tree: committed, uncommitted and untracked changes, and deletions | That merge base | The working tree |
| `--since-ref A --until-ref B` | What `B` brings since it diverged from `A`, whatever is checked out | That merge base | The tree of `B` |
| `--diff FILE` | A patch in git format, from a file or from stdin (`-`) | `HEAD`, or where `--since-ref` and `HEAD` diverged when given | The working tree |
| `--pr NUMBER` | A GitHub pull request | As the mode it resolves to | As the mode it resolves to |

It is always the change over the whole repository: `path` only locates the repository and does not narrow the analysis. Generated files (lock files, minified assets) are left out of every measure.

**`--pr` requires the [GitHub CLI](https://cli.github.com) (`gh`) installed and authenticated.** kimun runs it as a program; it links no GitHub client and stores no token.

- When the repository has the commits of the pull request, it is measured from them, as between two refs. A pull request merged by squash or rebase, whose head was never fetched, is measured from the patch GitHub serves, read against the tree of the commit that merged it. Its base and that commit are not compared: the base may be many merges behind, and everything merged in between would be counted.
- Otherwise (a pull request from a fork, or one not fetched) its patch is taken from `gh pr diff` and measured like any other patch, with a note on stderr. `git fetch origin pull/NUMBER/head` makes its commits available.

A patch (`--diff`, or a pull request without local commits) is measured against the working tree, where it is not applied:

- it must be in git format with the `a/` and `b/` prefixes, as `git diff`, `git format-patch` and `gh pr diff` print it, without colors;
- for a branch use `git diff main...` (three dots): `git diff main` compares against the tip of `main`, and shows what `main` gained since as if the branch had undone it. To include uncommitted work, `--since-ref main` is the direct way;
- a project the patch creates is not known, so its files have unknown reach, and `--affected` lists every project;
- if the patch is already applied in `HEAD`, pass `--since-ref` so that its own commits are not counted as history.

## Blast radius: projects

Which projects of the repository are reached by the diff. Meant for monorepos, where a change to a shared library reaches applications its author may not know.

A **project** is a directory with a manifest. A project **depends** on another when its manifest names it as a local dependency; dependencies on registries or other repositories are ignored. A changed file belongs to the nearest project above it. The radius is every project that depends on a changed one, directly or through others.

| Ecosystem | Manifest | Local dependencies read |
|-----------|----------|-------------------------|
| Rust | `Cargo.toml` | `path` dependencies, `workspace = true` resolved through `[workspace.dependencies]`, in `[dependencies]`, `[dev-dependencies]`, `[build-dependencies]` and their `[target.*]` forms |
| JavaScript / TypeScript | `package.json` | any dependency whose name is another package of the repository (npm, yarn and pnpm workspaces), plus `file:` and `link:` |
| Elixir | `mix.exs` | `path:` dependencies and `in_umbrella: true` |
| Go | `go.mod`, `go.work` | required modules that are another module of the repository, and `replace` with a directory |
| Python | `pyproject.toml` | any requirement whose name is another project of the repository (whatever the case, and whichever of `-`, `_`, `.`), and those given a `path` in `[tool.uv.sources]` or in the tables of Poetry; read from `[project]` (`dependencies`, `optional-dependencies`), `[dependency-groups]`, `[build-system] requires`, `[tool.poetry]` and the development groups of uv and PDM |

```
Blast radius — projects reached through their manifests
──────────────────────────────────────────────────────────────────────────────
 3 of 6 projects reached (50%), 2 direct
 Changed: libs/core

 Changed    Reaches         Distance  Scope  Via
 libs/core  apps/inventory         1
 libs/core  libs/locker            1
 libs/core  apps/parcels           2         libs/locker
──────────────────────────────────────────────────────────────────────────────
Changed files outside every project (reach unknown): Makefile
```

- **Scope**: a `dev` dependency (dev or test only) reaches the dependent, whose tests use the changed project, and stops there: the changed project is not part of what the dependent ships, so the dependents of the dependent are not reached. `build` and `optional` dependencies carry on like runtime ones.
- **Workspace roots**: a `Cargo.toml` with `[workspace]`, a `package.json` with `workspaces` (or next to a `pnpm-workspace.yaml`), an umbrella `mix.exs` with `apps_path`, a `go.work`, a `pyproject.toml` with `[tool.uv.workspace]`. A change to the manifest or the lock file at such a root (`Cargo.lock`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lock`, `mix.lock`, `uv.lock`) reaches every project under it at distance 1, with scope `workspace`, and carries on from them. A workspace root is a project itself only when it declares one (`[package]` in Cargo, `app:` in mix, `[project]` in Python); a `package.json` at a workspace root never is.
- **Inert files** reach nothing: a change to documentation (`.md`, `.mdx`, `.rst`, `.adoc`, `.txt`) breaks no build and no test. It does not count as a change to its project, nor as a file of unknown reach. `.kimun.toml` can declare more:

  ```toml
  [impact]
  inert = ["scripts/**", "notebooks/**"]   # globs, relative to the repository
  ```

- **Files outside every project** (CI workflows, shared configuration) are listed apart. Their reach is unknown, not zero.

- **`--affected`** prints the projects whose builds and tests the diff calls for, one per line, and nothing else: the changed and the reached ones. If any changed file is outside every project, it prints **all** projects and says why on stderr — skipping a test suite is worse than running one too many. It reads only the diff and the manifests, not the history.
- A repository with a single project gets a line saying this level does not apply, rather than "0 reached".
- `node_modules`, `vendor` and `testdata` are never searched for manifests, nor are `deps`, `_build` and `target` (unless they sit under `src`, `lib` or `app`, where they are part of the project), nor is a `fixtures` directory inside a test directory. An end-to-end suite with its own manifest (`test/e2e/package.json`) is a project.

Limits:

- `mix.exs` is code and is read as text. A dependency whose path is built at run time (`Path.expand(...)`, string interpolation, a generated list) cannot be attributed; the report names the manifest and how many it missed.
- Of Python only `pyproject.toml` is read. A project declared in `setup.py` (which is code) or `setup.cfg` is not seen, nor is a local dependency written in `requirements.txt` (`-e ../lib`). A `pyproject.toml` that only configures tools, with neither `[project]` nor `[tool.poetry]`, is not a project. Extras (`optional-dependencies`) are `optional`; dependency groups are `dev`.
- Coupling across ecosystems is not visible: a web client and the service whose API it calls have no manifest dependency between them.
- A project nested in another (`assets/package.json` inside a Phoenix application) has no dependency to or from the one that contains it unless a manifest declares one.
- The graph is read from the working tree. The files of a project the diff deletes or moves away belong to no project any more: their reach is unknown, and the manifests still naming it are reported as not read.

## Blast radius: source files

Inside the projects the change affects: which source files use what changed, and which of them no test exercises. This is the question "the tests of the module I changed pass; who else calls it?".

The first line is the answer in short: how many files call what changed, and how many of them have no test. `Radius` is the count of files that call what changed, and of those that use them. `Upper bound` is what it would be without knowing which functions changed.

```
Structural radius — source files that use what changed
──────────────────────────────────────────────────────────────────────────────
 1 file calls what changed, 1 of them with no test
 Changed: lib/booking/insights.ex
 Functions: arrange
 Radius: 1 of 6 source files (17%): 1 at distance 1
 Not in the radius: 1 that refer to the module without calling it
 Upper bound, whatever the function: 4 files (67%)

 Tests  Dependent
  none  lib/booking_web/controllers/insight_controller.ex
            calls Insights.arrange
  none  lib/booking/export.ex
            refers to the module without calling it
──────────────────────────────────────────────────────────────────────────────
No test reaches 1 of the files that call what changed; an integration test is probably missing:
  lib/booking_web/controllers/insight_controller.ex
No test in the change exercises a file that uses what changed.
1 more with no test use the module without a call that tells whether the change concerns them.
```

How it is measured:

- The dependency graph of `km deps` is read backwards from the changed source files.
- In Elixir the change is **narrowed to functions**: the lines the diff touches tell which functions changed, and a change to a private function is carried to the public ones that reach it through local calls. A file that uses the module is then one of three: it **calls** a function that changed, it **refers** to the module without calling it (a struct, an `import`, a `use`), or it only calls functions the change leaves alone, and is not listed. Each changed file is narrowed on its own. Outside the functions, a touched `alias` or `require` changes none (it only names what the touched functions use), and a touched module attribute changes the functions that read it. A `use`, an `import`, a `defstruct`, or an attribute no function reads may concern every function: that file is not narrowed, every use of it counts, and the report says which line it was. A new file is never narrowed.
- In Python the change is narrowed to the **top-level names** of the module: its functions, classes and assignments. A touched method changes its class; a decorator belongs to what it decorates; a name that uses a changed one changes too, private or not, since nothing keeps another file from importing it. A file that uses the module calls what changed when it takes one of those names: `from m import name`, `m.name` on a module it imports (under its alias too), or, after `from m import *`, a name it goes on to mention. A module handed over as a value may give any of its names. One imported with nothing read on it only refers to the module. Imports, the docstring, an `if` or a `try` that only chooses imports, and the `if __name__ == "__main__":` block change no name. Any other code at the left margin runs when the module is imported and may concern every name: the file is not narrowed. Not seen: names reached at run time (`getattr`, a registry filled by decorators, `mock.patch("m.name")`), and which callers use the method that changed. A name a package re-exports is followed through its `__init__.py`, one distance further.
- The **radius** starts at the files that call what changed and follows who uses them, file by file. A file that only refers to the module, without a call that tells, is listed but does not carry the radius on: a schema is named by half a project, and following all of that says nothing. Files that only pass through a dependent the change leaves alone are not counted either. Past the first step the radius is still by file, not by function, so it stays an estimate from above. The **upper bound** is what the radius would be if every use of a changed file counted, whatever the function: in a codebase where everything goes through a few contexts it is most of the project, which is why the radius is the number to read.
- **Tests** says how the dependent is protected. A test rarely names everything it exercises — a controller or a live view is tested through its route, a helper through the views that use it — so protection comes in degrees:

  | `Tests` | Protection | When |
  |---------|------------|------|
  | a number | direct | That many test files refer to it, request a route it serves, or sit at the same place in the source and test layout (`lib/a/b.ex` and `test/a/b_test.exs`) |
  | `named` | named | A test carries its name a directory apart (`live/page_live.ex` and `page_live_test.exs`), or the name of the directory it is in (`page_live/index.ex` and `page_live_test.exs`). A test at the place of a source file is the test of that file and names no other: `app_test.exs` beside `app.ex` says nothing of the files in `app/` |
  | `users` | users | It has no test of its own, but a file that uses it has one |
  | `none` | none | No test reaches it |

  Test support (`test/support/`), configuration and scripts are not tests: a factory refers to everything and would make everything look protected.
- A file that calls what changed and that no test reaches is **unprotected**: the change can break it without any test noticing. That is the warning. Dependents are listed from the least protected.
- **Entry points** are told apart. A command-line task or a script is run, not used: no test of something else passes through it, and few have one of their own. With no test they get a line of their own instead of the warning. They are the files under `mix/tasks/`, `management/commands/`, `bin/` and `scripts/` that no source file uses, plus what `.kimun.toml` declares:

  ```toml
  [impact]
  entry_points = ["**/endpoint.ex"]   # globs, relative to the repository
  ```

- In Elixir, a test that requests a path protects the module that serves it. The routes are read from the Phoenix router of the project of the test, with the path and the alias of every `scope` around them; `:id` matches any one segment, and a segment the test writes at run time (`#{order.id}`) matches only a parameter of the route: a request for one order does not protect `/orders/new`.
- In Elixir, what a framework relates by convention counts as a use. A Phoenix controller uses the views named after it (`PageController` and `PageJSON`, `PageHTML`, `PageView`), so the test of the controller protects them. A module uses the components its templates render, whether written in it as `~H` or kept in a `.html.heex` file beside it (`page/index.ex` and `page/index.html.heex`) or in a directory named after it (`page_html.ex` and `page_html/home.html.heex`).


It is measured for the languages whose graph reflects usage: Elixir, JavaScript/TypeScript, Kaikai, Python and Rust. For Go the block says it is not available rather than report a radius drawn on declarations. Only the projects the change affects are read; the whole repository when the reach over projects is unknown.

Limits: a test at the same place, or named after a file, may not exercise the call that changed, and one that refers to a file may mock what it calls — the column says a test exists, not that it covers. `users` is weaker still: it says something that uses the file is tested. Function names are compared without arity. Modules named at run time (`apply/3`, configuration) or generated by macros are not seen. A request is read when its path is written in the call (`live(conn, ~p"/orders")`), not when it comes from a variable or a helper, and a route when it is declared on one line.

## Diffusion

How spread the change is.
 Kamei et al. found diffusion among the strongest predictors of a defect-inducing change.

| Measure | Meaning |
|---------|---------|
| Files changed | Files added, modified, renamed or deleted |
| Directories | Distinct directories holding a changed file |
| Subsystems | Distinct top-level directories (files at the root form one more) |
| Lines added / deleted | Binary files count no lines |
| Entropy | Shannon entropy of the modified lines over the files, divided by its maximum: `0` when one file holds every modified line, `1` when all the files hold the same amount |

## Logical radius

Files that usually change with the files of the diff and are **not** in it — a change that may have been forgotten. It catches coupling the code does not declare: tests, configuration, migrations.

```
Confidence = shared_commits / commits of the changed file
```

A file is reported when some changed file reaches `--min-confidence` with at least `--min-shared` shared commits. Confidence is directional, unlike the strength of `km tc`: a file that changed three times, always with one that changed a hundred times, has strength 1.0 but is needed in 3% of the changes to the other.

- History ends at the merge base: the commits of the diff are never evidence for themselves.
- Commits touching more than `--max-changeset` files are ignored, and the report says how many: a reformat or a rename across the project relates its files to each other by accident.
- A changed file with no history (new, or outside `--since`) predicts nothing. It is listed apart, so its silence is not read as "no impact".
- Files that no longer exist are not reported.
- Test files are always part of the analysis: a test that usually changes with the code is a change worth expecting.

Options:

| Flag | Description |
|------|-------------|
| `--since-ref REF` | Git ref to diff against, e.g. `origin/main`, `HEAD`. Required unless `--diff` or `--pr` is given |
| `--until-ref REF` | Measure up to this ref instead of the working tree (needs `--since-ref`) |
| `--diff FILE` | Measure a patch in git format; `-` reads stdin |
| `--pr NUMBER` | Measure a GitHub pull request; requires `gh` installed and authenticated |
| `--since DURATION` | Only consider history since this time (e.g. `6m`, `1y`, `30d`) |
| `--min-confidence F` | Minimum confidence to report a missing file (default: `0.5`) |
| `--min-shared N` | Minimum shared commits to report a missing file (default: `3`) |
| `--max-changeset N` | Ignore commits touching more than N files as evidence (default: `30`) |
| `--affected` | Print only the changed and reached projects, one per line |
| `--top N` | Show only the top N missing files (default: 20) |
| `--format {table,json,short,terse}` | Output format (default: table) |

Example output:

```
Change Impact — diff against main

Blast radius — projects reached through their manifests
──────────────────────────────────────────────────────────────────────────────
 Single project (.): no other project to reach; this level does not apply.
──────────────────────────────────────────────────────────────────────────────

Diffusion
  Files changed           5
  Directories             3
  Subsystems              2
  Lines added           120
  Lines deleted          30
  Entropy              0.82  (0 = one file holds the change, 1 = evenly spread)

Logical radius — files that usually change with this diff and are not in it
──────────────────────────────────────────────────────────────────────────────
 Missing file      Confidence   Shared  Changes with
──────────────────────────────────────────────────────────────────────────────
 src/tc/report.rs        0.80     8/10  src/tc/mod.rs (+1 more)
 README.md               0.50     6/12  src/cli.rs
──────────────────────────────────────────────────────────────────────────────
No history before the diff (new or never committed): src/impact/mod.rs
Generated files ignored: 1
```

When the rows are too wide for a table (long paths), each missing file is listed on a line of its own with its evidence below.

## JSON output, for tools and LLMs

`--format json` carries everything the table shows, and the lists the table cuts short. An agent reviewing a change can read it in this order:

```bash
km impact --since-ref origin/main --format json
```

| Field | Meaning |
|-------|---------|
| `source` | The change measured: `diff against main`, `PR #12`, `patch from stdin` |
| `structural.functions` | Functions the change affects (public ones in Elixir, top-level names in Python), over the files that tell them; `null` when none could be narrowed |
| `structural.narrowing[]` | Per changed file: `functions`, or `null` with the `reason` every use of it counts |
| `structural.direct[]` | Every file that uses a changed file: `file`, `exposure` (`calls`, `refers`, `elsewhere`), `protection` (`direct`, `named`, `users`, `none`), `calls`, `tests`, `tests_in_diff`, `entry_point` |
| `structural.unprotected[]` | Files that call what changed and that no test reaches, not even through what uses them — where an integration test is missing |
| `structural.untested_entry_points[]` | Command-line tasks and scripts that call what changed and have no test; not counted as unprotected |
| `structural.unknown_without_tests[]` | Files that use the changed module without a call that tells, and have no test |
| `structural.change_tests_a_dependent` | Whether a test in the change protects a file that uses what changed |
| `structural.radius` | `files`, `source_files` and `share` (0 to 1): the radius as a number |
| `structural.reach[]` | The files of the radius, by `distance` |
| `structural.upper_bound` | Files reached if every use of a changed file counted, whatever the function |
| `structural.unavailable[]` | Languages of changed files the source level is not measured for |
| `projects.changed[]`, `projects.reached[]` | Projects holding a changed file, and those reached, each with `origin`, `distance`, `via`, `scope` |
| `projects.affected[]` | Projects whose builds and tests the change calls for (what `--affected` prints) |
| `projects.outside[]` | Changed files that belong to no project: their reach is unknown |
| `projects.inert[]` | Changed files that reach nothing: documentation, and what `.kimun.toml` declares inert |
| `diffusion` | Files, directories, subsystems, lines and entropy of the change |
| `logical_radius.missing[]` | Files that usually change with the change and are not in it, with every trigger |

`km ai` exposes the command to an LLM as the tool `km_impact`, and the skill installed by `km ai skill` documents it.

`Shared` reads as shared commits over the commits of the changed file.
 `(+1 more)` means another changed file predicts the same missing file; `--format json` lists every one. `--format terse` prints the number of missing files.

**Note:** File renames are not tracked across git history. A file renamed in the diff itself keeps the history of its old path.
