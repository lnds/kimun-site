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
| `magic_number` | Literales numéricos sueltos en el código, salvo 0, 1, 2, -1 y los valores que ya tienen nombre |
| `commented_code` | Dos o más líneas de comentario consecutivas con patrones que parecen código, fuera de la documentación |

- **`long_params`** cuenta los parámetros de la lista que sigue al nombre de la función (no son esa lista el receptor de Go ni la llamada a la que se pasa una función), separados por sus comas de nivel superior: las comas dentro de argumentos de tipo (`Node<K, V>`), patrones (`%{...}`, `<<...>>`), literales y llamadas anidadas no separan nada.
- **`magic_number`** deja fuera las declaraciones, con cualquier modificador antes de la palabra clave (`private static final`, `public const`), las asignaciones a nombres en mayúsculas (`MAX_RETRIES = 5`) y los datos que abre una declaración: los miembros de un `enum`, un bloque `const (...)` de Go, los elementos de una tabla, las alternativas de una unión `type`. Un literal que es el valor de una clave (`connect: 3`, `"MAX": 4093`) o el valor por defecto de un parámetro también tiene nombre. El cuerpo de una función declarada con una de esas palabras clave (`export function`, `static int f() {`) se sigue revisando.
- **`commented_code`** deja fuera la documentación, donde el código es un ejemplo: las líneas `///` y `//!`, los bloques `/** */` y `/*! */` (JSDoc, Javadoc, doctests de Rust, documentación XML de C#) y un comentario de documentación de Go con un ejemplo indentado con tabulación justo encima de una declaración.

Opciones:

| Flag | Descripción |
|------|-------------|
| `--top N` | Filas de la tabla (por defecto: 20); el JSON lista todos los archivos salvo que se indique `--top` |
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
