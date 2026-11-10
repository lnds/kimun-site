---
title: "When No Test Sounds the Alarm"
description: "We took away the failing test and gave the agent nothing but a user's bug report. It fixed all 20 bugs at about the same cost, and orange code still took a bit more work. But first, our own test bench sold us a bill of goods."
date: 2026-11-10
authors: [Madu, Edo. Díaz]
image: /blog/when-no-test-helps/card-en.png
---

`km map --color-by llm` draws your code as a map and colors each file by its Kimün grade, from 0 to 100: blue for files a model should understand without breaking a sweat, orange for the ones that will give it trouble because they're big, deeply nested and hard to follow. In [our last post](/en/blog/is-your-code-llm-friendly/) we put that map to the test with 47 bugs. On code the model already knew, orange barely mattered. On sc-cli, a project almost certainly missing from its training data, the agent burned a third more tokens on orange files.

![Map of sc-cli: dominated by three orange circles, with a bit of blue in git/](/blog/when-no-test-helps/sc-cli.png)

But those rounds had a crutch we never measured: **there was always a failing test**. The agent read the stack trace, jumped to the function and read about 40 lines. With a lead like that, file size hardly matters.

Real life doesn't always hand you a lead. A user reports that something acts weird, the suite is green, and someone has to track down the cause. We figured that's where a hard-to-read file would really hurt. It didn't, and before we could say so, we had to stop trusting our own numbers.

## The bugs the suite can't see

