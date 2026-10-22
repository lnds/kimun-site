---
title: "km dups"
description: "Detectar código duplicado"
---

Encuentra bloques de código duplicado entre archivos con una ventana deslizante. Aplica la **Regla de Tres**: los duplicados que aparecen 3 veces o más se marcan como **CRITICAL** (se recomienda refactorizar), y los que aparecen dos veces como **TOLERABLE**.

Los archivos y directorios de tests se excluyen por defecto, porque los tests suelen contener repetición intencional.

Las ocurrencias de un grupo nunca se solapan dentro de un archivo, así que una racha de líneas repetidas (una tabla de `0xFF`) no es una copia de sí misma. Un bloque crece mientras todas sus ocurrencias sigan coincidiendo, aunque las líneas que siguen aparezcan también en otro lugar. Las líneas duplicadas de un proyecto se cuentan una vez cada una, en cuantos grupos estén, así que nunca superan las líneas de código.

```bash
km dups [path]
```

Opciones:

| Flag | Descripción |
|------|-------------|
| `-r`, `--report` | Muestra un informe detallado con la ubicación de los duplicados y muestras de código |
| `--show-all` | Muestra todos los grupos de duplicados (por defecto: los 20 primeros) |
| `--min-lines N` | Mínimo de líneas para un bloque duplicado (por defecto: 6) |
| `--include-tests` | Incluye los tests, ejemplos y benchmarks en el análisis (excluidos por defecto) |
| `--max-duplicates N` | Termina con código 1 si los grupos de duplicados superan este límite (`--max-duplicates 0` falla con cualquier duplicado) |
| `--max-dup-ratio PERCENT` | Termina con código 1 si la proporción de líneas duplicadas supera este porcentaje (p. ej. `--max-dup-ratio 5.0`) |
| `--fail-on-increase REF` | Termina con código 1 si la proporción de duplicación actual es mayor que en la ref de git indicada (p. ej. `origin/main`). Evita que la deuda crezca en silencio en CI |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |

Ejemplo de salida resumida:

```
────────────────────────────────────────────────────────────────────
 Duplication Analysis

 Total code lines:                                             3247
 Duplicated lines:                                              156
 Duplication:                                                  4.8%

 Duplicate groups:                                               12
 Files with duplicates:                                           8
 Largest duplicate:                                        18 lines

 Rule of Three Analysis:
   Critical duplicates (3+):     7 groups,    96 lines
   Tolerable duplicates (2x):    5 groups,    60 lines

 Assessment:                                                    Good
────────────────────────────────────────────────────────────────────
```

Ejemplo de salida detallada (`--report`):

```
────────────────────────────────────────────────────────────────────
 [1] CRITICAL: 18 lines, 3 occurrences (36 duplicated lines)

   src/parser.rs:45-62
   src/formatter.rs:120-137
   src/validator.rs:89-106

 Sample:
   fn process_tokens(input: &str) -> Vec<Token> {
       let mut tokens = Vec::new();
       for line in input.lines() {
       ...

────────────────────────────────────────────────────────────────────
 [2] TOLERABLE: 12 lines, 2 occurrences (12 duplicated lines)

   src/main.rs:100-111
   src/cli.rs:200-211

 Sample:
   match result {
       Ok(value) => {
       ...
────────────────────────────────────────────────────────────────────
```

## Patrones de test excluidos

Por defecto, `km dups` omite los archivos que siguen las convenciones habituales de test:

- **Directorios**: `tests/`, `test/`, `__tests__/`, `spec/`, y los proyectos de prueba de .NET, con el nombre de lo que prueban (`App.Tests/`, `Orders.UnitTests/`, `Api.IntegrationTest/`)
- **Ejemplos y benchmarks**: `examples/`, `example/`, `benches/`, `bench/`, `benchmarks/`, `benchsuite/`, código que se ejecuta para mostrar o medir el proyecto y no se distribuye con él
- **Por extensión**: `*_test.rs`, `*_test.go`, `test_*.py`, `*.test.js`, `*.spec.ts`, `*Test.java`, `*_test.cpp` y más
- **Módulos de test de Rust**: un archivo declarado bajo `#[cfg(test)]` sin cuerpo (`#[cfg(test)] mod testutil;`, con o sin `#[path]`), y los módulos que están debajo de él

