---
title: "km deps"
description: "Dependency graph analysis"
---

Analyzes internal module dependencies by parsing import/use/require statements. Builds a directed graph of file-level coupling and detects cycles using Tarjan's SCC algorithm.

```bash
km deps [path]
```

Supports Elixir (every module referred to in the code, with `alias` undone; see the notes below), Rust (every path that names a module of the workspace: `use`, `crate::`, `super::`, a child module; see the notes below), Python (`import` and `from … import`, absolute and relative; see the notes below), JavaScript/TypeScript (`import`, `export … from`, `require` and `import()`, relative or through the aliases of `tsconfig.json` and the packages of the workspace; see the notes below), Go (imports of the packages of the repository, by the module path of each `go.mod`; see the notes below), C and C++ (`#include`, as a compiler finds it; see the notes below), Java (the classes a file names, through its package and its imports; see the notes below), C# (the types a file names, through its namespaces and its `using` directives; see the notes below), Ruby (`require_relative`, `require` against the load path, and the constants a file names, as Rails autoloads them; see the notes below), and Kaikai (`import a.b.c`, including the `as` and `.{…}` forms). External dependencies (crates, npm packages, system headers, the Kaikai stdlib) are ignored.

Files in any other language are left out of the graph instead of being listed with zero dependencies. The table footer, the `unsupported` array of the JSON output and the `unsupported:N` field of the short format say how many files were skipped, so "not measured" is never shown as "no dependencies".

Some imports do not load a module when the importer loads: a TypeScript `import type` (and `import { type A }` when every name is a type, and `export type … from`) and a Python import under `if TYPE_CHECKING:` take only types, and a Python import inside a function or a dynamic `import()` runs later. They stay in the graph, marked `type` or `deferred`, and count in fan-in and fan-out, since they are still coupling, but they are left out of cycle detection: a cycle is a set of files that need each other to load. The table footer counts them (`Imports left out of cycles: …`), and the JSON gives `type_fan_out` and `deferred_fan_out` per file, which are part of `fan_out`, and `type_edges` and `deferred_edges` in total.

An import that has the form of a project file but resolves to none is reported, so that a missing edge is not read as no dependency: a quoted `#include` that is no header of the system (often a file generated at build time), a relative JavaScript or TypeScript specifier of a script, a relative Python import, a Go import within a module of the repository. External packages are never listed. The table footer counts them (`Unresolved internal imports: N in M files`), the JSON lists them per file in `unresolved` and counts them in `unresolved_count`, and the short format gives `unresolved:N`. Rust, Elixir, Java, C# and Kaikai name modules and types rather than files, where nothing tells an internal name from an external one, so they report none.

The JSON lists the edges in `edges`, each as `{"from", "to", "kind"}` with `kind` one of `load`, `compile`, `deferred` or `type`: those that leave the files listed, so `--top` and `--cycles-only` narrow them as they narrow `files`.

Elixir notes:

- Dependencies are between modules, and most need no import, so every module name in the code counts as a reference: calls, structs, `use`, `import`, `require`, `@behaviour`, `defimpl`. Comments, strings, heredocs and sigils are set aside first, so a doctest is not a dependency.
- `alias` is undone, including `as:`, grouped and multi-line forms, and `__MODULE__`. The statement itself is not a use.
- Nested `defmodule`s are named after the module that contains them, told by indentation as `mix format` leaves it.
- A module defined in several files (projects made from one template) resolves to the file nearest the one referring to it.
- Comments and literals hold no references, but the code a string interpolates does: `"Total: #{Orders.total(order)}"` uses `Orders`.
- A Phoenix controller uses the views named after it (`PageController` and `PageJSON`, `PageHTML`, `PageView`), and a module uses the components its `~H` templates render.
- `mix.exs`, `.formatter.exs` and the scripts of a `config` directory configure the build: they stay in the graph with no dependencies, and the modules they name (`groups_for_modules`, `config :app, App.Endpoint`) or define (`App.MixProject`) make no edges.
- `use Foo, :name` runs `Foo.name` and `use Foo` runs `Foo.__using__`. When `Foo` is a module of the project, the code of that function, and of the functions it splices in with `unquote(helper())`, is read as written in the user: its aliases, imports and references are the user's. A live view that does `use MyAppWeb, :live_view` uses `MyAppWeb.CoreComponents` and the `Layouts` it names, as the compiler sees it. The quote is read whole, whichever branch the macro takes.
- `import Foo, only: [bar: 1]` calls `Foo.bar`. Without `only:`, a call with no module (`bar(x)`, `&bar/1`, `<.bar>` in a template) that the file does not define calls the function of that name of each module of the project it imports.
- A use the file needs to compile is marked `compile`: a `use`, and a call to a macro (`defmacro`, `defguard`) of the project, as the compiler expands it into the caller. What a `quote` block holds is compiled where the macro is called, so it makes no `compile` use of the file that writes it; what a `use` injects is compiled in the user. An `import` or `require` alone recompiles the file only when the exports of the module change (`mix xref` calls that `export`), so it is a plain use. A `compile` use counts in cycles; the table footer counts them (`Compile-time uses …`), and the JSON gives `compile_fan_out` per file and `compile_edges` in total. A function called in the body of a module, outside any function (`plug Plug.Static, only: MyAppWeb.static_paths()`), also runs at compile time, and is not told.
- Not seen: modules named at run time (`apply/3`, configuration), those generated by macros, and those a Phoenix router names under the alias of a `scope`. Functions are told by name, not by arity.