To find them we used [kalku](https://kalku.tools), our mutation testing tool. The idea is old and simple: kalku plants a small bug in the code on purpose, a *mutant*, and runs the suite. If some test fails, the suite killed the mutant. If every test passes, the mutant survives, and that exposes behavior no test is watching.

On sc-cli, most of them survived. They're one-token changes (`==` for `!=`, a `+ 1` for a `+ 2`, a negated condition) that keep every test green. Each one is a bug that could be in production today without anyone knowing.

| File | Lines | Grade | Mutants | Survived |
|---|---|---|---|---|
| `git/mod.rs` | 225 | 99.5 | 44 | 41 |
| `git/operations.rs` | 591 | 92.5 | — | 4 |
| `story_creator.rs` | 125 | 87.3 | — | 13 |
| `api/client.rs` | 741 | 57.3 | 60 | 53 |
| `main.rs` | 2,123 | 30.7 | 60 | 57 |
| `ui/mod.rs` | 3,522 | 15.3 | 60 | 43 |

*kalku measured `operations.rs` and `story_creator.rs` together with `config.rs`: 80 mutants across the three, 61 survivors.*

We picked 20 survivors, 10 in blue files (grade 85 or higher) and 10 in orange ones. Not all of them work: some mutants change the code but not what the user sees. For each one we wrote a test that catches it; if we couldn't write one, we dropped it. That test stays hidden: the agent never sees it, and we use it at the end to check whether the fix is right.

## How we measured it

Same model (Claude Sonnet) and same method as before: one isolated copy of the project per bug, with a fresh git history. What changes is what the agent gets. Instead of "this test fails," it gets a report like one a user would write:

> *`sc-cli branch 42` always tells me "Not a git repository. Please run this command from within a git repository.", no matter where I run it. I've tried a regular clone and a bare repository, and git recognizes both. Pressing `g` on a story in the TUI doesn't open the branch popup either.*

The report describes the symptom, not the cause: no file, no function, no line. We wrote it by looking only at how the mutated program behaves. The instructions tell the agent that no test reproduces the problem, that it may add tests of its own, and to stop once the suite passes.

For every run we checked three things: whether the hidden test passes, whether the rest of the suite passes, and what it cost.

## Our first run sold us a bill of goods

We launched all 20 agents at once. The results looked like a headline: without a test, everything cost **nearly three times as much**, and orange cost 47% more, up from 33% before.

Reading the sessions told a different story. Twenty copies compiling Rust at the same time will make anyone wait, and the agents waited badly. They kicked off `cargo test` in the background and then babysat it with `sleep` loops, or checked the process list to see whether it was done. Three of those loops asked `pgrep -f "cargo test"`, and since their own command line contained that text, they kept finding themselves: they went on waiting six hours after everything had finished.

Every lap of that wait is one more turn, and every turn resends the whole context. The most expensive runs were the ones that waited the most.

We reran the round with 4 agents at a time and one more line in the instructions: run every command in the foreground and don't look at other processes.

## Results

| | With a failing test | No test (clean run) |
|---|---|---|
| Correct fix, blue | 10 of 10 | 10 of 10 |
| Correct fix, orange | 11 of 12 | 10 of 10 |
| Tools, blue / orange (median) | 6 / 8 | 6 / 7.5 |
| Input tokens, blue / orange (median) | 356K / 473K | 370K / 436K |
| Orange difference | +33% | +18% |

**Without a test, the agent spent about the same as with one.** The tripling in the first run was all waiting. All 20 fixes were correct, none broke anything else, and in all 20 cases the agent undid exactly the mutation, in the right file. Each took between one and three minutes.

**Orange still cost more, just less than before.** In 71 out of 100 pairs, the orange bug cost more than the blue one. The gap between medians has a 5.4% chance of showing up by luck (permutation test), right at the edge of what we'd call convincing. On its own it proves nothing; next to the round with a failing test, which pointed the same way much more strongly, it shows a small, steady gap.

## The report is the lead

How does an agent find a `!=` in 11,500 lines without a stack trace? By reading the report carefully.

In the example above, the agent grepped for "Not a git repository," read the first 80 lines of `git/mod.rs`, saw the condition was backwards and flipped it. Five tool calls and 307K tokens. An error message quoted in a report does nearly the same job as a stack trace: it tells you where to look.

When the report has no message, the road is longer. A user said that, when creating an epic, the popup did nothing when they pressed Enter. There's no text to search for, so the agent grepped for "epic" across the whole project, read 70 lines of `ui/mod.rs` and another 70 of `main.rs` to figure out who creates the epic, and only then found the negated condition. Nine tool calls and 510K tokens: 66% more than the `git/mod.rs` case.

That's why the gap is small. The agent never reads a 3,500-line file end to end: it searches, reads a window and decides. An orange file costs it one or two more searches, not a full read. And since every turn resends about 55K tokens of base context, one extra search shows up in the token count even when it barely changes what the agent read.

## What the agent does with no lead

We had three questions, and the answers are clear:

- **Does it write a test that reproduces the symptom before touching the code?** Not one of the 40 agents, across both runs, wrote a single test, even though the instructions allowed it. They read, search, fix and run the suite. One said it outright: it added no test because the code reads straight from standard input.
- **Does it "fix" something that wasn't the bug?** None did. Every one changed only the mutated line.
- **Does it claim success without checking the result?** Not this time: all of them filtered the suite's output and read the summary before stopping.

The first one matters most to us: a fix without a regression test leaves the bug free to come back, and the agent won't write one unless you ask.

## What the CodeScene study says

In January, Markus Borg, Adam Tornhill and coauthors published [a study](https://arxiv.org/abs/2601.02200) on a similar question with a different task: they had several models refactor 5,000 Python programs and counted how often they broke the tests. Mid-sized models broke healthy code 15% to 30% less often. Claude Code, on the other hand, broke about 5% in both groups: it played it so safe that it mostly just renamed variables.

They measure whether the agent breaks code; we measure what it costs to fix it. And they leave really bad code for future work, since their sample had few files under 7 in Code Health. 87% of sc-cli's lines sit under 70 on Kimün's scale.

## What this experiment doesn't measure

- **20 cases, one run per bug and a single model.** The orange gap is right at the limit of what these numbers can claim.
- **Still a single project**, with six different files.
- **We wrote the reports, and they're good ones.** Several quote error messages word for word. A vague report ("sometimes it doesn't work") could change the result, and that's the next variable we want to measure.
- **A mutant is an artificial bug.** Real bugs usually come from misunderstood requirements, not from a `==` where a `!=` belongs.

## Takeaways

1. **A good bug report is worth almost as much as a failing test.** If the user pastes the error message, the agent gets to the line with one `grep`. Asking for reports with the exact text is the cheapest help there is, whether the fixer is a person or a model.
2. **Orange always costs a little more.** Between 18% and 33% more tokens, depending on the lead. It's not a wall, but it adds up on a team that delegates a lot.
3. **The agent doesn't leave tests behind.** If you want a regression test, ask for one. The mutants that survive kalku show exactly where one is missing.
4. **Measure your test bench before you measure the agent.** Our first run was measuring machine contention, not code. Had we published those numbers, the headline would have been wrong.

In the next post we tackle the other question: **how much does memory matter?** We'll rerun round one on click, flask and black with every name changed, so the model can't recognize them.

## Try Kimün

Kimün is open source (MIT license), and the code lives at [github.com/lnds/kimun](https://github.com/lnds/kimun). Install it with `cargo install kimun` or `brew install lnds/kimun/kimun`, then run `km map --html map.html --color-by llm` to draw your own project. If it's useful to you, a star on the repo helps more people find it; if something breaks or you miss a feature, open an issue.

---

*Data, hidden tests, reports and scripts at* [lnds/kimun-llm-experiment](https://github.com/lnds/kimun-llm-experiment).
