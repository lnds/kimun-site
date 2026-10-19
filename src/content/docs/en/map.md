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

The page is one HTML file that needs nothing else, in light and dark themes. A click on a directory zooms into it, a click outside it or on **Up** zooms out; hovering a file shows its path, its lines and its value. Directory names show when their circle is large enough.

| `--color-by` | Colours | As |
|---|---|---|
| `score` (default) | red below 70, grey from 70 to 90, green from 90 | `km score`, per file |
| `hotspots` | red by share of the largest hotspot, grey under a tenth of it | `km hotspots` |
| `churn` | high red, medium pale red, low grey | `km churn` |
| `age` | active green, stale grey, frozen pale red | `km age` |
| `knowledge` | critical red to low grey; red when the owner is inactive | `km knowledge` |
| `cycles` | red when the file is in a dependency cycle | `km deps` |

Files without a value (no history, a language with no dependency graph) are drawn faint. The metrics of git need a repository and read history since `--since`; the thresholds come from `.kimun.toml` as their commands read them. The layout packs each directory's children largest first, then by name, as `d3.pack` packs circles, so the same code gives the same map.

| Flag | Description |
|------|-------------|
| `--html FILE` | Write the map as an interactive HTML page to this file |
| `--color-by METRIC` | `score` (default), `hotspots`, `churn`, `age`, `knowledge` or `cycles` |
| `--since TIME` | Read history since this time (e.g. `6m`, `1y`, `30d`) |
| `--format {table,json}` | `json` prints the laid out tree: every node with `x`, `y`, `r`, `depth`, `parent`, `lines`, and for files `heat` (-1 to 1) and `label` |
