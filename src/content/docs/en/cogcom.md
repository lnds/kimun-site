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
| `--include-tests` | Include test files in analysis (excluded by default) |
| `--top N` | Show only the top N files (default: 20) |
| `--min-complexity N` | Skip files whose most complex function is below N; with `--per-function`, also hide functions below N (default: 1) |
| `--per-function` | Show per-function breakdown |
| `--sort-by METRIC` | Sort by `total`, `max`, or `avg` (default: `total`) |

In brace languages a function ends where its braces balance. A body introduced by `=` (`fn f(x) = expr`, as in Kaikai, Kotlin or Scala) has no closing brace of its own: it runs while its braces are open and the following lines are indented deeper than the declaration. `km cycom` finds functions the same way.
