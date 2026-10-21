---
title: "km docs"
description: "Referencias muertas, el grafo de notas, el contexto de los agentes y documentos atrasados"
---

Medidas de la documentación: los archivos Markdown del repositorio, diga lo que diga `--kind`. `km docs refs` encuentra las referencias que no llevan a ninguna parte; `km docs links` lee los enlaces entre notas como un grafo; `km docs context` mide los archivos que dirigen a los agentes de código; `km docs stale` encuentra los documentos atrasados respecto del código que describen. Para un cambio aún no mergeado, [`km impact`](/docs/impact#documentación-que-quedó-atrás) lista los documentos que deja atrás.

## `km docs refs`

La documentación se refiere al código: archivos, directorios, encabezados de otros documentos. Cuando el código avanza, esas referencias mueren sin que nadie lo note, y un archivo de instrucciones para agentes de código que nombra un archivo que ya no está manda al agente por el camino equivocado. `km docs refs` lee los documentos Markdown del repositorio y lista las referencias que no llevan a ninguna parte.

```bash
km docs refs [ruta]
km docs refs --since-ref origin/main --fail-on-dead   # en CI
km docs refs --format github                          # anotaciones en el pull request
```

| Qué | Muerta cuando |
|-----|---------------|
| Links e imágenes: `[texto](ruta)`, `![alt](ruta)`, `[etiqueta]: ruta`, `<a href>`, `<img src>` | el archivo no existe, desde el documento, o desde la raíz del repositorio para una ruta que empieza con `/` |
| Anclas: `ruta.md#encabezado`, `#encabezado` | el documento Markdown no tiene ese encabezado, nombrado como lo nombra GitHub (`## Instalación` es `#instalación`), ni un elemento con ese `id` o `name` |
| Rutas en code spans: `` `src/kind.rs` ``, `` `scripts/` ``, `` `src/kind.rs:42` `` | el repositorio tuvo esa ruta alguna vez y ya no la tiene |

Una ruta en un code span está viva cuando existe desde el documento o desde la raíz, o cuando es el final de una ruta del repositorio (`` `deps/graph.rs` `` nombra `src/deps/graph.rs`). Cuenta como muerta solo si la historia del repositorio la tuvo alguna vez, así que la estructura de un ejemplo (`` `src/lib.rs` `` en una guía sobre paquetes de Rust) o un archivo que un plan aún no crea no se toman por una. Fuera de un repositorio git, una ruta se lee cuando su primer nombre es el de un archivo o directorio del árbol. Las URLs nunca se descargan; un link absoluto sin extensión (`/docs/score/`) es una ruta de un sitio construido con los documentos, no un archivo. El código en bloques (con cercas o indentado), el front matter y los comentarios HTML no se refieren a nada.

Con `--since-ref`, los documentos cambiados desde la ref conservan todas sus referencias muertas, y los demás solo las que nombran un archivo que el cambio tocó: un pull request que borra o mueve un archivo sabe qué documentos aún lo nombran.

| Flag | Descripción |
|------|-------------|
| `--since-ref REF` | Solo los documentos cambiados desde REF, y las referencias a archivos cambiados desde ella |
| `--fail-on-dead` | Termina con código 1 si encuentra una referencia muerta |
| `--include-tests` | Lee también los documentos bajo directorios de tests (se omiten por defecto, como fixtures) |
| `--format {table,json,short,terse,github,codeclimate}` | Formato de salida (por defecto: table). `terse` imprime el número de referencias muertas |

Ejemplo de salida:

```
────────────────────────────────────────────────────────────────────
 Document            Line Reference               Problem
────────────────────────────────────────────────────────────────────
 docs/guide.md         42 src/parser/old.rs       no such path
 docs/guide.md         57 ../README.md#install    no such heading
 tools/README.md        9 baselines/run.sh        no such file
────────────────────────────────────────────────────────────────────
 3 dead of 512 references, in 2 of 38 documents
```

El JSON lista `documents`, `references` y cada referencia muerta con su `document`, `line`, `reference`, `form` (`link`, `image` o `code`) y `missing` (`file`, `heading` o `path`). `km ai` ofrece el comando a un LLM como la herramienta `km_docs_refs`.

## `km docs links` -- El grafo de notas

Una base de conocimiento, un sitio de documentación o un segundo cerebro es un grafo de notas, y su salud es una propiedad de ese grafo: notas a las que nada enlaza, links que no llevan a ninguna parte, unas pocas notas de las que todo depende, grupos de notas aislados del resto. `km docs links` lee los links entre documentos Markdown y los reporta.

```bash
km docs links [ruta]
km docs links kb/ --top 50
km deps --kind docs --matrix   # el mismo grafo con las herramientas de dependencias
```

| Link | Lleva a |
|------|---------|
| `[texto](ruta.md)` | el documento en esa ruta, desde el que enlaza (desde el directorio recorrido para una ruta que empieza con `/`) |
| `[[Nota]]`, `[[kb/Nota\|texto]]`, `![[Nota]]` | un wikilink, como lo resuelven Obsidian, Foam y Logseq: por ruta desde la raíz, si no por nombre de nota, sin mayúsculas ni extensión; de varias notas con ese nombre, la más cercana |

Las URLs y las anclas solas no enlazan a ninguna nota, y un link a un archivo que no es documento no es una arista. Un link absoluto sin extensión es una ruta de un sitio.

| Se reporta | Qué |
|------------|-----|
| Links rotos | ningún archivo tiene la ruta, ninguna nota el nombre |
| Huérfanas | notas a las que no enlaza ninguna nota, salvo los puntos de entrada: README, index, SUMMARY, CLAUDE, AGENTS, CHANGELOG, CONTRIBUTING y similares |
| Hubs | las notas más enlazadas |
| Islas | grupos de notas enlazadas entre sí y con ningún otro grupo, salvo el mayor |

Con `--kind docs`, `km deps` construye el mismo grafo: fan-in y fan-out de cada nota, ciclos, `--matrix` y su página HTML, y los links rotos como imports sin resolver. Sin `--kind`, los documentos quedan fuera del grafo de dependencias como antes.

| Flag | Descripción |
|------|-------------|
| `--top N` | Filas de cada tabla (por defecto: 20); el JSON lista todas las entradas salvo que se indique |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table). `terse` imprime el número de links rotos |

