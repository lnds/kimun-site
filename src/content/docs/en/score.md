---
title: "km score"
description: "Code health score"
---

Computes an overall code health score for the project, grading it from A++ (exceptional) to F-- (severe issues). Uses only static metrics (no git required).

There are two scoring models: `cogcom`, the default, built on Cognitive Complexity (5 dimensions), and `legacy`, built on the Maintainability Index and Cyclomatic Complexity (6 dimensions).

Non-code files (Markdown, TOML, JSON, etc.) are automatically excluded. Inline test blocks (`#[cfg(test)]`) are excluded from every dimension, see [Inline tests](/en/docs/dups#inline-tests).

```bash
km score [path]
km score --model legacy [path]    # MI + cyclomatic model
```

## Dimensions and weights (default: cogcom)

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Cognitive Complexity | 30% | SonarSource method, penalizes nesting |
| Duplication | 20% | Project-wide duplicate code % |
| Indentation Complexity | 15% | Stddev of indentation depth |
| Halstead Effort | 20% | Mental effort per LOC |
| File Size | 15% | Optimal range 50-300 LOC |

## Dimensions and weights (--model legacy)

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Maintainability Index | 30% | Verifysoft MI, normalized to 0-100 |
| Cyclomatic Complexity | 20% | Max complexity per file |
| Duplication | 15% | Project-wide duplicate code % |
| Indentation Complexity | 15% | Stddev of indentation depth |
| Halstead Effort | 15% | Mental effort per LOC |
| File Size | 5% | Optimal range 50-300 LOC |

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
| `--model MODEL` | Scoring model: `cogcom` (default) or `legacy` (MI + cyclomatic) |
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
 Project Score:  A (91.7)
 Files Analyzed: 141
 Total LOC:      19,075
──────────────────────────────────────────────────────────────────
 Dimension                 Weight   Score   Grade
──────────────────────────────────────────────────────────────────
 Cognitive Complexity         30%    84.2   B+
 Duplication                  20%   100.0   A++
 Indentation Complexity       15%    93.1   A+
 Halstead Effort              20%    87.5   A-
 File Size                    15%   100.0   A++
──────────────────────────────────────────────────────────────────

 Files Needing Attention (worst per-file scores, excl. duplication)
──────────────────────────────────────────────────────────────────
 Score  Grade  File                       Issues
──────────────────────────────────────────────────────────────────
  60.7  D      ./src/deps/analyzer.rs     Cognitive: 36
  63.8  D+     ./src/cogcom/analyzer.rs   Cognitive: 35
  72.4  C      ./src/smells/rules.rs      Cognitive: 20
  73.7  C+     ./src/hal/tokenizer.rs     Cognitive: 22
  73.8  C+     ./src/loc/mod.rs           Cognitive: 19
  74.8  C+     ./src/knowledge/mod.rs     Cognitive: 21
  75.6  C+     ./src/dups/mod.rs          Cognitive: 19
  77.4  B-     ./src/test_blocks.rs       Cognitive: 17
  78.2  B-     ./src/cli_help.rs          Cognitive: 16
  78.9  B-     ./src/walk.rs              Cognitive: 16
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
| `--model MODEL` | Scoring model: `cogcom` (default) or `legacy` |
| `--format {table,json,short,terse}` | Output format (default: table) |
| `--bottom N` | Number of worst files to show (default: 10) |
| `--min-lines N` | Minimum lines for a duplicate block (default: 6) |
