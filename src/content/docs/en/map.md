---
title: "km map"
description: "Enclosure diagram of the code"
---

Draws the code as nested circles, the enclosure diagram of *Your Code as a Crime Scene*: every directory is a circle holding the circles of its subdirectories and files, a file's area grows with its lines of code, and one metric colours the files. A table ranks files; the map shows where the ones that stand out sit, whether spread out or gathered in one module, and how big that module is next to the rest.

```bash
km map --html map.html [path]
km map --html map.html --color-by hotspots --since 6m
km map --format json [path]   # the laid out tree, for other tools
```

The page is one HTML file that needs nothing else, in light and dark themes. A click on a directory zooms into it, a click outside it or on **Up** zooms out; hovering a file shows its path, its lines and its value. Directory names show when their circle is large enough. The foot of the page credits what it builds on.

The two ends of the scale are vermilion orange and blue (Okabe-Ito), which stay apart for every kind of colour blindness. **Patterns** draws them without colour as well, lines over the orange files and dots over the blue ones, for a print in black and white; the page prints with its colours and without its controls.

| `--color-by` | Colours | As |
|---|---|---|
| `score` (default) | orange below 70, grey from 70 to 90, blue from 90 | `km score`, per file |
| `hotspots` | orange by share of the largest hotspot, grey under a tenth of it | `km hotspots` |
| `churn` | high orange, medium pale orange, low grey | `km churn` |
| `age` | active blue, stale grey, frozen pale orange | `km age` |
| `knowledge` | critical orange to low grey; orange when the owner is inactive | `km knowledge` |
| `cycles` | orange when the file is in a dependency cycle | `km deps` |
| `llm` | blue from 95 (LLM-friendly), grey from 70 (needs care), orange below 70 (LLM risk) | readiness for coding agents, by `km score` |

Above the map, the share of the lines on each side of the scale (`85% an LLM risk · 9% needing care · 5% LLM-friendly`), and on it a label with the path of the directory where each side gathers most (`Most LLM risk: src/tui/`), not the only place of that side: the directory below the root with the most such lines and the largest share of them, a directory that is a part of the code rather than nearly all of it. `--color-by llm` follows the claim that coding agents work well only on healthy code: CodeScene puts the bar at 9.5 of its Code Health, and 95 is its counterpart on the 0–100 scale of `km score`, which is measured otherwise. Both thresholds can be changed in `.kimun.toml` (`[map] llm_friendly = 95`, `llm_risk = 70`).

Files without a value (no history, a language with no dependency graph) are drawn faint. The metrics of git need a repository and read history since `--since`; the thresholds come from `.kimun.toml` as their commands read them. The layout packs each directory's children largest first, then by name, as `d3.pack` packs circles, so the same code gives the same map.

| Flag | Description |
|------|-------------|
| `--html FILE` | Write the map as an interactive HTML page to this file |
| `--color-by METRIC` | `score` (default), `hotspots`, `churn`, `age`, `knowledge`, `cycles` or `llm` |
| `--since TIME` | Read history since this time (e.g. `6m`, `1y`, `30d`) |
| `--format {table,json}` | `json` prints the laid out tree: every node with `x`, `y`, `r`, `depth`, `parent`, `lines`, and for files `heat` (-1 to 1) and `label` |