Las mismas reglas valen para todos los comandos. Usa `--include-tests` para analizarlos también, y `--list-excluded` para ver qué archivos quedan fuera y por qué.

## Tests en línea

Rust guarda los tests dentro del archivo fuente, bajo `#[cfg(test)]`. Todo comando que mide código deja esos ítems fuera junto con los archivos de test: `dups`, `indent`, `hal`, `cycom`, `cogcom`, `mi`, `miv`, `smells`, `hotspots`, `score` y las métricas de `report`. Solo se omite el ítem bajo el atributo, así que el código que sigue a un módulo de tests sí se mide. `--include-tests` los trae de vuelta.

`km loc` y los conteos de líneas de `km report` los siguen contando: son líneas del archivo, tal como las cuenta `cloc`.

## Archivos generados, datos y prosa

Los comandos que miden código (`dups`, `indent`, `hal`, `cycom`, `cogcom`, `mi`, `miv`, `smells`, `score`, `report`, `init`, `hotspots`, `churn`, `tc`) dejan fuera:

- **Archivos generados**, por nombre (archivos lock, `*.min.js`, `*.bundle.js`, `*.pb.go`, `*_pb2.py`, `*.generated.*`) o por contenido:
  - un comentario en las primeras 20 líneas que dice que el archivo es generado y no se debe editar (el `// Code generated ... DO NOT EDIT.` de Go, protoc);
  - `@generated`, o el `<auto-generated` de C#;
  - el encabezado de Bison o de Flex, o las funciones auxiliares que esbuild pone al inicio de un bundle;
  - la salida de un bundler: un comentario `sourceMappingURL` al final del archivo, o un `<nombre>.map` al lado.
- **Datos y prosa**: JSON, YAML, TOML, XML, Markdown, Text, Properties y archivos PO. Su indentación es estructura, no anidamiento, y cambian en cada versión sin ser código.

`km knowledge` y `km authors` dejan fuera los archivos generados. `km loc` y `km deps` leen todos los archivos: las líneas son líneas, y el código generado igual se importa.

## Tipos de archivo

Cada archivo es de un tipo:

| Tipo | Archivos |
|------|----------|
| `code` | Código fuente |
| `docs` | Markdown, reStructuredText y texto plano |
| `infra` | Terraform, Dockerfiles, y el YAML que es infraestructura: workflows de GitHub, `.gitlab-ci.yml` y otros pipelines de CI, archivos de Compose, charts de Helm, Kustomize, Ansible (`playbooks/`, `roles/*/tasks/`, …), manifiestos de Kubernetes (`apiVersion` y `kind`), plantillas de CloudFormation |
| `data` | JSON, TOML, XML, el resto del YAML, Properties y archivos PO |

`--kind` elige los tipos que lee un comando, en todos los comandos que leen archivos: `--kind docs`, `--kind code,infra`, `--kind all`. Sin él nada cambia: cada comando lee lo que siempre ha leído, y la infraestructura escrita en un lenguaje de código (Terraform, Dockerfiles) se mide como código. Para medir solo código, usa `--kind code`, o pon `separate = true` bajo `[kinds]` en `.kimun.toml` para que sea lo habitual; `[kinds]` también puede declarar el tipo de archivos por glob. `--list-excluded` nombra los archivos que `--kind` deja fuera. Los comandos que leen el historial de git también lo aceptan: `km churn --kind docs` da los documentos que más se reescriben, `km age --kind docs` los que nadie toca hace un año, `km knowledge --kind infra` los módulos de Terraform que conoce una sola persona, y [`km tc --across`](/docs/tc) la documentación y la infraestructura que cambian con el código (Jiang & Adams, MSR 2015, sobre la infraestructura que coevoluciona con el código). Los comandos `km docs` leen los documentos y [`km infra smells`](/docs/infra) la infraestructura, diga lo que diga `--kind`.
