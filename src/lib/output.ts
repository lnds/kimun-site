// What `km` prints, abridged: the rules between rows and some columns are
// left out so it fits a card. The spans carry the colors. The numbers are
// those of kimün on itself, or of a small sample project, except for the
// gate, which shows the format with made-up values.

const c = (cls: string, text: string) => `<span class="t-${cls}">${text}</span>`;
const prompt = (cmd: string) => `${c('dim', '$')} ${cmd}\n`;

export const output = {
  score: `${prompt('km score')}
 Project Score:  ${c('green', 'A (91.7)')}
 Files Analyzed: 141
 Total LOC:      19,075

 Dimension                 Weight   Score   Grade
 Cognitive Complexity         30%    84.2   ${c('green', 'B+')}
 Duplication                  20%   100.0   ${c('green', 'A++')}
 Indentation Complexity       15%    93.1   ${c('green', 'A+')}
 Halstead Effort              20%    87.5   ${c('green', 'A-')}
 File Size                    15%   100.0   ${c('green', 'A++')}

 ${c('amber', 'Files Needing Attention')}
  60.7  ${c('red', 'D')}    src/deps/analyzer.rs      Cognitive: 36
  63.8  ${c('red', 'D+')}   src/cogcom/analyzer.rs    Cognitive: 35
  72.4  ${c('amber', 'C')}    src/smells/rules.rs       Cognitive: 20`,

  scoreShort: `${prompt('km score')} Project Score:  ${c('green', 'A (91.7)')}
 Files Analyzed: 141
 Total LOC:      19,075`,

  loc: `${prompt('km loc')} Language     Files   Blank  Comment    Code
 Rust           140    2637     3885   20170
 Markdown         4     953        0    2627
 YAML             3      35        1     174`,

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
  ${c('blue', '"score"')}: ${c('amber', '91.72')},
  ${c('blue', '"grade"')}: ${c('green', '"A"')},
  ${c('blue', '"files_analyzed"')}: ${c('amber', '141')},
  ${c('blue', '"dimensions"')}: [ … ]
}`,
} as const;
