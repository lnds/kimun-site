---
title: "km hotspots"
description: "Hotspot analysis"
---

Finds hotspots: files that change frequently AND have high complexity. Based on Adam Tornhill's method ("Your Code as a Crime Scene").

```bash
km hotspots [path]
```

## Formula

```
Score = Commits × Complexity
```

Files with high scores concentrate risk — they are both change-prone and complex, making them the highest-value refactoring targets.

By default, complexity is measured by **total indentation** (sum of logical indentation levels across all code lines), following Tornhill's original method from "Your Code as a Crime Scene". Use `--complexity cycom` for cyclomatic complexity instead, or `--complexity cogcom` for cognitive complexity. Documents (`--kind docs`) are measured by their lines of text whatever the metric, since indentation and branches say nothing about prose: `km hotspots --kind docs` finds the long documents rewritten most often, such as an agent instruction file that grows every week. Infrastructure keeps the metric asked for, as the indentation of YAML and HCL is its structure.

Requires a git repository. Merge commits are excluded from the count.

Options:

| Flag | Description |
|------|-------------|
| `--format {table,json,short,terse}` | Output format (default: table) |
| `--include-tests` | Include tests, examples and benchmarks in analysis (excluded by default) |
| `--top N` | Rows of the table (default: 20); JSON lists every file unless `--top` is given |
| `--sort-by METRIC` | Sort by `score`, `commits`, or `complexity` (default: `score`) |
| `--since DURATION` | Only consider commits since this time (e.g. `30d`, `6m`, `1y`) |
| `--complexity METRIC` | `indent` (default, Tornhill), `cycom` (cyclomatic) or `cogcom` (cognitive); documents are measured by lines |

Duration units: `d` (days), `m` (months, approx. 30 days), `y` (years, approx. 365 days).

Example output (default — indentation complexity):

```
Hotspots (Commits × Total Indent Complexity)
──────────────────────────────────────────────────────────────────────────────
 File                    Language Commits Total Indent      Score
──────────────────────────────────────────────────────────────────────────────
 src/main.rs                 Rust      18        613      11034
 src/loc/counter.rs          Rust       7       1490      10430
 src/dups/detector.rs        Rust       7       1288       9016
 src/dups/mod.rs             Rust       9        603       5427
 src/report/mod.rs           Rust       4        998       3992
──────────────────────────────────────────────────────────────────────────────

Score = Commits × Total Indentation (Tornhill method).
High-score files are change-prone and complex — prime refactoring targets.
```

Example output (`--complexity cycom`):

```
Hotspots (Commits × Cyclomatic Complexity)
──────────────────────────────────────────────────────────────────────────────
 File                     Language Commits Cyclomatic      Score
──────────────────────────────────────────────────────────────────────────────
 src/loc/counter.rs           Rust       7        115        805
 src/dups/mod.rs              Rust       9         44        396
 src/main.rs                  Rust      18         21        378
 src/cycom/analyzer.rs        Rust       4         92        368
 src/dups/detector.rs         Rust       7         46        322
──────────────────────────────────────────────────────────────────────────────

Score = Commits × Cyclomatic Complexity.
High-score files are change-prone and complex — prime refactoring targets.
```
