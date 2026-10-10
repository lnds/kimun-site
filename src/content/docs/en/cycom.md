---
title: "km cycom"
description: "Cyclomatic complexity"
---

Computes cyclomatic complexity per file and per function by counting decision points (`if`, `for`, `while`, `match`, `&&`, `||`, etc.).

```bash
km cycom [path]
```

Options:

| Flag | Description |
|------|-------------|
| `--format {table,json,short,terse,github,codeclimate}` | Output format (default: table). `github` emits GitHub Actions annotations; `codeclimate` (alias: `gitlab`) emits CodeClimate JSON for GitLab Code Quality |
| `--include-tests` | Include test files in analysis (excluded by default) |
| `--top N` | Show only the top N files (default: 20) |
| `--min-complexity N` | Skip files whose most complex function is below N; with `--per-function`, also hide functions below N (default: 1) |
| `--per-function` | Show per-function breakdown |
