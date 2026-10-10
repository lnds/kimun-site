---
title: "km dups"
description: "Detectar código duplicado"
---

Encuentra bloques de código duplicado entre archivos con una ventana deslizante. Aplica la **Regla de Tres**: los duplicados que aparecen 3 veces o más se marcan como **CRITICAL** (se recomienda refactorizar), y los que aparecen dos veces como **TOLERABLE**.

Los archivos y directorios de tests se excluyen por defecto, porque los tests suelen contener repetición intencional.

```bash
km dups [path]
```

Opciones:

| Flag | Descripción |
|------|-------------|
| `-r`, `--report` | Muestra un informe detallado con la ubicación de los duplicados y muestras de código |
| `--show-all` | Muestra todos los grupos de duplicados (por defecto: los 20 primeros) |
| `--min-lines N` | Mínimo de líneas para un bloque duplicado (por defecto: 6) |
| `--include-tests` | Incluye los archivos de test en el análisis (excluidos por defecto) |
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

- **Directorios**: `tests/`, `test/`, `__tests__/`, `spec/`
- **Por extensión**: `*_test.rs`, `*_test.go`, `test_*.py`, `*.test.js`, `*.spec.ts`, `*Test.java`, `*_test.cpp` y más

Usa `--include-tests` para analizar también los archivos de test.
