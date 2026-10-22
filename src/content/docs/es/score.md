---
title: "km score"
description: "Puntaje de salud del código"
---

Calcula un puntaje general de salud del código para el proyecto, con una nota que va de A++ (excepcional) a F-- (problemas graves). Usa solo métricas estáticas (no requiere git).

Hay tres modelos de puntaje: `cogcom`, el modelo por defecto, basado en la complejidad cognitiva (5 dimensiones); `cogcom-0.35`, las mismas dimensiones con los pesos que tenían hasta la v0.35; y `legacy`, basado en el índice de mantenibilidad y la complejidad ciclomática (6 dimensiones).

Los archivos que no son código (Markdown, TOML, JSON, etc.) se excluyen automáticamente. Los bloques de test en línea (`#[cfg(test)]`) se excluyen de todas las dimensiones, ver [Tests en línea](/docs/dups#tests-en-línea).

```bash
km score [path]
km score --model cogcom-0.35 [path]  # los pesos hasta la v0.35
km score --model legacy [path]    # modelo de MI + ciclomática
```

## Dimensiones y pesos (por defecto: cogcom)

| Dimensión | Peso | Qué mide |
|-----------|--------|-----------------|
| Complejidad cognitiva | 32% | Método de SonarSource, penaliza el anidamiento |
| Duplicación | 21% | % de código duplicado en todo el proyecto |
| Complejidad por indentación | 16% | Desviación estándar de la profundidad de indentación |
| Esfuerzo de Halstead | 21% | Esfuerzo mental por LOC |
| Tamaño de archivo | 10% | Puntaje completo hasta 500 LOC; baja a 0 en 4.000 |

Hasta la v0.35 el tamaño de archivo pesaba 15%, y las demás dimensiones 30%, 20%, 15% y 20%. Ahora pesa menos porque el tamaño ya influye en las otras dimensiones: un archivo grande tiene más código que puede ser complejo, y el puntaje del proyecto es un promedio ponderado por líneas de código. Los estudios sobre módulos encuentran que los defectos crecen menos que proporcionalmente con el tamaño, así que partir un archivo no lo hace por sí solo menos propenso a fallas; lo que el tamaño mide bien es el costo de leerlo y cambiarlo. Los cinco puntos pasaron a las demás dimensiones en proporción a sus pesos. `--model cogcom-0.35` calcula con los pesos anteriores, para comparar con resultados previos o para mantener una compuerta de CI donde estaba.

## Modelo experimental (--experimental)

`km score --experimental` calcula con el Maintainability Index (variante de Visual Studio, 0–100) en lugar del esfuerzo de Halstead, con su mismo peso (21%), y muestra al lado el puntaje del modelo por defecto, a partir de la misma medición. El MI pondera juntos el volumen de Halstead, la complejidad ciclomática y el tamaño; un archivo obtiene 0 con MI 0, 40 con 5, 60 con 10, 80 con 20 (donde Visual Studio pasa a verde), 90 con 30, 97 con 45 y 100 desde 60. A diferencia de las demás dimensiones, el MI del proyecto es el promedio simple de sus archivos, sin ponderar por líneas: el MI ya baja con el tamaño de un archivo, y ponderarlo contaría el tamaño dos veces. Sirve para probar la dimensión, no para compuertas: no se puede combinar con `--model` ni con `--trend`.

En los proyectos donde se probó, el puntaje experimental queda a unos 1,5 puntos del normal, en el mismo orden: el MI sigue de cerca a Halstead, del que en buena parte se calcula. Un proyecto cuyo peor código está en unos pocos archivos grandes entre muchos chicos obtiene más que con el modelo por defecto (jq: F 51,3 contra D 60,5), porque cada archivo cuenta una vez.

```
 Experimental: Maintainability Index (Visual Studio) in place of Halstead Effort.
 Default model: B+ (83.2)  →  experimental: B (81.8), -1.5
```

`--format json` agrega un objeto `baseline` con el puntaje y la nota del modelo por defecto; `--format short` agrega una línea `baseline`.

## Dimensiones y pesos (--model legacy)

| Dimensión | Peso | Qué mide |
|-----------|--------|-----------------|
| Índice de mantenibilidad | 30% | MI de verifysoft, normalizado a 0-100 |
| Complejidad ciclomática | 20% | Complejidad máxima por archivo |
| Duplicación | 15% | % de código duplicado en todo el proyecto |
| Complejidad por indentación | 15% | Desviación estándar de la profundidad de indentación |
| Esfuerzo de Halstead | 15% | Esfuerzo mental por LOC |
| Tamaño de archivo | 5% | Puntaje completo hasta 500 LOC; baja a 0 en 4.000 |

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
| `--model MODEL` | Modelo de puntaje: `cogcom` (por defecto), `cogcom-0.35` (los pesos hasta la v0.35) o `legacy` (MI + ciclomática) |
| `--experimental` | Calcula con el Maintainability Index en lugar del esfuerzo de Halstead, comparado con el modelo por defecto |
| `--trend [REF]` | Compara el puntaje actual con una ref de git (por defecto: `HEAD`). Muestra el cambio: `B- → B (+2.3)`. Útil para revisar un PR: `--trend origin/main` |
| `--fail-if-worse` | Con `--trend`: termina con código 1 si el puntaje bajó más que `--gate-tolerance` |
| `--gate-tolerance POINTS` | Caída de puntaje que `--fail-if-worse` permite antes de fallar (por defecto: `0.01` con `--gate-scope project`, `0.5` con `--gate-scope changed`). Compara los puntajes sin redondear |
| `--gate-scope {project,changed}` | Qué compara `--fail-if-worse` (por defecto: `project`, el puntaje agregado). `changed` mira solo los archivos que toca el diff: falla si un archivo modificado o renombrado termina por debajo del puntaje que el proyecto tenía en la ref después de bajar más que `--gate-tolerance`, o si crecen las líneas duplicadas del proyecto. Los archivos por encima del puntaje del proyecto, los archivos nuevos y los eliminados nunca la hacen fallar, así que quitar código sano no puede empeorar el veredicto. El informe lista cada archivo modificado con su puntaje de antes y de después |
| `--fail-below GRADE` | Con `--trend`: termina con código 1 si la nota está por debajo de `GRADE` (p. ej. `B-`). Se puede sobrescribir en `.kimun.toml` |
| `--badge ARCHIVO` | Escribe un badge del puntaje: un SVG, o el JSON de un badge endpoint de shields.io cuando `ARCHIVO` termina en `.json` (mira [Badge](/docs/score#badge)) |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--include-tests` | Incluye los tests, ejemplos y benchmarks en el análisis (excluidos por defecto) |
| `--bottom N` | Cantidad de peores archivos que se muestran en "needs attention" (por defecto: 10) |
| `--min-lines N` | Mínimo de líneas para un bloque duplicado (por defecto: 6) |

Ejemplo de salida:

```
Code Health Score
──────────────────────────────────────────────────────────────────
 Project Score:  A (91.2)
 Files Analyzed: 142
 Total LOC:      19,084
──────────────────────────────────────────────────────────────────
 Dimension                 Weight   Score   Grade
──────────────────────────────────────────────────────────────────
 Cognitive Complexity         32%    84.1   B+
 Duplication                  21%   100.0   A++
 Indentation Complexity       16%    93.2   A+
 Halstead Effort              21%    87.5   A-
 File Size                    10%   100.0   A++
──────────────────────────────────────────────────────────────────

 Files Needing Attention (worst per-file scores, excl. duplication)
──────────────────────────────────────────────────────────────────
 Score  Grade  File                       Issues
──────────────────────────────────────────────────────────────────
  57.7  D-     ./src/deps/analyzer.rs     Cognitive: 36
  61.0  D      ./src/cogcom/analyzer.rs   Cognitive: 35
  70.3  C      ./src/smells/rules.rs      Cognitive: 20
  71.6  C      ./src/hal/tokenizer.rs     Cognitive: 22
  71.8  C      ./src/loc/mod.rs           Cognitive: 19
  72.8  C      ./src/knowledge/mod.rs     Cognitive: 21
  73.8  C+     ./src/dups/mod.rs          Cognitive: 19
  75.0  C+     ./src/cli_help.rs          Cognitive: 17
  75.6  C+     ./src/test_blocks.rs       Cognitive: 17
  77.3  B-     ./src/walk.rs              Cognitive: 16
──────────────────────────────────────────────────────────────────
```

## Badge

`--badge ARCHIVO` escribe un badge del puntaje para un README, además del informe: un SVG autocontenido con el estilo plano de shields.io, coloreado según la letra de la nota (A verde, B verde claro, C amarillo, D naranja, F rojo), o, cuando `ARCHIVO` termina en `.json`, el JSON de un [badge endpoint de shields.io](https://shields.io/badges/endpoint-badge).

```bash
km score --badge .github/km-score.svg
```

```markdown
[![km score](.github/km-score.svg)](https://kimun.tools)
```

Un badge guardado en el repositorio está tan al día como su última ejecución, y un workflow no puede hacer commit en una rama protegida. Para mantenerlo vigente, [kimun-action](https://github.com/lnds/kimun-action) lo hace en GitHub Actions: instala `km`, escribe las dos formas del badge y, con `actions/deploy-pages`, las publica en GitHub Pages en cada push. El README apunta entonces a `https://OWNER.github.io/REPO/km-score.svg`, o a `https://img.shields.io/endpoint?url=https://OWNER.github.io/REPO/km-score.json`. Su README tiene el workflow completo.

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
| `--model MODEL` | Modelo de puntaje: `cogcom` (por defecto), `cogcom-0.35` o `legacy` |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--bottom N` | Cantidad de peores archivos que se muestran (por defecto: 10) |
| `--min-lines N` | Mínimo de líneas para un bloque duplicado (por defecto: 6) |
