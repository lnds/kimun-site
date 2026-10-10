---
title: "km hotspots"
description: "Análisis de hotspots"
---

Encuentra hotspots: archivos que cambian con frecuencia Y además tienen alta complejidad. Se basa en el método de Adam Thornhill ("Your Code as a Crime Scene").

```bash
km hotspots [path]
```

## Fórmula

```
Score = Commits × Complexity
```

Los archivos con puntaje alto concentran el riesgo: cambian mucho y son complejos, así que son los candidatos más valiosos para refactorizar.

Por defecto, la complejidad se mide con la **indentación total** (la suma de los niveles lógicos de indentación de todas las líneas de código), siguiendo el método original de Thornhill en "Your Code as a Crime Scene". Usa `--complexity cycom` para medirla con la complejidad ciclomática.

Requiere un repositorio git. Los commits de merge se excluyen de la cuenta.

Opciones:

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--include-tests` | Incluye los archivos de test en el análisis (excluidos por defecto) |
| `--top N` | Muestra solo los N primeros archivos (por defecto: 20) |
| `--sort-by METRIC` | Ordena por `score`, `commits` o `complexity` (por defecto: `score`) |
| `--since DURATION` | Considera solo los commits desde este momento (p. ej. `30d`, `6m`, `1y`) |
| `--complexity METRIC` | `indent` (por defecto, Thornhill) o `cycom` (ciclomática) |

Unidades de duración: `d` (días), `m` (meses, aprox. 30 días), `y` (años, aprox. 365 días).

Ejemplo de salida (por defecto, complejidad por indentación):

```
Hotspots (Commits × Total Indent Complexity)
──────────────────────────────────────────────────────────────────────────────
 File                    Language Commits Total Indent      Score
──────────────────────────────────────────────────────────────────────────────
 src/main.rs                 Rust      18        613      11034
 src/loc/counter.rs          Rust       7       1490      10430
 src/dups/detector.rs        Rust       7       1288       9016
 src/dups/mod.rs             Rust       9        603       5427
 src/report/mod.rs           Rust       4        998       3992
──────────────────────────────────────────────────────────────────────────────

Score = Commits × Total Indentation (Thornhill method).
High-score files are change-prone and complex — prime refactoring targets.
```

Ejemplo de salida (`--complexity cycom`):

```
Hotspots (Commits × Cyclomatic Complexity)
──────────────────────────────────────────────────────────────────────────────
 File                     Language Commits Cyclomatic      Score
──────────────────────────────────────────────────────────────────────────────
 src/loc/counter.rs           Rust       7        115        805
 src/dups/mod.rs              Rust       9         44        396
 src/main.rs                  Rust      18         21        378
 src/cycom/analyzer.rs        Rust       4         92        368
 src/dups/detector.rs         Rust       7         46        322
──────────────────────────────────────────────────────────────────────────────

Score = Commits × Cyclomatic Complexity.
High-score files are change-prone and complex — prime refactoring targets.
```
