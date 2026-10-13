---
title: "Kimün: measuring the quality of AI-generated code"
description: "Why Kimün exists: when an agent writes hundreds of lines an hour, knowing whether that code is any good can't be an act of faith. It has to be a measurement."
date: 2026-10-12
---

> "You can't control what you can't measure."
>
> Tom DeMarco

There's an old fear in our profession. It isn't new, but AI amplified it: **how do I know the code I'm generating is any good?**

It's a legitimate question. When you ask an AI agent to write you a function, a complete module or even an entire project, you're delegating decisions you used to make line by line. And yes, the result may compile, pass the tests and even look elegant. But is it maintainable? Is it too complex? Does it have hidden duplication? Will you understand it in six months?

The answer can't be an act of faith. It has to be a measurement.

Many developers blindly trust the code AI generates. Others reject it on principle. Both positions are comfortable, and both are wrong.

What we need are tools that let us **objectively evaluate** code quality, wherever the code comes from: a human, an LLM or a combination of the two.

There are commercial products for this. Codacy, SonarQube and CodeClimate all do a respectable job. But I wanted something different: a tool that was **fast, that ran in the terminal, that could integrate directly with AI agents**, and that was grounded in solid research, not in arbitrary rules invented by a committee.

That's how **Kimün** was born.

## What is Kimün?

Kimün means "knowledge" or "wisdom" in Mapudungun. It is a command-line tool for analyzing code quality: a single binary, `km`, that replaces a whole collection of tools. It counts lines like `cloc`, measures complexity like SonarQube, and applies Adam Tornhill's ideas to read the history of a repository.

It's written in Rust, it's fast, and it recognizes more than forty languages.

## The science behind Kimün

I didn't invent anything new. Kimün implements metrics with decades of research behind them.

### Halstead metrics

In 1977, Maurice Halstead proposed measuring software as if it were a physical phenomenon. His metrics extract the operators and operands of the source code to compute:

- **Volume**: the size of the program in bits of information.
- **Difficulty**: the mental effort needed to understand it.
- **Effort**: the total work required.
- **Bug estimate**: the defects predicted by the formula V/3000.

Halstead was criticized in his day. But his metrics are still surprisingly useful as relative indicators: they tell you which files are denser, more error-prone and more expensive to maintain.

### Cyclomatic complexity

In 1976, Thomas McCabe proposed counting the independent paths through the code. Every `if`, every `for`, every `while` adds a path. More paths mean more possible states, and code that is harder to test and to understand.

### Cognitive complexity

Cyclomatic complexity counts paths, but it can't tell a flat `switch` from four nested conditions, and anyone who has read both knows they don't cost the same. Cognitive complexity, the method SonarSource proposed, measures how hard code is to *understand*: it penalizes nesting and lets linear flow through.

### Tornhill's work

Adam Tornhill changed the way we think about code quality with his books *Your Code as a Crime Scene* and *Software Design X-Rays*. His key insight: **the most problematic code isn't the most complex code, it's the code that is complex and also changes often**.

Kimün implements three analyses inspired by Tornhill:

- **Hotspots**: combines how often a file changes in git with how complex it is. A complex file nobody touches is a minor risk. A complex file that gets modified every week is a time bomb.
- **Knowledge maps**: analyzes `git blame` to detect concentration of knowledge. If a single person owns more than 80% of a critical module, you have a *bus factor* problem.
- **Temporal coupling**: identifies the files that always change together in commits, revealing architectural dependencies the code doesn't declare.

### Indentation complexity

Also inspired by Tornhill: Kimün measures how much the depth of indentation varies. It's a simple but powerful heuristic, because deeply nested code is hard to follow. The standard deviation of indentation correlates well with the complexity developers perceive.

## The score: a grade for your code

Kimün's flagship command is `km score`. It combines five dimensions into a single grade, from A++ to F--:

| Dimension | Weight | What it measures |
|---|---|---|
| Cognitive complexity | 30% | How hard the code is to understand |
| Duplication | 20% | Percentage of duplicated code |
| Halstead effort | 20% | Mental effort per line of code |
| Indentation complexity | 15% | Variation in nesting depth |
| File size | 15% | Optimal range: 50 to 300 lines |

Running it is trivial:

```bash
km score .
```

You get the grade of the project and its breakdown by dimension. If you want to see more of the problematic files:

```bash
km score . --bottom 20
```

This shows you the 20 files that most need attention. It's perfect for deciding what to refactor first.

Need to integrate it into a CI/CD pipeline? The commands that measure answer in JSON:

```bash
km score . --format json
```

And you can use the grade as a gate. This command compares your branch with the main one and fails if the code got worse:

```bash
km score --trend origin/main --fail-if-worse
```

Every option is in the [documentation of `km score`](/en/docs/score/).

## Integrating it with Claude Code

This is where it gets interesting. Kimün integrates directly with Claude Code, with a single command:

```bash
km ai skill claude
```

This installs a *skill* that teaches Claude Code the commands of `km`. Once it's installed, you can ask for things like:

> "Analyze the code quality of this project."

> "Show me the hotspots of the last six months."

> "Which files have the worst maintainability?"

Claude Code runs the appropriate `km` commands, interprets the JSON results and gives you a narrative analysis. It's like having a code auditor who speaks your language.

The beauty of this is that it **closes the loop**: you use AI to generate code, and then you use AI plus objective metrics to evaluate it. It's not blind faith. It's assisted verification.

## Installation

The easiest way is with Homebrew:

```bash
brew install lnds/kimun/kimun
```

If you already have the Rust toolchain installed, you can also use Cargo:

```bash
cargo install kimun
```

And if you'd rather download a compiled binary, there are builds for macOS (Apple Silicon), Linux (x86_64 and arm64) and Windows on the [releases page](https://github.com/lnds/kimun/releases).

## Why I built this

I've been using AI agents to write code for a little over two years. And I realized the conversation about quality was dominated by two extremes: the evangelists who say AI writes perfect code, and the skeptics who say everything it generates is garbage.

The truth, as always, is in the data. Not in the opinions.

Kimün is my way of putting numbers on the table. Of saying: "this module has a cyclomatic complexity of 47 and a maintainability index of 23. It doesn't matter who wrote it, it has to be refactored."

Metrics don't replace human judgment. But they give you an objective basis for making decisions. And when you're generating hundreds of lines of code an hour with the help of AI, that objective basis is more necessary than ever.

## Try it

The code is on [GitHub](https://github.com/lnds/kimun). It's open source, it's actively maintained, and I accept contributions.

Run `km score .` on your project. Look at the grade. If it surprises you, good: that's what metrics are for, to show you what you didn't want to see.

---

*A first version of this post appeared on February 25, 2026 in [La Naturaleza del Software](https://lnds.net/en/blog/lnds/2026/02/25/kimun-measuring-ai-generated-code-quality/). This edition brings it up to date with what `km` does today.*