## `km docs context` -- Archivos que dirigen a los agentes de código

`CLAUDE.md`, `AGENTS.md`, las reglas de Cursor y Copilot, las skills y las definiciones de agentes y comandos se cargan en el contexto del modelo. Crecen, se repiten entre sí y sus reglas se acumulan, mientras los modelos usan peor los contextos largos, y peor aún lo que queda al medio (Liu et al., *Lost in the Middle*, TACL 2024). `km docs context` los mide. No llama a ningún modelo.

```bash
km docs context [ruta]
km docs context --max-tokens 8000   # en CI
```

| Rol | Archivos |
|-----|----------|
| `instructions` | `CLAUDE.md`, `CLAUDE.local.md`, `AGENTS.md`, `GEMINI.md`, leídos en cada tarea bajo su directorio |
| `rules` | `.cursorrules`, `.cursor/rules/`, `.windsurfrules`, `.github/copilot-instructions.md`, `.github/instructions/` |
| `skill`, `agent`, `command` | `.claude/skills/` (y cualquier `SKILL.md`), `.claude/agents/`, `.claude/commands/` |

| Medida | Qué |
|--------|-----|
| Tokens | aproximados: caracteres / 4 |
| Cargas | lo que lee junto un agente que trabaja en un directorio: las instrucciones de su familia (`claude`, `agents`, `gemini`) desde el directorio analizado hasta él, así un directorio profundo muestra su presupuesto real |
| Reglas | líneas de prosa que piden algo (`must`, `never`, `always`, `do not`, `should`, `debe`, `nunca`, `siempre`, …): una medida gruesa de cuánto se pide |
| Repetidas | líneas de prosa presentes en más de un archivo de contexto; un enlace como `AGENTS.md → CLAUDE.md` no repite nada |
| Muertas | las referencias que [`km docs refs`](/docs/docs#km-docs-refs) encuentra muertas |
| Commits, Cambio | cuántas veces cambió cada archivo y cuándo fue la última, en un repositorio git |

`--max-tokens N` termina con código 1 cuando una carga pasa de N tokens. Los archivos ignorados por git no se leen, y `.claude/` suele estarlo; `--kind` no aplica, los flags de exclusión sí.

| Flag | Descripción |
|------|-------------|
| `--max-tokens N` | Termina con código 1 cuando una carga pasa de N tokens |
| `--top N` | Filas de cada tabla (por defecto: 20); el JSON lista todas las entradas |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table). `terse` imprime los tokens de la carga mayor |

## `km docs stale`

La auditoría de una base de conocimiento a lo largo del tiempo: los documentos cuyo código cambió después que ellos. Donde [`km impact`](/docs/impact#documentación-que-quedó-atrás) vigila un cambio antes de mergearlo, `km docs stale` mira el repositorio entero tal como está.

```bash
km docs stale [ruta]
km docs stale kb/ --top 50
```

Un documento describe un archivo como lo lee `km impact`: lo cubre (`covers:` en su front matter, o `[docs] covers` en `.kimun.toml`) o lo nombra (un link, una ruta en un code span, entera o por su final, o un directorio de dos nombres o más sobre él). Los documentos nunca son descritos, y se omiten los changelogs y los globs de `[docs] ignore`. Un documento está atrasado cuando un archivo que describe cambió después del último cambio del documento, en la historia commiteada.

```
───────────────────────────────────────────────────────────────────────────────
 Document                 Updated     Behind  Commits  Describes
───────────────────────────────────────────────────────────────────────────────
 kb/payments/refunds.md   2026-01-10    143d       12  apps/payments/lib/refund.ex (+3)
 docs/architecture.md     2026-04-02     51d        3  lib/billing/invoice.ex
───────────────────────────────────────────────────────────────────────────────
 2 of 38 documents are behind the code they describe
```

`Behind` es el tiempo entre el último cambio del documento y el último cambio de lo que describe, de mayor a menor; `Commits`, los commits distintos a esos archivos desde que cambió el documento. El JSON lista cada documento atrasado, con `updated`, `days_behind`, `commits` y cada archivo con `changed` y `commits`.

| Flag | Descripción |
|------|-------------|
| `--top N` | Filas de la tabla (por defecto: 20); el JSON lista todos los documentos salvo que se indique |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table). `terse` imprime el número de documentos atrasados |
