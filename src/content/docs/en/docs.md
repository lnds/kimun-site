---
title: "km docs"
description: "Dead references, the graph of notes, agent context and documents behind the code"
---

Measures of documentation: the Markdown files of the repository, whatever `--kind` says. `km docs refs` finds the references that lead nowhere; `km docs links` reads the links between notes as a graph; `km docs context` measures the files that steer coding agents; `km docs stale` finds the documents behind the code they describe. For a change not yet merged, [`km impact`](/en/docs/impact#documentation-left-behind) lists the documents it leaves behind.

## `km docs refs`

Documentation refers to the code: files, directories, headings of other documents. When the code moves on, those references go dead and nobody notices, and an instruction file for coding agents that names a file no longer there sends the agent the wrong way. `km docs refs` reads the Markdown documents of the repository and lists the references that lead nowhere.

```bash
km docs refs [path]
km docs refs --since-ref origin/main --fail-on-dead   # in CI
km docs refs --format github                          # annotations on the pull request
```

| What | Dead when |
|------|-----------|
| Links and images: `[text](path)`, `![alt](path)`, `[label]: path`, `<a href>`, `<img src>` | the file does not exist, from the document, or from the repository root for a path that starts with `/` |
| Anchors: `path.md#heading`, `#heading` | the Markdown document has no such heading, named as GitHub names it (`## Install` is `#install`), nor an element with that `id` or `name` |
| Paths in code spans: `` `src/kind.rs` ``, `` `scripts/` ``, `` `src/kind.rs:42` `` | the repository held that path at some time and no longer does |

A path in a code span is alive when it exists from the document or from the root, or when it is the end of a path of the repository (`` `deps/graph.rs` `` names `src/deps/graph.rs`). It counts as dead only if the history of the repository ever held it, so the layout of an example (`` `src/lib.rs` `` in a guide about Rust packages) or a file a plan has yet to create is not taken for one. Outside a git repository, a path is read when its first name is that of a file or directory of the tree. URLs are never fetched; an absolute link without an extension (`/docs/score/`) is a route of a site built from the documents, not a file. Fenced and indented code, front matter and HTML comments refer to nothing.

With `--since-ref`, the documents changed since the ref keep every dead reference, and the others only those that name a file the change touched: a pull request that deletes or moves a file learns which documents still name it.

| Flag | Description |
|------|-------------|
| `--since-ref REF` | Only documents changed since REF, and references to files changed since it |
| `--fail-on-dead` | Exit with code 1 when a dead reference is found |
| `--include-tests` | Read the documents under test directories too (left out by default, as fixtures) |
| `--format {table,json,short,terse,github,codeclimate}` | Output format (default: table). `terse` prints the number of dead references |

Example output:

```
────────────────────────────────────────────────────────────────────
 Document            Line Reference               Problem
────────────────────────────────────────────────────────────────────
 docs/guide.md         42 src/parser/old.rs       no such path
 docs/guide.md         57 ../README.md#install    no such heading
 tools/README.md        9 baselines/run.sh        no such file
────────────────────────────────────────────────────────────────────
 3 dead of 512 references, in 2 of 38 documents
```

The JSON lists `documents`, `references` and every dead reference with its `document`, `line`, `reference`, `form` (`link`, `image` or `code`) and `missing` (`file`, `heading` or `path`). `km ai` offers the command to an LLM as the tool `km_docs_refs`.

## `km docs links` -- The graph of notes

A knowledge base, a docs site or a second brain is a graph of notes, and its health is a property of that graph: notes nothing links to, links that lead nowhere, a few notes everything depends on, groups of notes cut off from the rest. `km docs links` reads the links between Markdown documents and reports them.

```bash
km docs links [path]
km docs links kb/ --top 50
km deps --kind docs --matrix   # the same graph with the dependency tools
```

| Link | Leads to |
|------|----------|
| `[text](path.md)` | the document at that path, from the linking one (from the walked directory for a path starting with `/`) |
| `[[Note]]`, `[[kb/Note\|text]]`, `![[Note]]` | a wikilink, as Obsidian, Foam and Logseq resolve it: by path from the root, else by note name, without case or extension; of several notes of that name, the nearest |

URLs and anchors alone link to no note, and a link to a file that is no document is no edge. An absolute link without extension is a route of a site.

| Reported | What |
|----------|------|
| Broken links | no file has the path, no note the name |
| Orphans | notes no note links to, besides entry points: README, index, SUMMARY, CLAUDE, AGENTS, CHANGELOG, CONTRIBUTING and the like |
| Hubs | the notes most linked to |
| Islands | groups of notes linked among themselves and to no other group, besides the largest |

With `--kind docs`, `km deps` builds the same graph: fan-in and fan-out of each note, cycles, `--matrix` and its HTML page, and broken links as unresolved imports. Without `--kind`, documents stay out of the dependency graph as before.

| Flag | Description |
|------|-------------|
| `--top N` | Rows of each table (default: 20); JSON lists every entry unless given |
| `--format {table,json,short,terse}` | Output format (default: table). `terse` prints the number of broken links |

## `km docs context` -- Files that steer coding agents

`CLAUDE.md`, `AGENTS.md`, rules of Cursor and Copilot, skills, agent and command definitions are loaded into the model's context. They grow, they repeat each other and their rules pile up, while models use long contexts worse, and worst what sits in the middle (Liu et al., *Lost in the Middle*, TACL 2024). `km docs context` measures them. No model is called.

```bash
km docs context [path]
km docs context --max-tokens 8000   # in CI
```

| Role | Files |
|------|-------|
| `instructions` | `CLAUDE.md`, `CLAUDE.local.md`, `AGENTS.md`, `GEMINI.md`, read for every task under their directory |
| `rules` | `.cursorrules`, `.cursor/rules/`, `.windsurfrules`, `.github/copilot-instructions.md`, `.github/instructions/` |
| `skill`, `agent`, `command` | `.claude/skills/` (and any `SKILL.md`), `.claude/agents/`, `.claude/commands/` |

| Measure | What |
|---------|------|
| Tokens | approximate: characters / 4 |
| Loads | what an agent working in a directory reads together: the instructions of its family (`claude`, `agents`, `gemini`) from the analyzed directory down to it, so a deep directory shows its real budget |
| Rules | lines of prose that ask (`must`, `never`, `always`, `do not`, `should`, `debe`, `nunca`, `siempre`, …): a rough measure of how much is asked |
| Repeated | lines of prose found in more than one context file; a link such as `AGENTS.md → CLAUDE.md` repeats nothing |
| Dead | the references [`km docs refs`](/en/docs/docs#km-docs-refs) finds dead |
| Commits, Changed | how often each file changed and when last, in a git repository |

`--max-tokens N` exits with code 1 when a load goes over N tokens. Files ignored by git are not read, and `.claude/` often is; `--kind` does not apply, the exclude flags do.

| Flag | Description |
|------|-------------|
| `--max-tokens N` | Exit with code 1 when a load goes over N tokens |
| `--top N` | Rows of each table (default: 20); JSON lists every entry |
| `--format {table,json,short,terse}` | Output format (default: table). `terse` prints the tokens of the largest load |

## `km docs stale`

The audit of a knowledge base over time: the documents whose code changed after them. Where [`km impact`](/en/docs/impact#documentation-left-behind) watches one change before it is merged, `km docs stale` looks at the whole repository as it is.

```bash
km docs stale [path]
km docs stale kb/ --top 50
```

A document describes a file as `km impact` reads it: it covers it (`covers:` in its front matter, or `[docs] covers` in `.kimun.toml`) or it names it (a link, a path in a code span, whole or by its end, or a directory of two names or more above it). Documents are never described, and changelogs and the globs of `[docs] ignore` are left out. A document is behind when a file it describes changed after the document last did, in the committed history.

```
───────────────────────────────────────────────────────────────────────────────
 Document                 Updated     Behind  Commits  Describes
───────────────────────────────────────────────────────────────────────────────
 kb/payments/refunds.md   2026-01-10    143d       12  apps/payments/lib/refund.ex (+3)
 docs/architecture.md     2026-04-02     51d        3  lib/billing/invoice.ex
───────────────────────────────────────────────────────────────────────────────
 2 of 38 documents are behind the code they describe
```

`Behind` is the time from the document's last change to the last change of what it describes, furthest first; `Commits` the distinct commits to those files since the document changed. The JSON lists every document behind, with `updated`, `days_behind`, `commits` and each file with `changed` and `commits`.

| Flag | Description |
|------|-------------|
| `--top N` | Rows of the table (default: 20); JSON lists every document unless given |
| `--format {table,json,short,terse}` | Output format (default: table). `terse` prints the number of documents behind |
