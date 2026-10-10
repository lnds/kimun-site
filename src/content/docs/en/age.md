---
title: "km age"
description: "File age analysis"
---

Classifies source files as **Active**, **Stale**, or **Frozen** based on how long ago they were last modified in git history. Helps identify neglected or abandoned code.

```bash
km age [path]
```

## Status classification

| Status | Condition | Meaning |
|--------|-----------|---------|
| ACTIVE | Modified within `--active-days` days (default: 90) | Regularly touched |
| STALE | Between `--active-days` and `--frozen-days` (default: 365) | Neglected |
| FROZEN | Not modified for more than `--frozen-days` days | Potentially abandoned |

Options:

| Flag | Description |
|------|-------------|
| `--active-days N` | Days threshold for Active status (default: 90) |
| `--frozen-days N` | Days threshold for Frozen status (default: 365) |
| `--sort-by METRIC` | Sort by `date` (oldest first, default), `status`, or `file` |
| `--status FILTER` | Show only files with this status: `active`, `stale`, or `frozen` |
| `--format {table,json,short,terse}` | Output format (default: table) |

Example output:

```
──────────────────────────────────────────────────────────────────────────────
 File                    Language     Last Modified  Days  Status
──────────────────────────────────────────────────────────────────────────────
 src/legacy/parser.rs    Rust           2023-01-15   840  FROZEN
 src/util.rs             Rust           2024-09-20   197  STALE
 src/main.rs             Rust           2026-03-01    34  ACTIVE
──────────────────────────────────────────────────────────────────────────────

  ACTIVE     12  (modified < 90 days)
  STALE       8  (90 days – 365 days)
  FROZEN      3  (not modified > 365 days)
```
