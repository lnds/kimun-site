---
title: "km knowledge"
description: "Análisis de propiedad del código"
---

Analiza los patrones de propiedad del código con git blame (mapas de conocimiento). Se basa en el método de Adam Thornhill ("Your Code as a Crime Scene", capítulos 8 y 9).

```bash
km knowledge [path]
```

Identifica el riesgo de bus factor y la concentración del conocimiento por archivo. Los archivos generados (archivos lock, JS minificado, archivos que dicen ser generados, ver [Archivos generados, datos y prosa](/docs/dups#archivos-generados-datos-y-prosa)) se excluyen automáticamente.

## Niveles de riesgo

| Riesgo | Condición | Significado |
|------|-----------|---------|
| CRITICAL | 1 persona es dueña de más del 80% | Alto riesgo de bus factor |
| HIGH | 1 persona es dueña del 60-80% | Concentración significativa |
| MEDIUM | 2-3 personas son dueñas de más del 80% entre todas | Concentración moderada |
| LOW | Bien distribuido | Propiedad sana |

## Detección de pérdida de conocimiento

Usa `--since` para definir qué es "actividad reciente". Si el dueño principal de un archivo no tiene commits en ese período, el archivo se marca con riesgo de **pérdida de conocimiento**; si nadie hizo commits en el período, se marcan todos. Usa `--risk-only` para mostrar solo esos archivos; requiere `--since`. El conteo final es de todos los archivos en riesgo, junto con cuántos muestra `--top`.

Las cuentas de bots (`dependabot[bot]`, `github-actions[bot]`) no tienen conocimiento: sus líneas quedan fuera, y un archivo que solo escribieron bots no se lista. También quedan fuera los archivos generados y los de datos o prosa (JSON, YAML, Markdown, texto).

## Quién escribió cada línea

La propiedad sale del blame del archivo tal como está commiteado en `HEAD`. Cuando el programa `git` está instalado, kimun ejecuta `git blame -w -M -C`: un cambio de espacios conserva al autor de la línea, y también lo conserva el código movido dentro de un archivo o desde otro archivo que cambió el mismo commit. Las revisiones listadas en `.git-blame-ignore-revs` (o en el archivo que indica `blame.ignoreRevsFile`) se omiten, así que un reformateo masivo no se queda con las líneas. Sin `git`, el blame lo hace libgit2: omite los cambios de espacios, pero no sigue el código movido ni ignora revisiones. `km authors` y `km loc --by-author` leen el blame de la misma forma.

Opciones:

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--include-tests` | Incluye los tests, ejemplos y benchmarks en el análisis (excluidos por defecto) |
| `--top N` | Filas de la tabla (por defecto: 20); el JSON lista todos los archivos salvo que se indique `--top` |
| `--sort-by METRIC` | Ordena por `concentration`, `diffusion` o `risk` (por defecto: `concentration`) |
| `--since DURATION` | Define la ventana de actividad reciente para la pérdida de conocimiento (p. ej. `6m`, `1y`, `30d`) |
| `--risk-only` | Muestra solo los archivos con riesgo de pérdida de conocimiento |
| `--summary` | Agrupa por autor: archivos de los que es dueño, líneas, lenguajes, peor riesgo |
| `--bus-factor` | Muestra el bus factor del proyecto: cuántos colaboradores tienen que irse para que la mayor parte del código quede sin autor |
| `--bus-factor-threshold PCT` | Porcentaje del código, en líneas, hasta el que cuenta el bus factor (por defecto: 50) |
| `--author NAME` | Muestra solo los archivos cuyo dueño es este autor (busca la subcadena sin distinguir mayúsculas) |

Ejemplo de salida:

```
Knowledge Map — Code Ownership
──────────────────────────────────────────────────────────────────────────────
 File                       Language  Lines  Owner         Own%  Contrib  Risk
──────────────────────────────────────────────────────────────────────────────
 src/loc/counter.rs             Rust    731  E. Diaz        94%        2  CRITICAL
 src/main.rs                    Rust    241  E. Diaz        78%        3  HIGH
 src/walk.rs                    Rust    145  E. Diaz        55%        5  MEDIUM
──────────────────────────────────────────────────────────────────────────────

Files with knowledge loss risk (primary owner inactive): 1
  src/legacy.rs (Former Dev)
```

Usa `--bus-factor` para calcular cuántos colaboradores tienen que irse para que la mayor parte del código quede sin nadie que lo haya escrito (el *truck factor* de Avelino et al., "A novel approach for estimating truck factors", ICPC 2016):

- Los **autores de un archivo** son aquellos a quienes blame les da al menos el 75% de las líneas de su autor principal. Un colaborador con unas pocas líneas en un archivo no es uno de sus autores.
- Los colaboradores se van de a uno, primero el que es autor de más líneas, hasta que más del 50% del código queda en archivos sin autor. El bus factor es cuántos se fueron. Los archivos pesan según sus líneas, así que un archivo de una línea no cuenta tanto como el núcleo del proyecto, y una cola larga de colaboradores ocasionales no sube el número.
- Con `--since`, los autores sin commits en esa ventana ya se fueron: el código que solo ellos escribieron queda huérfano antes de contar a nadie. Si eso ya supera el umbral, el bus factor es 0.
- Las personas se distinguen por email, leído a través de `.mailmap`, así que una dirección con varios nombres, o varias direcciones que el mailmap junta, son una sola persona. Esto también vale para `--summary`, `km authors` y `km loc --by-author`.

```
$ km knowledge --bus-factor --since 1y
Project Bus Factor: 2

 12% of the code is already in files whose authors have not committed in 1y.
 If these 2 contributors leave, 71% of the code is in files with no author left.
 Risk: HIGH — two people hold critical knowledge
 Authors of a file hold at least 75% of the lines of its main author; files weigh by lines; threshold 50%.

──────────────────────────────────────────────────────────────────────
 Rank  Author                Files     Lines    Share  Orphaned
──────────────────────────────────────────────────────────────────────
    1  E. Diaz                  41      8420   68.12%     48.3%
    2  A. Torres                 9      1490   12.06%     71.0%
    3  R. Soto                   6       940    7.61%
    4  M. Rojas (inactive)       3       610    4.94%
──────────────────────────────────────────────────────────────────────
```

`Orphaned` es el porcentaje del código que queda sin autor cuando ese colaborador y los que están más arriba se han ido.