Rust notes:

- A dependency is a path: `use crate::git::GitRepo`, a qualified `super::analyzer::run(x)`, a call on a child module (`report::print(x)`). Groups, `as`, `self`, globs and multi-line `use` are read. `mod x;` only says where a module lives and adds no edge.
- Each crate is a tree of modules grown from its root (`src/lib.rs`, `src/main.rs`, a file of `src/bin`, `tests`, `examples` or `benches`, `build.rs`) by its `mod` declarations, `#[path]` included. A path leads to the file of the deepest module it names: the item may be defined there or only re-exported. A module declared twice under opposite `#[cfg]`s, with a `#[path]` each, leads to both files.
- A crate re-exported under a name (`pub extern crate grep_printer as printer`, `pub use grep_printer as printer`) is followed: `grep::printer::Stats` leads to the library of `grep-printer`, and the facade uses it.
- Other targets of a package reach its library by name (`my_app::orders` from `tests/` or `main.rs`), and so do the other crates of the workspace. The name comes from `[package] name`, with `-` read as `_`.
- A type uses the files that hold its `impl` blocks, since what they define is reached through the type.
- For `km impact`, a file that holds `#[test]` functions has a test of its own; a file of `tests/` that holds them, or a `tests.rs` module, is a test. What a package runs (`src/main.rs`, `src/bin`, `examples`, `benches`, `build.rs`) is an entry point.
- Comments, strings and `$crate` in a macro name nothing.
- Not seen: what a macro generates or names, `include!`, a library with a `[lib] path` or `name` of its own, a dependency renamed in `Cargo.toml`, and modules behind `cfg`, which all count. A use only from an inline test module still makes the file a dependent. A test that runs the binary (`assert_cmd`, `CARGO_BIN_EXE_*`) names no file, so it protects none. Two packages of the same name in one repository are not told apart.

Python notes:

- Every `import a.b` and `from a.b import c` is read, wherever it is written: in a function, under `if TYPE_CHECKING:`, over several lines in parentheses or with a backslash. One written in a docstring or a comment is not an import. Where it is written is read by indentation: under `if TYPE_CHECKING:` (or `if typing.TYPE_CHECKING:`) it is `type`, in a function (`def`, `async def`, a method) it is `deferred`, anywhere else it loads, a class body and the `else:` of `if TYPE_CHECKING:` included. Neither of the first two makes a cycle.
- A dotted path names `a/b.py` or the package `a/b/__init__.py`; a stub (`.pyi`) stands for a module with no source. Only the deepest module is used: `import a.b.c` adds no edge to `a/__init__.py`.
- In `from a.b import c`, `c` is the submodule `a/b/c.py` when that file exists, and a name `a.b` defines otherwise.
- A relative import starts at the package of the importing file, one level up per extra dot.
- An absolute import is looked up from each directory above the importing file that is not itself a package (it holds no `__init__.py`), nearest first, and from the `src` directory under each. That covers a project run from its root, a `src` layout with `tests/` beside it, and several projects in one repository. Then come the roots the nearest `pyproject.toml` above declares: where the build backend finds the packages (`where` and `package-dir` of setuptools, `packages` of Poetry, `sources` and `packages` of Hatch, `python-source` of maturin, `package-dir` of PDM, `module-root` of uv) and what pytest adds (`pythonpath`). What is found under none of them is external: the standard library, installed packages.
- For `km impact`, `test_*.py`, `*_test.py` and `tests.py` are tests, and `conftest.py` is test support, which protects nothing; `__main__.py`, `setup.py` and `manage.py` are entry points, and so is what sits under `management/commands`.
- Not seen: modules named at run time (`importlib`, `__import__`, Django settings and `INSTALLED_APPS`), roots added at run time (`sys.path`, `PYTHONPATH`, a `.pth` file) or declared in `setup.py`, `setup.cfg` or `pytest.ini`, and a namespace package spread over several roots. A name a package re-exports leads to its `__init__.py`, and from there to the module that defines it.

