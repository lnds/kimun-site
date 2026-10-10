---
title: "km score"
description: "Puntaje de salud del código"
---

Calcula un puntaje general de salud del código para el proyecto, con una nota que va de A++ (excepcional) a F-- (problemas graves). Usa solo métricas estáticas (no requiere git).

> **Cambio incompatible en v0.14:** el modelo de puntaje por defecto pasó de MI + complejidad ciclomática (6 dimensiones) a complejidad cognitiva (5 dimensiones). Usa `--model legacy` para recuperar el comportamiento de v0.13.

Los archivos que no son código (Markdown, TOML, JSON, etc.) se excluyen automáticamente. Los bloques de test en línea (`#[cfg(test)]`) se excluyen del análisis de duplicación.

```bash
km score [path]
km score --model legacy [path]    # modelo de puntaje de v0.13
```

## Dimensiones y pesos (por defecto: cogcom)

| Dimensión | Peso | Qué mide |
|-----------|--------|-----------------|
| Complejidad cognitiva | 30% | Método de SonarSource, penaliza el anidamiento |
| Duplicación | 20% | % de código duplicado en todo el proyecto |
| Complejidad por indentación | 15% | Desviación estándar de la profundidad de indentación |
| Esfuerzo de Halstead | 20% | Esfuerzo mental por LOC |
| Tamaño de archivo | 15% | Rango óptimo de 50 a 300 LOC |

## Dimensiones y pesos (--model legacy)

| Dimensión | Peso | Qué mide |
|-----------|--------|-----------------|
| Índice de mantenibilidad | 30% | MI de verifysoft, normalizado a 0-100 |
| Complejidad ciclomática | 20% | Complejidad máxima por archivo |
| Duplicación | 15% | % de código duplicado en todo el proyecto |
| Complejidad por indentación | 15% | Desviación estándar de la profundidad de indentación |
| Esfuerzo de Halstead | 15% | Esfuerzo mental por LOC |
| Tamaño de archivo | 5% | Rango óptimo de 50 a 300 LOC |

Cada dimensión se agrega como un promedio ponderado por LOC sobre todos los archivos (salvo la duplicación, que es un único valor a nivel de proyecto). El puntaje del proyecto es la suma ponderada de los puntajes de todas las dimensiones.

## Escala de notas

| Nota | Rango de puntaje | Nota | Rango de puntaje |
|-------|------------|-------|------------|
| A++ | 97-100 | C+ | 73-76 |
| A+ | 93-96 | C | 70-72 |
| A | 90-92 | C- | 67-69 |
| A- | 87-89 | D+ | 63-66 |
| B+ | 83-86 | D | 60-62 |
| B | 80-82 | D- | 57-59 |
| B- | 77-79 | F | 50-56 |
| | | F- | 40-49 |
| | | F-- | 0-39 |

Opciones:

| Flag | Descripción |
|------|-------------|
| `--model MODEL` | Modelo de puntaje: `cogcom` (por defecto, v0.14+) o `legacy` (MI + ciclomática, v0.13) |
| `--trend [REF]` | Compara el puntaje actual con una ref de git (por defecto: `HEAD`). Muestra el cambio: `B- → B (+2.3)`. Útil para revisar un PR: `--trend origin/main` |
| `--fail-if-worse` | Con `--trend`: termina con código 1 si el puntaje bajó más que `--gate-tolerance` |
| `--gate-tolerance POINTS` | Caída de puntaje que `--fail-if-worse` permite antes de fallar (por defecto: `0.01` con `--gate-scope project`, `0.5` con `--gate-scope changed`). Compara los puntajes sin redondear |
| `--gate-scope {project,changed}` | Qué compara `--fail-if-worse` (por defecto: `project`, el puntaje agregado). `changed` mira solo los archivos que toca el diff: falla si un archivo modificado o renombrado termina por debajo del puntaje que el proyecto tenía en la ref después de bajar más que `--gate-tolerance`, o si crecen las líneas duplicadas del proyecto. Los archivos por encima del puntaje del proyecto, los archivos nuevos y los eliminados nunca la hacen fallar, así que quitar código sano no puede empeorar el veredicto. El informe lista cada archivo modificado con su puntaje de antes y de después |
| `--fail-below GRADE` | Con `--trend`: termina con código 1 si la nota está por debajo de `GRADE` (p. ej. `B-`). Se puede sobrescribir en `.kimun.toml` |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--include-tests` | Incluye los archivos de test en el análisis (excluidos por defecto) |
| `--bottom N` | Cantidad de peores archivos que se muestran en "needs attention" (por defecto: 10) |
| `--min-lines N` | Mínimo de líneas para un bloque duplicado (por defecto: 6) |

Ejemplo de salida:

```
Code Health Score
──────────────────────────────────────────────────────────────────
 Project Score:  B+ (84.3)
 Files Analyzed: 42
 Total LOC:      8,432
──────────────────────────────────────────────────────────────────
 Dimension                 Weight   Score   Grade
──────────────────────────────────────────────────────────────────
 Cognitive Complexity         30%    85.6   B+
 Duplication                  20%    91.3   A
 Indentation Complexity       15%    79.8   B-
 Halstead Effort              20%    85.1   B+
 File Size                    15%    89.2   A-
──────────────────────────────────────────────────────────────────

 Files Needing Attention (worst scores)
──────────────────────────────────────────────────────────────────
 Score  Grade  File                       Issues
──────────────────────────────────────────────────────────────────
  54.2  F      src/legacy/parser.rs       Cognitive: 42, Indent: 3.2
  63.7  D+     src/utils/helpers.rs       Effort: 15200, Indent: 2.4
  68.9  C-     src/core/engine.rs         Size: 1243 LOC
──────────────────────────────────────────────────────────────────
```

## `km score diff` -- Comparar el puntaje con una ref de git

Extrae el árbol de archivos en la ref indicada, calcula el puntaje de ambas instantáneas y muestra una tabla de diferencias por dimensión. Útil para revisar cómo afectan los commits a la calidad del código.

```bash
km score diff                          # compara con HEAD (cambios sin commit)
km score diff --git-ref HEAD~1         # compara con el commit anterior
km score diff --git-ref main           # compara con la rama main
km score diff --format json            # salida legible por máquinas
```

Opciones:

| Flag | Descripción |
|------|-------------|
| `--git-ref REF` | Ref de git con la que se compara (por defecto: `HEAD`) |
| `--model MODEL` | Modelo de puntaje: `cogcom` (por defecto) o `legacy` |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--bottom N` | Cantidad de peores archivos que se muestran (por defecto: 10) |
| `--min-lines N` | Mínimo de líneas para un bloque duplicado (por defecto: 6) |
