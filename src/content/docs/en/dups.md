---
title: "km dups"
description: "Detect duplicate code"
---

Finds duplicate code blocks across files using a sliding window approach. Applies the **Rule of Three**: duplicates appearing 3+ times are marked as **CRITICAL** (refactor recommended), while those appearing twice are **TOLERABLE**.

Test files and directories are excluded by default, since tests often contain intentional repetition.

The occurrences of a group never overlap within a file, so a run of repeated lines (a table of `0xFF`) is not a copy of itself. A block grows while every occurrence goes on matching, even when the next lines also appear elsewhere. The duplicated lines of a project are counted once each, however many groups hold them, so they never exceed the code lines.

```bash
km dups [path]
```

Options:

| Flag | Description |
|------|-------------|
| `-r`, `--report` | Show detailed report with duplicate locations and code samples |
| `--show-all` | Show all duplicate groups (default: top 20) |
| `--min-lines N` | Minimum lines for a duplicate block (default: 6) |
| `--include-tests` | Include tests, examples and benchmarks in analysis (excluded by default) |
| `--max-duplicates N` | Exit with code 1 if duplicate groups exceed this limit (`--max-duplicates 0` fails on any duplicate) |
| `--max-dup-ratio PERCENT` | Exit with code 1 if the duplicated-lines ratio exceeds this percentage (e.g. `--max-dup-ratio 5.0`) |
| `--fail-on-increase REF` | Exit with code 1 if the current duplication ratio is higher than at the given git ref (e.g. `origin/main`). Prevents debt from growing silently in CI |
| `--format {table,json,short,terse}` | Output format (default: table) |

Example summary output:

```
────────────────────────────────────────────────────────────────────
 Duplication Analysis

 Total code lines:                                             3247
 Duplicated lines:                                              156
 Duplication:                                                  4.8%

 Duplicate groups:                                               12
 Files with duplicates:                                           8
 Largest duplicate:                                        18 lines

 Rule of Three Analysis:
   Critical duplicates (3+):     7 groups,    96 lines
   Tolerable duplicates (2x):    5 groups,    60 lines

 Assessment:                                                    Good
────────────────────────────────────────────────────────────────────
```

Example detailed output (`--report`):

```
────────────────────────────────────────────────────────────────────
 [1] CRITICAL: 18 lines, 3 occurrences (36 duplicated lines)

   src/parser.rs:45-62
   src/formatter.rs:120-137
   src/validator.rs:89-106

 Sample:
   fn process_tokens(input: &str) -> Vec<Token> {
       let mut tokens = Vec::new();
       for line in input.lines() {
       ...

────────────────────────────────────────────────────────────────────
 [2] TOLERABLE: 12 lines, 2 occurrences (12 duplicated lines)

   src/main.rs:100-111
   src/cli.rs:200-211

 Sample:
   match result {
       Ok(value) => {
       ...
────────────────────────────────────────────────────────────────────
```

## Excluded test patterns

By default, `km dups` skips files matching common test conventions:

- **Directories**: `tests/`, `test/`, `__tests__/`, `spec/`, and .NET test projects, named after what they test (`App.Tests/`, `Orders.UnitTests/`, `Api.IntegrationTest/`)
- **Examples and benchmarks**: `examples/`, `example/`, `benches/`, `bench/`, `benchmarks/`, `benchsuite/`, code that is run to show or time the project rather than shipped with it
- **By extension**: `*_test.rs`, `*_test.go`, `test_*.py`, `*.test.js`, `*.spec.ts`, `*Test.java`, `*_test.cpp`, and more
- **Rust test modules**: a file declared under `#[cfg(test)]` without a body (`#[cfg(test)] mod testutil;`, with or without `#[path]`), and the modules below it

The same rules apply to every command. Use `--include-tests` to analyze them as well, and `--list-excluded` to see which files are left out and why.

## Inline tests

Rust keeps tests inside the source file, under `#[cfg(test)]`. Every command that measures code leaves those items out along with the test files: `dups`, `indent`, `hal`, `cycom`, `cogcom`, `mi`, `miv`, `smells`, `hotspots`, `score` and the metrics of `report`. Only the item under the attribute is skipped, so the code after a test module is measured. `--include-tests` brings them back.

`km loc` and the line counts of `km report` still count them: they are lines of the file, as `cloc` counts them.

## Generated files, data and prose

The commands that measure code (`dups`, `indent`, `hal`, `cycom`, `cogcom`, `mi`, `miv`, `smells`, `score`, `report`, `init`, `hotspots`, `churn`, `tc`) leave out:

- **Generated files**, by name (lock files, `*.min.js`, `*.bundle.js`, `*.pb.go`, `*_pb2.py`, `*.generated.*`) or by content:
  - a comment in the first 20 lines saying the file is generated and not to be edited (Go's `// Code generated ... DO NOT EDIT.`, protoc);
  - `@generated`, or C#'s `<auto-generated`;
  - the banner of Bison or Flex, or the helpers esbuild puts at the top of a bundle;
  - bundler output: a `sourceMappingURL` comment at the end of the file, or a `<name>.map` beside it.
- **Data and prose**: JSON, YAML, TOML, XML, Markdown, Text, Properties and PO files. Their indentation is structure, not nesting, and they change with every release without being code.

`km knowledge` and `km authors` leave out generated files. `km loc` and `km deps` read every file: lines are lines, and generated code is still imported.

## File kinds

Every file is of one kind:

| Kind | Files |
|------|-------|
| `code` | Source code |
| `docs` | Markdown, reStructuredText and plain text |
| `infra` | Terraform, Dockerfiles, and YAML that is infrastructure: GitHub workflows, `.gitlab-ci.yml` and other CI pipelines, Compose files, Helm charts, Kustomize, Ansible (`playbooks/`, `roles/*/tasks/`, …), Kubernetes manifests (`apiVersion` and `kind`), CloudFormation templates |
| `data` | JSON, TOML, XML, the rest of YAML, Properties and PO files |

`--kind` chooses the kinds a command reads, on every command that reads files: `--kind docs`, `--kind code,infra`, `--kind all`. Without it nothing changes: each command reads what it always has, and infrastructure written in a language of code (Terraform, Dockerfiles) is measured as code. To measure code alone, use `--kind code`, or set `separate = true` under `[kinds]` in `.kimun.toml` to make that the default; `[kinds]` can also declare the kind of files by glob. `--list-excluded` names the files `--kind` leaves out. [`km docs refs`](/en/docs/docs#km-docs-refs) reads the documents, whatever `--kind` says.
