---
title: "Supported languages"
description: "The languages Kimün recognizes and how it counts each file."
---

| Language | Extensions / Filenames |
|---|---|
| Bourne Again Shell | `.bash` |
| Bourne Shell | `.sh` |
| C | `.c`, `.h` |
| C# | `.cs` |
| C++ | `.cpp`, `.cxx`, `.cc`, `.hpp`, `.hxx`, `.hh` |
| Clojure | `.clj`, `.cljs`, `.cljc`, `.edn` |
| CMake | `.cmake`, `CMakeLists.txt` |
| CSS | `.css` |
| Dart | `.dart` |
| Dockerfile | `Dockerfile` |
| DOS Batch | `.bat`, `.cmd` |
| Elixir | `.ex` |
| EEx | `.eex` |
| Elixir Script | `.exs` |
| Erlang | `.erl`, `.hrl` |
| F# | `.fs`, `.fsi`, `.fsx` |
| Fortran 77 | `.f`, `.for`, `.ftn`, `.f77`, `.pfo` (and upper case) |
| Fortran 90 | `.f90`, `.F90` |
| Fortran 95 | `.f95`, `.F95` |
| Fortran 2003 | `.f03`, `.F03` |
| Fortran 2008 | `.f08`, `.F08` |
| Go | `.go` |
| Gradle | `.gradle` |
| Groovy | `.groovy` |
| Haskell | `.hs` |
| HTML | `.html`, `.htm` |
| HTML EEx | `.heex` |
| Java | `.java` |
| JavaScript | `.js`, `.mjs`, `.cjs` |
| jq | `.jq` |
| JSON | `.json` |
| JSX | `.jsx` |
| Julia | `.jl` |
| Kaikai | `.kai` |
| Kotlin | `.kt`, `.kts` |
| lex | `.l`, `.lex` |
| Lua | `.lua` |
| Makefile | `.mk`, `Makefile`, `makefile`, `GNUmakefile` |
| Markdown | `.md`, `.markdown` |
| Nim | `.nim` |
| Objective-C | `.m`, `.mm` |
| OCaml | `.ml`, `.mli` |
| Pascal | `.pas`, `.dpr`, `.dpk`, `.lpr`, `.pp`, `.pascal` |
| Perl | `.pl`, `.pm` |
| PHP | `.php` |
| Properties | `.properties` |
| Python | `.py`, `.pyi` |
| R | `.r`, `.R` |
| reStructuredText | `.rst`, `.rest` |
| Ruby | `.rb`, `Rakefile`, `Gemfile` |
| Rust | `.rs` |
| Scala | `.scala`, `.sc`, `.sbt` |
| SQL | `.sql` |
| Swift | `.swift` |
| Terraform | `.tf` |
| Text | `.txt` |
| TOML | `.toml` |
| TypeScript | `.ts`, `.tsx`, `.mts`, `.cts` |
| yacc | `.y`, `.yacc` |
| XML | `.xml`, `.xsl`, `.xslt`, `.svg`, `.fsproj`, `.csproj`, `.vbproj`, `.vcxproj`, `.sln`, `.plist`, `.xaml` |
| YAML | `.yaml`, `.yml` |
| Zig | `.zig` |
| Zsh | `.zsh` |

## Language-specific notes

- **Kaikai** — `#[...]` opens an attribute, not a `#` comment, so attributes count
  as code. Documentation attributes (`#[doc("...")]`, including the multi-line
  `#[doc("""...""")]` form) count as comments and are excluded from the
  complexity, Halstead, and smell analyses.
- **Elixir** — the heredocs of `@moduledoc` and `@doc` (`"""`, `'''`, and the
  `~S"""` and `~s"""` sigils) count as comments, as cloc counts them, and are
  excluded from the complexity, Halstead, and smell analyses. A one-line
  `@doc "..."` and any other heredoc count as code.
- **Python** — a triple-quoted string, a docstring above all, counts as comment,
  as cloc counts it: its lines are comment unless code shares them
  (`SQL = """` is code, the lines after it are comment).
- **C and C++ headers** — a `.h` is C++ when its text says so (a line opening
  with `namespace`, `template`, `class`, an access specifier, `using`,
  `constexpr`, or any `std::`), and C otherwise. cloc reports every header as
  `C/C++ Header`; kimun keeps them with the language that analyzes them.
- **reStructuredText** — a line opening with `..` (a directive or a comment)
  counts as comment; cloc also counts as comment the lines indented under it.
- **HTML EEx** — `<%!-- --%>` and lines opening with `<% #` are comments, as
  cloc counts them. **EEx** — `<%# %>` is a comment.
- **Fortran** — free form (`.f90` and later) comments with `!`; fixed form
  (`.f`, `.for`, `.f77`) also makes a comment of a line with `C`, `c` or `*` in
  its first column. OpenMP and OpenACC directives (`!$omp`, `C$OMP`, `!$acc`)
  and conditional compilation (`!$ `) count as code, as the directives they
  are; cloc counts them as comments, and in free form it also takes a line that
  starts with `c` in the first column (`contains`, `call`) for a comment. A
  backslash escapes nothing in a string. Fortran ignores case, and so do the
  complexity, Halstead and smell analyses, while the reports name functions as
  they are written. Functions are the program units (`subroutine`,
  `function`, `program`) to the `end` that closes them, the units they contain
  included; those of an `interface` block declare no function. Cognitive
  nesting is read from the constructs (`if … then`, `do`, `select`, `where`)
  and the `end` of each, not from indentation, which fixed form lacks.
- **Pascal (Delphi, Free Pascal)** — three kinds of comment: `//`,
  `{ … }` and `(* … *)`, the last two closed only by their own delimiter.
  `{$…}` is a compiler directive and counts as code. Strings are
  single-quoted, with no backslash escapes; a delimiter inside one opens no
  comment (cloc does not tell them apart, so it often counts code as comment
  after a `'{'` or a `COUNT(*)`). Pascal ignores case, as Fortran does.
  Functions are the routines of the implementation (`procedure`, `function`,
  `constructor`, `destructor`, `operator`, class methods), from their header to
  the `end` of their block, local routines included; the declarations of the
  `interface` section and of class types, and `forward` or `external` ones,
  have none. Headers repeated under conditional compilation are one routine.
  Cognitive nesting is read from indentation, two columns a level.
- **Interior lines of multi-line strings** (Kaikai triple-quoted literals,
  Elixir heredocs) count as code for `km loc`, but are excluded from
  cyclomatic, cognitive, Halstead, and smell analyses: prose and embedded data
  are not control flow.
- **Rust raw strings** (`r"..."`, `r#"..."#` and the forms with more `#`, with a
  `b` or `c` prefix too) end only at a quote followed by as many `#` as opened
  them, and span lines. What they hold counts as code for `km loc`, whatever it
  looks like, and is left out of the cyclomatic, cognitive, Halstead, and smell
  analyses.


## Features

- Respects `.gitignore` rules automatically
- Deduplicates files by content hash (identical files counted once)
- Detects languages by file extension, filename, or shebang line
- Supports nested block comments (Rust, Haskell, OCaml, etc.)
- Handles pragmas (e.g., Haskell `{-# LANGUAGE ... #-}`) as code
- Mixed lines (code + comment) are counted as code, matching `cloc` behavior
- Reads sources in any 8-bit encoding (Latin-1, Windows-1252) whole: bytes that are not UTF-8 are replaced, not taken for the end of the file
