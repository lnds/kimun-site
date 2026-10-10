---
title: "km smells"
description: "Detección de code smells"
---

Detecta problemas comunes de calidad del código por archivo con heurísticas basadas en texto (no requiere AST). Solo se analizan los lenguajes que tienen marcadores de complejidad (el mismo conjunto que `km cycom`: Rust, Python, JS/TS, C/C++, Go, etc.).

```bash
km smells [path]
```

## Tipos de smell

| Smell | Descripción |
|-------|-------------|
| `long_function` | El cuerpo de la función supera `--max-lines` (por defecto: 50) |
| `long_params` | La función tiene más de `--max-params` parámetros (por defecto: 4) |
| `todo_debt` | TODO, FIXME, HACK, XXX o BUG en líneas de comentario |
| `magic_number` | Literales numéricos sueltos en el código (sin contar 0, 1, 2, -1 ni las declaraciones `const`/`let`) |
| `commented_code` | Dos o más líneas de comentario consecutivas con patrones que parecen código |

Opciones:

| Flag | Descripción |
|------|-------------|
| `--top N` | Muestra solo los N primeros archivos por cantidad de smells (por defecto: 20) |
| `--max-lines N` | Máximo de líneas del cuerpo de una función antes de marcarla (por defecto: 50) |
| `--max-params N` | Máximo de parámetros antes de marcarla (por defecto: 4) |
| `--files FILE` | Analiza solo estos archivos (se puede repetir). Útil para scripts |
| `--since-ref REF` | Analiza solo los archivos modificados desde esta ref de git (p. ej. `origin/main`, `HEAD~1`). Ideal para CI |
| `--format {table,json,short,terse,github,codeclimate}` | Formato de salida (por defecto: table). `github` emite anotaciones de GitHub Actions; `codeclimate` (alias: `gitlab`) emite JSON de CodeClimate para GitLab Code Quality |

La tabla desglosa por tipo la cantidad de smells de cada archivo, con una columna por tipo de smell (`magic`, `long`, `param`, `todo`, `comm`) y un total por columna en el pie.

Ejemplo de salida:

```
Code Smells
──────────────────────────────────────────────────────────────────────
 File                            Total  magic  long  param  todo  comm
──────────────────────────────────────────────────────────────────────
 src/loc/counter.rs                 12      7     1      0     4     0
 src/main.rs                         6      2     0      0     4     0
 src/dups/detector.rs                3      0     2      1     0     0
──────────────────────────────────────────────────────────────────────
 Total (3 files)                    21      9     3      1     8     0
```
