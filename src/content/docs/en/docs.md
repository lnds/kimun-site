---
title: "km docs"
description: "Dead references and documents behind the code"
---

Measures of documentation: the Markdown files of the repository, whatever `--kind` says. `km docs refs` finds the references that lead nowhere; `km docs stale` the documents behind the code they describe. For a change not yet merged, [`km impact`](/en/docs/impact#documentation-left-behind) lists the documents it leaves behind.

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
