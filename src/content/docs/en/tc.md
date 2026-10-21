---
title: "km tc"
description: "Temporal coupling analysis"
---

Analyzes temporal coupling between files via git history. Based on Adam Tornhill's method ("Your Code as a Crime Scene" ch. 7): files that frequently change together in the same commits have implicit coupling, even without direct imports.

```bash
km tc [path]
```

## Formula

```
Coupling strength = shared_commits / min(commits_a, commits_b)
```

## Coupling levels

| Strength | Level | Meaning |
|----------|-------|---------|
| >= 0.5 | STRONG | Files change together most of the time |
| 0.3-0.5 | MODERATE | Noticeable co-change pattern |
| < 0.3 | WEAK | Occasional co-changes |

High coupling between unrelated modules suggests hidden dependencies or architectural issues — consider extracting shared abstractions.

Options:

| Flag | Description |
|------|-------------|
| `--format {table,json,short,terse}` | Output format (default: table) |
| `--top N` | Rows of the table (default: 20); JSON lists every pair unless `--top` is given |
| `--sort-by METRIC` | Sort by `strength` or `shared` (default: `strength`) |
| `--since DURATION` | Only consider commits since this time (e.g. `6m`, `1y`, `30d`) |
| `--min-degree N` | Minimum commits per file to be included (default: 3) |
| `--min-shared N` | Minimum commits two files must share to be a pair (default: 3) |
| `--max-changeset N` | Ignore commits touching more than N files as evidence of coupling (default: 30) |
| `--min-strength F` | Minimum coupling strength to show (e.g. `0.5` for strong only) |
| `--across` | Only pairs of files of different kinds: code with documentation, code with infrastructure. Reads every kind but data unless `--kind` says which |
| `--include-ext`, `--exclude-ext`, `--exclude-dir`, `--exclude` | Path filters, applied to the paths of history |

Only files that still exist in the working tree are paired, and only code: lock files, manifests, CI YAML and documentation are left out. A sweeping commit (more than `--max-changeset` files) relates files by accident and is skipped, as is a revert together with the commit it reverts (a message opening with `Revert "` that names the commit): together they changed nothing. Renames are not followed: a file is paired under the path it has now.

Example output:

```
Temporal Coupling — Files That Change Together
──────────────────────────────────────────────────────────────────────────────────
 File A                     File B                     Shared  Strength  Level
──────────────────────────────────────────────────────────────────────────────────
 src/auth/jwt.rs            src/auth/middleware.rs          12      0.86  STRONG
 lib/parser.rs              lib/validator.rs                 8      0.53  STRONG
 config/db.yaml             config/cache.yaml                6      0.35  MODERATE
──────────────────────────────────────────────────────────────────────────────────

12 coupled pairs found (3 shown). Showing pairs with >= 3 shared commits.
Strong coupling (>= 0.5) suggests hidden dependencies — consider extracting shared abstractions.
```

**Note:** File renames are not tracked across git history. Renamed files appear as separate entries.
