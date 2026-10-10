---
title: "Configuration"
description: "The .kimun.toml file: thresholds, quality gates and how to generate it with km init."
---

Run `km init` to analyze your project and generate a calibrated `.kimun.toml` in one step:

```
$ km init
Analyzing project... done.

Current state:
  avg function length: 38 lines  →  suggested max_lines = 45
  avg param count:     3.2       →  suggested max_params = 4
  dup ratio:           4.1%      →  suggested max_dup_ratio = 5.0
  health score:        B+        →  suggested fail_below = B

Write .kimun.toml with these values? [Y/n]
```

Use `--yes` to skip the prompt. Add `-y` in CI to write the file non-interactively.

Alternatively, place a `.kimun.toml` file manually in the root of your repository to set project-level defaults for thresholds and quality gates. `km` searches for the file at the git repository root, falling back to the current directory.

CLI flags always take precedence over `.kimun.toml`, which in turn takes precedence over built-in defaults.

```toml
[smells]
max_lines  = 30    # flag functions longer than N body lines (default: 50)
max_params = 3     # flag functions with more than N parameters (default: 4)

[dups]
min_lines      = 8     # minimum block size for duplication detection (default: 6)
                       # also applies to `km report` and `km score`
max_duplicates = 10    # CI gate: fail if duplicate groups exceed N
max_dup_ratio  = 5.0   # CI gate: fail if duplicated-lines ratio exceeds this %

[score]
model      = "cogcom"  # scoring model: cogcom (default) or legacy
fail_below = "B-"      # CI gate: fail if health score is below this grade

[age]
active_days = 60    # files modified within N days are Active (default: 90)
frozen_days = 180   # files not modified for more than N days are Frozen (default: 365)

[tc]
min_degree   = 5    # minimum commits per file to include in coupling analysis (default: 3)
min_strength = 0.5  # only show pairs with coupling strength >= this value

[hotspots]
complexity = "cogcom"  # complexity metric: indent (default), cycom, or cogcom

[impact]
inert = ["scripts/**"]  # changed files that reach nothing, besides documentation
entry_points = ["**/endpoint.ex"]  # files run rather than used, besides tasks and scripts
```

All sections and fields are optional — omit any you don't need. A fully documented template is available at [`.kimun.toml.example`](https://github.com/lnds/kimun/blob/main/.kimun.toml.example).
