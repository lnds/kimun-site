---
title: "km loc"
description: "Count lines of code"
---

```bash
km loc [path]
```

Run on the current directory:

```bash
km loc
```

Run on a specific path:

```bash
km loc src/
```

Test files are left out by default, so the totals are lower than those of `cloc` on the same directory. With `--include-tests` both count the same files. Below the table, when there is more than one, come the lines of each [kind of file](/en/docs/dups#file-kinds): code, docs, infra and data (`kinds` in the JSON).

Options:

| Flag | Description |
|------|-------------|
| `-v`, `--verbose` | Show summary stats (files read, unique, ignored, elapsed time) |
| `--by-author` | Break down lines of code by git author (requires a git repository) |
| `--include-tests` | Count test files and directories too (left out by default) |
| `--format {table,json,short,terse}` | Output format (default: table) |

Example output:

```
────────────────────────────────────────────────────────────────────
 Language                Files        Blank      Comment         Code
────────────────────────────────────────────────────────────────────
 Rust                        5          120           45          850
 TOML                        1            2            0           15
────────────────────────────────────────────────────────────────────
 SUM:                        6          122           45          865
────────────────────────────────────────────────────────────────────
```
