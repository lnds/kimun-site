---
title: "km cogcom"
description: "Cognitive complexity"
---

Computes cognitive complexity per file and per function using the [SonarSource method](https://www.sonarsource.com/docs/CognitiveComplexity.pdf) (2017). Unlike cyclomatic complexity, cognitive complexity measures how difficult code is to *understand*, penalizing deeply nested structures and rewarding linear control flow.

```bash
km cogcom [path]
```

Options:

| Flag | Description |
|------|-------------|
| `--format {table,json,short,terse,github,codeclimate}` | Output format (default: table). `github` emits GitHub Actions annotations; `codeclimate` (alias: `gitlab`) emits CodeClimate JSON for GitLab Code Quality |
| `--include-tests` | Include tests, examples and benchmarks in analysis (excluded by default) |
| `--top N` | Rows of the table (default: 20); JSON lists every file unless `--top` is given |
| `--min-complexity N` | Skip files whose most complex function is below N; with `--per-function`, also hide functions below N (default: 1) |
| `--per-function` | Show per-function breakdown |
| `--sort-by METRIC` | Sort by `total`, `max`, or `avg` (default: `total`) |

In brace languages a function ends where its braces balance. A body introduced by `=` (`fn f(x) = expr`, as in Kaikai, Kotlin or Scala) has no closing brace of its own: it runs while its braces are open and the following lines are indented deeper than the declaration. `km cycom` finds functions the same way.

Keywords and braces are read in order along each line, so code written on one line scores as it does on several: `if (a) { return 1 } else { return 2 }` is 2, and `for (v of xs) { if (y) { return v } }` is 3. The block of a control keyword opens at the next `{`, on its line or, Allman style, on the next one; `else if` nests its block like `if` and `else`.

In Elixir, `with`, `unless` and `receive` are structural increments like `case`, and `and`, `or`, `&&` and `||` count as boolean sequences. For `km cycom`, each clause (`->`) of a `case`, `cond`, `receive` or multi-clause `fn` is a branch, as each `case` label of C, and `with`, `unless`, `and`, `or`, `&&` and `||` add one each.
