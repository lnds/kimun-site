---
title: "km cogcom"
description: "Complejidad cognitiva"
---

Calcula la complejidad cognitiva por archivo y por función con el [método de SonarSource](https://www.sonarsource.com/docs/CognitiveComplexity.pdf) (2017). A diferencia de la complejidad ciclomática, la complejidad cognitiva mide qué tan difícil es *entender* el código: penaliza las estructuras muy anidadas y premia el flujo de control lineal.

```bash
km cogcom [path]
```

Opciones:

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse,github,codeclimate}` | Formato de salida (por defecto: table). `github` emite anotaciones de GitHub Actions; `codeclimate` (alias: `gitlab`) emite JSON de CodeClimate para GitLab Code Quality |
| `--include-tests` | Incluye los tests, ejemplos y benchmarks en el análisis (excluidos por defecto) |
| `--top N` | Filas de la tabla (por defecto: 20); el JSON lista todos los archivos salvo que se indique `--top` |
| `--min-complexity N` | Omite los archivos cuya función más compleja está por debajo de N; con `--per-function`, oculta también las funciones por debajo de N (por defecto: 1) |
| `--per-function` | Muestra el desglose por función |
| `--sort-by METRIC` | Ordena por `total`, `max` o `avg` (por defecto: `total`) |

En los lenguajes de llaves una función termina donde sus llaves se balancean. Un cuerpo introducido por `=` (`fn f(x) = expr`, como en Kaikai, Kotlin o Scala) no tiene una llave de cierre propia: sigue mientras sus llaves estén abiertas y las líneas siguientes tengan más indentación que la declaración. `km cycom` encuentra las funciones de la misma manera.

Las palabras clave y las llaves se leen en orden a lo largo de cada línea, así que el código escrito en una línea obtiene el mismo puntaje que en varias: `if (a) { return 1 } else { return 2 }` es 2, y `for (v of xs) { if (y) { return v } }` es 3. El bloque de una palabra clave de control se abre en la siguiente `{`, en su misma línea o, en estilo Allman, en la siguiente; `else if` anida su bloque igual que `if` y `else`.

En Elixir, `with`, `unless` y `receive` son incrementos estructurales como `case`, y `and`, `or`, `&&` y `||` cuentan como secuencias booleanas. Para `km cycom`, cada cláusula (`->`) de un `case`, `cond`, `receive` o `fn` de varias cláusulas es una rama, igual que cada etiqueta `case` de C, y `with`, `unless`, `and`, `or`, `&&` y `||` suman uno cada uno.
