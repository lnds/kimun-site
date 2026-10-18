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
| `--include-tests` | Include tests, examples and benchmarks in analysis (excluded by default) |
| `--top N` | Rows of the table (default: 20); JSON lists every file unless `--top` is given |
| `--min-complexity N` | Skip files whose most complex function is below N; with `--per-function`, also hide functions below N (default: 1) |
| `--per-function` | Show per-function breakdown |

## How functions are found

`cycom`, `cogcom` and `smells` share one function detector. A declaration is recognised by the marker of its language (`fn`, `def`, `func`, `function`, `defmacro`) or, in the C family, by its shape, over the whole signature even when it spans several lines:

- parameters on several lines, the name alone on the line above them (GNU style), the `{` on the next line;
- a line that starts inside parentheses left open (the continuation of a condition, a parameter with an attribute) is never a declaration, nor is an annotation (`@Override`, `[HttpGet]`) or an anonymous class (`new Adapter() {`);
- preprocessor directives and the lines a trailing `\` joins to them are not code: they neither declare functions nor add complexity;
- Go methods are named without their receiver;
- in JavaScript and TypeScript, functions bound to a name (`res.send = function`, `const f = (x) => {`, `name: Type = <T>(x) => {`) take that name, a function passed as an argument is `<anonymous>`, and the braces of a regular expression literal are not blocks;
- in Elixir, the code inside a `quote` block is not part of the function that holds it, and the functions it declares are measured on their own.
