---
title: "km indent"
description: "Indentation complexity"
---

Measures indentation-based complexity per file: standard deviation of indentation depths and maximum depth. Higher stddev suggests more complex control flow.

```bash
km indent [path]
```

Depth is read as structure, not layout. A line that continues a statement is at most one level deeper than the line it continues: arguments aligned under an opening parenthesis, a line after one ending in `::`, `&&`, `||`, `|>`, `|` or `\`, and a line starting with `.`, `|`, `&&` or `||`. Inside a block opened within parentheses (the body of a closure or of an Elixir `fn`), depths count again from that block. A file with fewer than 10 code lines is not graded (`-`): the spread of a handful of lines means nothing. Data and prose files are left out.

Options:

| Flag | Description |
|------|-------------|
| `--format {table,json,short,terse}` | Output format (default: table) |
| `--include-tests` | Include tests, examples and benchmarks in analysis (excluded by default) |
