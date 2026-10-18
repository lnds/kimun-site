---
title: "km miv"
description: "Maintainability Index (verifysoft variant)"
---

Computes the [Maintainability Index](https://www.verifysoft.com/en_maintainability.html) per file. MI combines Halstead Volume, Cyclomatic Complexity, lines of code, and comment ratio into a single maintainability score.

This is the verifysoft.com variant, which includes a comment-weight term (MIcw) that rewards well-commented code.

```bash
km miv [path]
```

## Formula

```
MIwoc = 171 - 5.2 * ln(V) - 0.23 * G - 16.2 * ln(LOC)
MIcw  = 50 * sin(sqrt(2.46 * radians(PerCM)))
MI    = MIwoc + MIcw
```

Where V = Halstead Volume, G = cyclomatic complexity, LOC = code lines, PerCM = comment percentage (converted to radians).

The scale has no lower bound, as verifysoft defines it. The index is computed once per file, and both logarithmic terms grow with the file's size, so a long file of trivial functions can fall below zero while a short file with one tangled function stays moderate; the `Total` row averages the files. For a scale clamped to 0–100 use `km mi`; to find tangled functions, `km cogcom`.

## Thresholds

| MI Score | Level | Meaning |
|----------|-------|---------|
| 85+ | good | Easy to maintain |
| 65–84 | moderate | Reasonable maintainability |
| <65 | difficult | Hard to maintain |

Options:

| Flag | Description |
|------|-------------|
| `--format {table,json,short,terse}` | Output format (default: table) |
| `--include-tests` | Include tests, examples and benchmarks in analysis (excluded by default) |
| `--top N` | Rows of the table (default: 20); JSON lists every file unless `--top` is given |
| `--sort-by METRIC` | Sort by `mi` (ascending), `volume`, `complexity`, or `loc` (default: `mi`) |

Example output:

```
Maintainability Index
────────────────────────────────────────────────────────────────────────────────
 File                       Volume Cyclo   LOC  Cmt%   MIwoc      MI  Level
────────────────────────────────────────────────────────────────────────────────
 src/loc/counter.rs        32101.6   115   731   3.6   -16.2     2.8  difficult
 src/main.rs                8686.7    14   204  14.6    34.5    68.2  moderate
 src/util.rs                2816.9    18    76   9.5    55.4    84.7  moderate
────────────────────────────────────────────────────────────────────────────────
 Total (3 files)                         1011                  22.2
```

The verifysoft MI has no lower bound: a large file can be far below 0 (ripgrep `defs.rs` is −206), and it weighs size more than complexity. That is the definition of the variant; `km mi` is the one bounded to 0–100. The Total row is weighted by code lines with values below 0 taken as 0, as in `km mi`.
