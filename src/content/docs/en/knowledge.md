---
title: "km knowledge"
description: "Code ownership analysis"
---

Analyzes code ownership patterns via git blame (knowledge maps). Based on Adam Tornhill's method ("Your Code as a Crime Scene" chapters 8-9).

```bash
km knowledge [path]
```

Identifies bus factor risk and knowledge concentration per file. Generated files (lock files, minified JS, files that say they are generated, see [Generated files, data and prose](/en/docs/dups#generated-files-data-and-prose)) are automatically excluded.

## Risk levels

| Risk | Condition | Meaning |
|------|-----------|---------|
| CRITICAL | 1 person owns >80% | High bus factor risk |
| HIGH | 1 person owns 60-80% | Significant concentration |
| MEDIUM | 2-3 people own >80% combined | Moderate concentration |
| LOW | Well-distributed | Healthy ownership |

## Knowledge loss detection

Use `--since` to define "recent activity". If the primary owner of a file has no commits in that period, the file is flagged with **knowledge loss** risk; when nobody committed in the period, every file is. Use `--risk-only` to show only those files; it needs `--since`. The closing count is of every file at risk, with how many `--top` shows.

Bot accounts (`dependabot[bot]`, `github-actions[bot]`) hold no knowledge: their lines are left out, and a file only bots wrote is not listed. Generated files and data or prose (JSON, YAML, Markdown, text) are left out too.

## Who wrote each line

Ownership comes from blame of the file as committed at `HEAD`. When the `git` program is installed, kimun runs `git blame -w -M -C`: a change of whitespace keeps the author of the line, and so does code moved within a file or from another file the same commit changed. Revisions listed in `.git-blame-ignore-revs` (or in the file `blame.ignoreRevsFile` names) are skipped, so a mass reformat does not take the lines. Without `git`, libgit2 blames the file: it skips whitespace changes but neither follows moved code nor ignores revisions. `km authors` and `km loc --by-author` read blame the same way.

Options:

| Flag | Description |
|------|-------------|
| `--format {table,json,short,terse}` | Output format (default: table) |
| `--include-tests` | Include tests, examples and benchmarks in analysis (excluded by default) |
| `--top N` | Rows of the table (default: 20); JSON lists every file unless `--top` is given |
| `--sort-by METRIC` | Sort by `concentration`, `diffusion`, or `risk` (default: `concentration`) |
| `--since DURATION` | Define recent activity window for knowledge loss (e.g. `6m`, `1y`, `30d`) |
| `--risk-only` | Show only files with knowledge loss risk |
| `--summary` | Aggregate by author: files owned, lines, languages, worst risk |
| `--bus-factor` | Show the project bus factor: how many contributors have to leave before most of the code has no author left |
| `--bus-factor-threshold PCT` | Share of the code, in lines, the bus factor counts to (default: 50) |
| `--author NAME` | Show only files owned by this author (case-insensitive substring match) |

Example output:

```
Knowledge Map — Code Ownership
──────────────────────────────────────────────────────────────────────────────
 File                       Language  Lines  Owner         Own%  Contrib  Risk
──────────────────────────────────────────────────────────────────────────────
 src/loc/counter.rs             Rust    731  E. Diaz        94%        2  CRITICAL
 src/main.rs                    Rust    241  E. Diaz        78%        3  HIGH
 src/walk.rs                    Rust    145  E. Diaz        55%        5  MEDIUM
──────────────────────────────────────────────────────────────────────────────

Files with knowledge loss risk (primary owner inactive): 1
  src/legacy.rs (Former Dev)
```

Use `--bus-factor` to compute how many contributors have to leave before most of the code has nobody who wrote it (the *truck factor* of Avelino et al., "A novel approach for estimating truck factors", ICPC 2016):

- The **authors of a file** are those blame gives at least 75% of the lines of its main author. A contributor with a few lines in a file is not one of its authors.
- Contributors leave one at a time, first the one who is an author of the most lines, until more than 50% of the code is in files with no author left. The bus factor is how many left. Files weigh by their lines, so a one-line file does not count as much as the core of the project, and a long tail of occasional contributors does not raise the number.
- With `--since`, authors with no commits in that window have already left: the code only they wrote is orphaned before anyone is counted. When that is already more than the threshold, the bus factor is 0.
- People are told apart by email, read through `.mailmap`, so one address under several names, or several addresses the mailmap joins, is one person. This also holds for `--summary`, `km authors` and `km loc --by-author`.

```
$ km knowledge --bus-factor --since 1y
Project Bus Factor: 2

 12% of the code is already in files whose authors have not committed in 1y.
 If these 2 contributors leave, 71% of the code is in files with no author left.
 Risk: HIGH — two people hold critical knowledge
 Authors of a file hold at least 75% of the lines of its main author; files weigh by lines; threshold 50%.

──────────────────────────────────────────────────────────────────────
 Rank  Author                Files     Lines    Share  Orphaned
──────────────────────────────────────────────────────────────────────
    1  E. Diaz                  41      8420   68.12%     48.3%
    2  A. Torres                 9      1490   12.06%     71.0%
    3  R. Soto                   6       940    7.61%
    4  M. Rojas (inactive)       3       610    4.94%
──────────────────────────────────────────────────────────────────────
```

`Orphaned` is the share of the code left with no author once that contributor and those above have left.
