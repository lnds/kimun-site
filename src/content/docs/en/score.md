---
title: "km score"
description: "Code health score"
---

Computes an overall code health score for the project, grading it from A++ (exceptional) to F-- (severe issues). Uses only static metrics (no git required).

There are three scoring models: `cogcom`, the default, built on Cognitive Complexity (5 dimensions); `cogcom-0.35`, the same dimensions with the weights it had up to v0.35; and `legacy`, built on the Maintainability Index and Cyclomatic Complexity (6 dimensions).

Non-code files (Markdown, TOML, JSON, etc.) are automatically excluded. Inline test blocks (`#[cfg(test)]`) are excluded from every dimension, see [Inline tests](/en/docs/dups#inline-tests).

```bash
km score [path]
km score --model legacy [path]    # MI + cyclomatic model
km score --model cogcom-0.35 [path]  # the weights up to v0.35
```

## Dimensions and weights (default: cogcom)

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Cognitive Complexity | 32% | SonarSource method, penalizes nesting |
| Duplication | 21% | Project-wide duplicate code % |
| Indentation Complexity | 16% | Stddev of indentation depth |
| Halstead Effort | 21% | Mental effort per LOC |
| File Size | 10% | Full score up to 500 LOC, falling to 0 at 4,000 |

Up to v0.35 File Size weighed 15%, and the others 30%, 20%, 15% and 20%. It weighs less now because size already drives the other dimensions: a large file has more code to be complex, and the project score is a mean weighted by lines of code. Studies of modules find that defects grow less than proportionally with size, so splitting a file does not by itself make it less fault-prone; what size measures well is the cost of reading and changing it. The five points went to the other dimensions in proportion to their weights. `--model cogcom-0.35` scores with the former weights, to compare with earlier results or to keep a CI gate where it was.

## Dimensions and weights (--model legacy)

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Maintainability Index | 30% | Verifysoft MI, normalized to 0-100 |
| Cyclomatic Complexity | 20% | Max complexity per file |
| Duplication | 15% | Project-wide duplicate code % |
| Indentation Complexity | 15% | Stddev of indentation depth |
| Halstead Effort | 15% | Mental effort per LOC |
| File Size | 5% | Full score up to 500 LOC, falling to 0 at 4,000 |

Each dimension is aggregated as a LOC-weighted mean across all files (except Duplication which is a single project-level value). The project score is the weighted sum of all dimension scores.

## Grade scale

| Grade | Score range | Grade | Score range |
|-------|------------|-------|------------|
| A++ | 97-100 | C+ | 73-76 |
| A+ | 93-96 | C | 70-72 |
| A | 90-92 | C- | 67-69 |
| A- | 87-89 | D+ | 63-66 |
| B+ | 83-86 | D | 60-62 |
| B | 80-82 | D- | 57-59 |
| B- | 77-79 | F | 50-56 |
| | | F- | 40-49 |
| | | F-- | 0-39 |

Options:

| Flag | Description |
|------|-------------|
| `--model MODEL` | Scoring model: `cogcom` (default), `cogcom-0.35` (the weights up to v0.35) or `legacy` (MI + cyclomatic) |
| `--trend [REF]` | Compare current score against a git ref (default: `HEAD`). Shows change: `B- → B (+2.3)`. Useful for PR review: `--trend origin/main` |
| `--fail-if-worse` | With `--trend`: exit with code 1 if the score dropped by more than `--gate-tolerance` |
| `--gate-tolerance POINTS` | Score drop `--fail-if-worse` allows before failing (default: `0.01` with `--gate-scope project`, `0.5` with `--gate-scope changed`). Compares unrounded scores |
| `--gate-scope {project,changed}` | What `--fail-if-worse` compares (default: `project`, the aggregate score). `changed` looks only at the files the diff touches: it fails if a modified or renamed file ends below the project score at the ref after dropping more than `--gate-tolerance`, or if the project's duplicated lines grow. Files above the project score, new files and deleted files never fail it, so removing healthy code cannot lower the verdict. The report lists every changed file with its before/after score |
| `--fail-below GRADE` | With `--trend`: exit with code 1 if the score is below `GRADE` (e.g. `B-`). Overridable via `.kimun.toml` |
| `--format {table,json,short,terse}` | Output format (default: table) |
| `--include-tests` | Include test files in analysis (excluded by default) |
| `--bottom N` | Number of worst files to show in "needs attention" (default: 10) |
| `--min-lines N` | Minimum lines for a duplicate block (default: 6) |

Example output:

```
Code Health Score
──────────────────────────────────────────────────────────────────
 Project Score:  A (91.2)
 Files Analyzed: 142
 Total LOC:      19,084
──────────────────────────────────────────────────────────────────
 Dimension                 Weight   Score   Grade
──────────────────────────────────────────────────────────────────
 Cognitive Complexity         32%    84.1   B+
 Duplication                  21%   100.0   A++
 Indentation Complexity       16%    93.2   A+
 Halstead Effort              21%    87.5   A-
 File Size                    10%   100.0   A++
──────────────────────────────────────────────────────────────────

 Files Needing Attention (worst per-file scores, excl. duplication)
──────────────────────────────────────────────────────────────────
 Score  Grade  File                       Issues
──────────────────────────────────────────────────────────────────
  57.7  D-     ./src/deps/analyzer.rs     Cognitive: 36
  61.0  D      ./src/cogcom/analyzer.rs   Cognitive: 35
  70.3  C      ./src/smells/rules.rs      Cognitive: 20
  71.6  C      ./src/hal/tokenizer.rs     Cognitive: 22
  71.8  C      ./src/loc/mod.rs           Cognitive: 19
  72.8  C      ./src/knowledge/mod.rs     Cognitive: 21
  73.8  C+     ./src/dups/mod.rs          Cognitive: 19
  75.0  C+     ./src/cli_help.rs          Cognitive: 17
  75.6  C+     ./src/test_blocks.rs       Cognitive: 17
  77.3  B-     ./src/walk.rs              Cognitive: 16
──────────────────────────────────────────────────────────────────
```

## `km score diff` — Compare score against a git ref

Extracts the file tree at the given ref, computes the score for both snapshots, and shows a delta table per dimension. Useful for reviewing how commits impact code quality.

```bash
km score diff                          # compare vs HEAD (uncommitted changes)
km score diff --git-ref HEAD~1         # compare vs previous commit
km score diff --git-ref main           # compare vs main branch
km score diff --format json            # machine-readable output
```

Options:

| Flag | Description |
|------|-------------|
| `--git-ref REF` | Git ref to compare against (default: `HEAD`) |
| `--model MODEL` | Scoring model: `cogcom` (default), `cogcom-0.35` or `legacy` |
| `--format {table,json,short,terse}` | Output format (default: table) |
| `--bottom N` | Number of worst files to show (default: 10) |
| `--min-lines N` | Minimum lines for a duplicate block (default: 6) |