Go notes:

- An import names a package, and a package is a directory: the import depends on every `.go` file directly inside it, not on the ones in its subdirectories, which are other packages. Which file holds what was used is not read, so fan-out counts files: one import of a package of 17 files adds 17.
- Imports are read from the code: one written in a comment or a string, such as the example program of a package comment, is not an import. A package cannot import itself, so an import of the file's own directory adds no edge, unless the file is an external test package.
- Test files (`_test.go`) are not part of what a package offers, and neither are the files the toolchain ignores (`_x.go`, `.x.go`). A test in an external test package (`package store_test`) that imports its own package depends on the files beside it.
- Every `go.mod` under the analysed directory is read, so the modules of a repository with several resolve each from its own directory, with or without a `go.work`. An import of the module path itself is the package at the root of the module.
- The files of one package use each other without importing, so there are no edges between them. The import graph is therefore a lower bound on the real dependencies.
- Not seen: build constraints (`//go:build`, file names such as `x_linux.go`), so a file left out of a build still counts, and packages under `vendor/`.
- An import under the path of a module of the repository that names no directory with a package is reported as unresolved.

JavaScript/TypeScript notes:

- Only the import forms are read: `import … from`, a bare `import '…'`, `export … from`, `require('…')`, `import('…')` and `import x = require('…')`, several to a line or over several lines. Any other string is no import, so a path given to `fs.readFile` or `path.resolve` is not a dependency.
- A relative specifier resolves from the importing file, trying the extensions of JavaScript and TypeScript and the `index` of a directory. A `.js` that does not exist names its TypeScript source (`./a.js` is `a.ts`), and a query such as Vite's `?raw` names the same file.
- Any other specifier goes first through the `paths` of the nearest `tsconfig.json` or `jsconfig.json` above the importing file, the most specific pattern winning, then through its `baseUrl`. `extends` is followed within the repository, and a directory whose main config has no aliases takes those of the others beside it (`tsconfig.app.json`). Comments and trailing commas are allowed.
- Then a specifier may name a package of the repository, by the `name` of its `package.json`: `@acme/ui` leads to its entry point (`source`, `module`, `main`, `types`, `exports`, read from `src` when they point to a build directory, or else `src/index`), and `@acme/ui/button` to that file of the package or of its `src`. Packages under `node_modules` are not read. What resolves to none of these is external.
- A barrel (`index.ts`) is a file like any other: its importers depend on it, and it on what it re-exports.
- `import type`, `export type … from`, and an import or re-export whose names are all marked `type` (`import { type A, type B }`) take only types: the compiler erases them, so they are `type` and make no cycle. One name that is a value, or a default import beside them, makes the import load. `import()` is `deferred`: the module loads when the call runs.
- A relative specifier that resolves to no file is reported as unresolved when it names a script: no extension or one of JavaScript or TypeScript. A stylesheet or an image is no file of the graph.
- Not seen: the aliases of a bundler config (`resolve.alias` of Vite or webpack), `imports` of `package.json` (`#internal`), specifiers built at run time, and `.vue` and `.svelte` files.

C and C++ notes:

