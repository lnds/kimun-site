// What `km` prints, abridged: the rules between rows and some columns are
// left out so it fits a card. The spans carry the colors. The numbers are
// those of kimün on itself, or of a small sample project, except for the
// gate, which shows the format with made-up values.

const c = (cls: string, text: string) => `<span class="t-${cls}">${text}</span>`;
const prompt = (cmd: string) => `${c('dim', '$')} ${cmd}\n`;

export const output = {
  score: `${prompt('km score')}
 Project Score:  ${c('green', 'A (91.0)')}
 Files Analyzed: 127
 Total LOC:      18,594

 Dimension                 Weight   Score   Grade
 Cognitive Complexity         30%    83.6   ${c('green', 'B+')}
 Duplication                  20%    97.3   ${c('green', 'A++')}
 Indentation Complexity       15%    93.5   ${c('green', 'A+')}
 Halstead Effort              20%    87.4   ${c('green', 'A-')}
 File Size                    15%    99.6   ${c('green', 'A++')}

 ${c('amber', 'Files Needing Attention')}
  57.9  ${c('red', 'D-')}   src/deps/analyzer.rs      Cognitive: 36
  63.9  ${c('red', 'D+')}   src/cogcom/analyzer.rs    Cognitive: 35
  72.3  ${c('amber', 'C')}    src/smells/rules.rs       Cognitive: 20`,

  scoreShort: `${prompt('km score')} Project Score:  ${c('green', 'A (91.0)')}
 Files Analyzed: 127
 Total LOC:      18,594`,

  loc: `${prompt('km loc')} Language     Files   Blank  Comment    Code
 Rust           126    2490     3502   18579
 Markdown         3     562        0    1394
 YAML             3      36        1     179`,

  hotspots: `${prompt('km hotspots --top 3')} File            Commits  Total Indent  Score
 src/main.rs          67          1259  ${c('amber', '84353')}
 src/cli.rs           36           588  21168
 src/git/mod.rs       22           808  17776`,

  impact: `${prompt('km impact --since-ref main')} 3 files call what changed, 1 of them with no test
 Changed: lib/shop/orders.ex
 Functions: total

 Tests  Dependent
  ${c('red', 'none')}  lib/shop/workers/report_worker.ex
     ${c('green', '1')}  lib/shop/cart.ex
     ${c('green', '1')}  lib/shop/receipt.ex

${c('amber', 'No test reaches 1 of the files that call what changed;\nan integration test is probably missing')}`,

  gate: `${prompt('km score --trend main --fail-if-worse \\\n           --gate-scope changed')}${c('red', 'error: quality gate failed:')}
  src/cart.rs dropped 88.73 → 86.62 (-2.11),
  below the project score and more than
  the 0.5 tolerance`,

  agents: `${prompt('km ai skill claude')}${prompt('km score --format json')}{
  ${c('blue', '"score"')}: ${c('amber', '90.98')},
  ${c('blue', '"grade"')}: ${c('green', '"A"')},
  ${c('blue', '"files_analyzed"')}: ${c('amber', '127')},
  ${c('blue', '"dimensions"')}: [ … ]
}`,
} as const;
