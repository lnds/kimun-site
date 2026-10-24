---
title: "When No Test Sounds the Alarm"
description: "Last time, a failing test always told the agent where to look. This time we took that away: bugs the suite can't catch and nothing but a symptom report. [PENDING: one line with the result.]"
date: 2026-10-30
authors: [Madu, Edo. Díaz]
---

<!-- DRAFT. Figures marked [PENDING] come from the experiment, which hasn't run yet. -->

In [our last post](/en/blog/is-your-code-llm-friendly/), we put `km map --color-by llm` to the test with 47 bugs. On code the model already knew, orange barely mattered. On sc-cli, a project almost certainly missing from its training data, the agent burned a third more tokens on orange files.

But both rounds had a crutch we didn't measure: **there was always a failing test**. The agent read the stack trace, grepped for the function and read about 40 lines. With a lead like that, file size hardly matters.

Real life doesn't always hand you a lead. A user reports something weird, no test fails, and somebody has to track down the cause. That's where hard-to-understand code should send the full bill.

## The bugs the suite can't see

When [kalku](https://kalku.tools/en/) threw 304 mutants at sc-cli, the suite killed 49. The other 255 survived: one-token changes (`<` for `<=`, `&&` for `||`, a different return value) that leave every test green. Each one is a bug that could be in production right now without anyone knowing.

| File | Score | Mutants | Survived |
|---|---|---|---|
| `git/mod.rs` | 99.5 | 44 | 41 |
| `git/operations.rs` | 92.5 | [PENDING] | 4 |
| `api/client.rs` | 57.3 | 60 | 53 |
| `main.rs` | 30.7 | 60 | 57 |
| `ui/mod.rs` | 15.3 | 60 | 43 |

*[PENDING: check the `operations.rs` row; kalku's report lumps it with `config.rs` and `story_creator.rs`.]*

Not all of them are usable. Some mutants are equivalent: they change the code but not the behavior, so no user could ever notice. For every survivor we picked, we wrote a test that catches it, and if we couldn't write one, we dropped it. That test stays hidden: the agent never sees it, and we use it at the end to check whether the fix is real.

## How we measured it

Same model and same setup as before: one isolated copy of the project per bug, with a fresh git history, and one agent (Claude Sonnet) per copy. What changes is what the agent gets. Instead of "this test fails," it gets a report like a user would write:

> *When I list stories with `--all`, the last page never shows up. I have 30 stories and I see 25.*

*[PENDING: swap this example for a real report from the experiment.]*

The report describes the symptom, not the cause: no file, no function, no line. We wrote it by looking only at how the mutated program behaves.

[PENDING: how many bugs landed in blue files and how many in orange ones.] For every trial, we checked three things:

1. **Does the hidden test pass?** In other words, did the agent actually fix the bug?
2. **Does the rest of the suite pass?** A fix that breaks something else doesn't count.
3. **What did it cost?** Cumulative input tokens, tool calls and how much code the agent pulled into its context.

## Results

| | Blue (n=[PENDING]) | Orange (n=[PENDING]) |
|---|---|---|
| Correct fix (hidden test passes) | [PENDING] | [PENDING] |
| Broke something else | [PENDING] | [PENDING] |
| Tool calls (median) | [PENDING] | [PENDING] |
| Cumulative input tokens (median) | [PENDING] | [PENDING] |

[PENDING: the core paragraph. Two possible scripts, depending on the outcome:]

- *If orange costs more:* without tests, the gap [grows from a third to PENDING]. The agent can't jump to the guilty line anymore. It has to trace the program until it finds where the behavior goes sideways, and in a 3,000-line file scoring 15, that's a long walk.
- *If it doesn't:* surprise. [Explain how the agent found its way without tests: did it write its own tests? Use git? Read the whole file?]

[PENDING: one or two concrete cases, like `linegen.py` last time. What report it got, what it read, where it got lost, what it spent.]

## What the agent does with no lead

[PENDING: whatever the transcripts show. Questions worth answering:]

- Does it write a test that reproduces the symptom before touching the code, like a seasoned developer would?
- How often does it "fix" something that wasn't the bug?
- Does it claim success without reproducing the symptom? Last time, two agents said the tests passed without looking at the output.

## What CodeScene's study says

In January, Markus Borg, Adam Tornhill and colleagues published [a study](https://arxiv.org/abs/2601.02200) on the same question, with a different task: they had several models refactor 5,000 Python programs and counted how often the tests broke. Mid-sized models broke healthy code 15% to 30% less often. Claude Code, on the other hand, broke about 5% in both groups. It played it so safe that it mostly just renamed variables.

The two approaches fit together. They measure whether the agent breaks the code; we measure what it costs to fix it. And their own to-do list includes really bad code, since their sample had few files under 7 on Code Health. sc-cli has 87% of its lines under 70 on Kimün's scale.

## What this experiment doesn't measure

- **[PENDING] cases**, one run per bug, with a single model.
- **Still one project**, with few distinct files.
- **We wrote the reports.** A vaguer or sharper report could change the outcome, though we used the same style for all of them.
- **A mutant is an artificial bug.** Real bugs tend to come from misunderstood requirements, not a `<` that should've been a `<=`.

## Takeaways

[PENDING: two or three practical takeaways, depending on the result. Draft:]

1. **Tests are the agent's map.** Without them, [whatever the data shows].
2. **Run kalku before you turn an agent loose.** Surviving mutants mark the spots where an agent will be flying blind if something breaks there.
3. **Orange code with no tests is the worst place to delegate blindly.** `km map --color-by llm` shows you where the orange is. Coverage and kalku show you where there's no safety net.

Next time we tackle the other question: **how much does memory matter?** We'll rerun round one on click, flask and black with every name changed, so the model can't recognize them.

---

*[PENDING: link to the data in lnds/kimun-llm-experiment.]*