- The include directories of the build (`-I`, CMake's `include_directories`) are not read. A quoted `#include "a/b.h"` is looked for beside the includer first; then, quoted or not, in each directory above it and in the `include` directory of each; then wherever a file of the repository ends with that path, when one is nearest to the includer.
- `#include <stdio.h>` and any other bare name in angle brackets that is in none of those directories is a system header: no edge, even if the repository holds a file of that name somewhere else.
- A file that includes a header uses what its source defines too: `foo.h` and the `foo.c` beside it, or `include/x/foo.h` and `src/x/foo.c`. `km deps` shows only the includes the code writes, so a source and a header that include each other's counterpart make no cycle; `km impact` follows both, so a change to `foo.c` reaches whoever includes `foo.h`.
- Preprocessor conditions (`#ifdef`) are not evaluated: every include counts.
- A quoted include that resolves to no file of the repository is reported as unresolved, unless it names a header of the C library or of POSIX (`"stdio.h"`, `"sys/types.h"`), which a quoted include may also reach. An include in angle brackets is never reported.

Java notes:

- A class is known by its package and its name, and lives in the file of its top-level class, wherever the source root is (`src/main/java`, `src`, a module of a multi-module build).
- A file uses the classes it names: those of its own package and of each import on demand (`import a.b.*`) by their simple name, each class it imports by itself, and any class written with its package (`a.b.C`). A nested class (`a.b.Outer.Inner`) and a static import lead to the file of the outer class. An import is a use even when nothing names the class.
- When several files declare the same class (two flavors of one library, a generated copy), the one nearest to the file that names it is taken.
- The JDK and libraries declare no file of the repository: their classes are external.
- A field, a variable or a method that has a class's name is not told from it.

C# notes:

- A `using` names a namespace, not a file. A type is known by its namespace (block-scoped or file-scoped) and its name, and a file uses the types it names.
- A file sees by their simple name the types of each namespace it is in and of those around it (`App.Web` sees `App`), of the global namespace, of each `using`, and of each `global using` written in its directory or above it. An alias (`using M = App.Models;`) names a type or a namespace, `using static` uses the type it names, and `[Audited]` names the class `AuditedAttribute`.
- A partial type is declared by each of its files, and a use of it uses them all. When two projects declare a type of the same name, the one nearest to the file that names it is taken.
- Types of .NET and of NuGet packages declare no file of the repository: external. The implicit usings of the SDK bring nothing of the repository.
- An extension method (`this` before the first parameter, in a static class) is called on a value without naming its class. A call after a dot (`t.IsValueType()`) uses the file that declares an extension method of that name, taking as many arguments, in a namespace the caller sees. The receiver's type is not known: a call several files could answer is ambiguous and adds no edge, and an instance method that shares the name and the arity of a visible extension is taken for it. Private extension methods are left out.
- A field, a variable or a method that has a type's name is not told from it.

Ruby notes:

- `require_relative` resolves from the requiring file, and so does a path built from `__dir__` or `__FILE__` (`File.expand_path('../x', __FILE__)`, `File.join(__dir__, 'x')`). `require`, `load` and `autoload` look the path up under the `lib`, `test` and `spec` directories of the repository and the autoload roots of Rails (`app/*`, `app/*/concerns`), the nearest first; a path found nowhere is a gem or the standard library.
- Most Rails code has no `require`: a file uses the files that define the constants it names. Constants are always looked up, in any project, since once loaded a constant is global whatever loaded it (`require`, Zeitwerk, Bundler). A reference is looked up whole from the namespaces it is written in, innermost first (`Item` inside `module Shop` is `Shop::Item` before `Item`).
- Classes and modules nest by indentation, as formatted code has them. A module opened only to hold other definitions is a namespace, not a definition: `module Shop` around `class Cart` does not make every reference to `Shop` a use of that file. A constant assigned in a class or module (`VERSION = "1"`, `Point = Struct.new(:x)`) is a definition.
- A constant defined in several files (a reopened class): the file named after it as Zeitwerk names files (`Shop::LineItem` in `shop/line_item.rb`) is the definition. When none is, the nearest definitions to the reference count, all of them when they sit in one directory; spread over directories with none nearer, the reference is ambiguous and left out (`km impact` counts it). A constant no file defines is found by its path under the autoload roots.
- Shipping code never uses what a test file or a test directory defines; tests see both.
- The core classes of Ruby (`String`, `Hash`, `Object`…) are never a use, even when a file of the repository reopens them.
- Comments, strings, heredocs, regular expressions and `%` literals name nothing; the code a string interpolates does.
- Not seen: `const_get`, `send` and other metaprogramming; methods added by reopening a class in a file not named after it, when a reference resolves to the file named after the class; ERB and other templates; custom autoload paths (`config.autoload_paths`) and collapsed directories; request specs that reach a controller through its route.

Kaikai notes:

- `import a.b.c` names `a/b/c.kai` relative to a package root, not to the importing file. Each ancestor directory of the importing file is tried, nearest first, so run `km deps` on a directory that contains the package root.
- When no such file exists, `import a` can name a package directory `a/` that carries a `kai.toml`, which the compiler searches: the import depends on `a/a.kai`, or, when the package has no file of its name, on every `.kai` file directly inside it.
- An import that resolves to no analysed file is external and adds no edge.
- Each file is a module of its own. The files of a package do not share names: they import each other like any other module (`import store`, `import notes.store`), so their only edges are their imports, and a change to one reaches the files of its package that import it. Unlike Go, where the files of a package see each other without importing and an import reaches them all.

| Flag | Description |
|------|-------------|
| `--format {table,json,short,terse}` | Output format (default: table) |
| `--cycles-only` | Show only files that participate in a dependency cycle |
| `--sort-by METRIC` | Sort by `fan-out` (default) or `fan-in` |
| `--top N` | Rows of the table (default: 20); JSON lists every file unless `--top` is given |
| `--matrix` | Print the dependency structure matrix instead of the table |
| `--depth N` | Levels of directories the matrix shows expanded (default: 1) |
| `--focus DIR` | Expand this directory of the matrix, and the ones above it, alone |
| `--html FILE` | Write the matrix as an interactive HTML page to this file |

Example output:

```
Dependency Graph
────────────────────────────────────────────────────────────────────────
 File                 Language Fan-In Fan-Out Cycle
────────────────────────────────────────────────────────────────────────
 report_helpers.rs        Rust     26       1    no
 util.rs                  Rust     25       2   yes
 walk.rs                  Rust     24       1    no
────────────────────────────────────────────────────────────────────────

Dependency cycles: 14
  Cycle 1 (3 files):
    cogcom/analyzer.rs
    cogcom/detection.rs
    cogcom/report.rs
```

Dependency structure matrix:

`--matrix` shows which file depends on which as a dependency structure matrix (DSM), as IntelliJ IDEA draws it. Rows and columns are the same directories and files, in the same order; a column carries only the number of its row, so the matrix stays narrow. A cell counts the files of its column that use files of its row. A directory shown collapsed (`▸`) counts for every file under it; one shown expanded (`▾`) heads the rows of what it holds. The root is the deepest directory holding every file, and a directory that holds only another one is shown with it (`lib/core/`).

The children of each directory are ordered so that a sibling comes before the siblings it uses: in a layered system every mark falls below the diagonal. Siblings that use each other form a cycle and stay together, those that use more of it than it uses them first; the rest keep the order of their names. Only uses that load or compile order the rows: `type` and `deferred` ones, which make no cycle, are drawn dimmed.

A mark above the diagonal goes against the layering. The list under the matrix gives each one with the uses behind it, five at most, and why it is there: in a cycle between files (`!` after the count, red on a terminal), against the layering when only the directories form a cycle (yellow), or type-only or deferred (dimmed). There are no colours when the output is not a terminal or `NO_COLOR` is set.

`--depth N` expands the directories less than N levels below the root; `--focus DIR` expands that directory alone and the ones above it, with the path written as km shows it. `--cycles-only` keeps the files in cycles. `--top` does not apply to the matrix. With `--format json` it is given for tools and models: `rows` in their order (`number`, `path`, a directory ending in `/`, `level`), `groups` with the directories shown expanded, `cells` with `row`, `column`, `count`, `mark` (`cycle`, `layering`, `weak` or `plain`) and the `uses` behind each (`from`, `to`, `kind`, `cycle`), and `above_diagonal` as `[row, column]` pairs. A matrix wider than the terminal is not printed: a lower `--depth` or `--focus` narrows it.

`--html FILE` writes the matrix as one HTML file that needs nothing else, in light and dark themes. It opens as the text would show, and in it a directory expands and collapses with a click on its triangle (or all at once), a click on a name marks what it uses and what uses it in two colours, and a click on a cell lists the uses behind it. The headers stay in place when the matrix scrolls, a cell is shaded by its count, and a name shows its whole path on hover. The terminal width does not limit it.

```
$ km deps --matrix --focus shop/core
Dependency Structure Matrix
A cell counts the files of its column that use files of its row; ! marks a cycle.

                1  2  3  4  5
 1 main.py      ·
 2 ▸ billing/   1  ·
 3 ▸ web/       1  1  ·
   ▾ core/
 4   db.py            1  · 1!
 5   models.py     1  2 1!  ·

Above the diagonal: 1 cell
  shop/core/models.py → shop/core/db.py: 1, in a cycle
    shop/core/models.py → shop/core/db.py
```
