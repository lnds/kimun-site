---
title: "km ai"
description: "Skill and analysis for coding agents"
---

Connects Kimün with coding agents and language models. It has three subcommands: `skill` and `permissions` set up Claude Code to use `km`, and `analyze` asks a model to write a report on its own.

```bash
km ai skill claude
km ai permissions claude
km ai analyze claude [path]
```

Every provider argument is `claude`, the only one supported today.

## `km ai skill` — Install the skill

Installs a Claude Code skill that teaches the agent how to run the `km` subcommands and how to read their JSON output, so it measures before it changes anything.

```bash
km ai skill claude                      # install the skill
km ai skill claude --with-permissions   # and let km run without prompting
```

No API key is needed: Claude Code itself is the model.

| Flag | Description |
|------|-------------|
| `--with-permissions` | Also configure the permissions, as `km ai permissions` does |

## `km ai permissions` — Run without prompting

Adds Bash permission rules for every `km` subcommand to the `.claude/settings.local.json` file of the project, so Claude Code runs them without asking each time. It merges with the permissions already there and is safe to run more than once.

```bash
km ai permissions claude
```

## `km ai analyze` — A report written by a model

Invokes a model that uses the `km` tools to analyze the repository and writes a report: code health, complexity hotspots, maintainability problems and recommendations.

```bash
km ai analyze claude                      # analyze the current directory
km ai analyze claude src/                 # analyze a subdirectory
km ai analyze claude --output report.md   # save the report to a file
```

It calls the Anthropic API, so it needs the `ANTHROPIC_API_KEY` environment variable.

| Flag | Description |
|------|-------------|
| `--model MODEL` | Model to use |
| `-o`, `--output FILE` | Save the report to a file |
