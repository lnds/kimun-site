---
title: "km smells"
description: "Code smell detection"
---

Detects common code quality issues per file using text-based heuristics (no AST required). Only languages with complexity marker support are analyzed (same set as `km cycom`: Rust, Python, JS/TS, C/C++, Go, etc.).

```bash
km smells [path]
```

## Smell types

| Smell | Description |
|-------|-------------|
| `long_function` | Function body exceeds `--max-lines` (default: 50) |
| `long_params` | Function has more than `--max-params` parameters (default: 4) |
| `todo_debt` | TODO, FIXME, HACK, XXX, or BUG in comment lines |
| `magic_number` | Bare numeric literals in code, other than 0, 1, 2, -1 and values that already have a name |
| `commented_code` | Two or more consecutive comment lines containing code-like patterns, outside documentation |

- **`long_params`** counts the parameters of the list that follows the function's name (a Go receiver, or the call a function expression is passed to, is not it), separated by its top-level commas: commas inside type arguments (`Node<K, V>`), patterns (`%{...}`, `<<...>>`), literals and nested calls separate nothing.
- **`magic_number`** leaves out declarations, with any modifiers before the keyword (`private static final`, `public const`), assignments to upper-case names (`MAX_RETRIES = 5`), and the data a declaration opens: the members of an `enum`, a Go `const (...)` block, the elements of a table, the alternatives of a `type` union. A literal that is the value of a key (`connect: 3`, `"MAX": 4093`) or a parameter default is named too. The body of a function declared with such a keyword (`export function`, `static int f() {`) is still read.
- **`commented_code`** leaves out documentation, where code is an example: `///` and `//!` lines, `/** */` and `/*! */` blocks (JSDoc, Javadoc, Rust doctests, C# XML doc), and a Go doc comment with a tab-indented example right above a declaration.

Options:

| Flag | Description |
|------|-------------|
| `--top N` | Rows of the table (default: 20); JSON lists every file unless `--top` is given |
| `--max-lines N` | Maximum function body lines before flagging (default: 50) |
| `--max-params N` | Maximum parameter count before flagging (default: 4) |
| `--files FILE` | Analyze only these specific files (repeatable). Useful for scripting |
| `--since-ref REF` | Analyze only files changed since this git ref (e.g. `origin/main`, `HEAD~1`). Ideal for CI |
| `--format {table,json,short,terse,github,codeclimate}` | Output format (default: table). `github` emits GitHub Actions annotations; `codeclimate` (alias: `gitlab`) emits CodeClimate JSON for GitLab Code Quality |

The table breaks each file's smell count down by type, with one column per smell kind (`magic`, `long`, `param`, `todo`, `comm`) and a per-column total in the footer.

Example output:

```
Code Smells
──────────────────────────────────────────────────────────────────────
 File                            Total  magic  long  param  todo  comm
──────────────────────────────────────────────────────────────────────
 src/loc/counter.rs                 12      7     1      0     4     0
 src/main.rs                         6      2     0      0     4     0
 src/dups/detector.rs                3      0     2      1     0     0
──────────────────────────────────────────────────────────────────────
 Total (3 files)                    21      9     3      1     8     0
```
