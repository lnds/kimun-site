---
title: "km tc"
description: "Análisis de acoplamiento temporal"
---

Analiza el acoplamiento temporal entre archivos a partir del historial de git. Se basa en el método de Adam Thornhill ("Your Code as a Crime Scene", cap. 7): los archivos que cambian juntos a menudo en los mismos commits tienen un acoplamiento implícito, aunque no se importen directamente.

```bash
km tc [path]
```

## Fórmula

```
Coupling strength = shared_commits / min(commits_a, commits_b)
```

## Niveles de acoplamiento

| Fuerza | Nivel | Significado |
|----------|-------|---------|
| >= 0.5 | STRONG | Los archivos cambian juntos la mayor parte del tiempo |
| 0.3-0.5 | MODERATE | Patrón apreciable de cambios conjuntos |
| < 0.3 | WEAK | Cambios conjuntos ocasionales |

Un acoplamiento alto entre módulos sin relación sugiere dependencias ocultas o problemas de arquitectura: considera extraer abstracciones compartidas.

Opciones:

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--top N` | Muestra solo los N primeros pares de archivos (por defecto: 20) |
| `--sort-by METRIC` | Ordena por `strength` o `shared` (por defecto: `strength`) |
| `--since DURATION` | Considera solo los commits desde este momento (p. ej. `6m`, `1y`, `30d`) |
| `--min-degree N` | Mínimo de commits por archivo para incluirlo (por defecto: 3) |
| `--min-strength F` | Fuerza mínima de acoplamiento que se muestra (p. ej. `0.5` para ver solo el fuerte) |

Ejemplo de salida:

```
Temporal Coupling — Files That Change Together
──────────────────────────────────────────────────────────────────────────────────
 File A                     File B                     Shared  Strength  Level
──────────────────────────────────────────────────────────────────────────────────
 src/auth/jwt.rs            src/auth/middleware.rs          12      0.86  STRONG
 lib/parser.rs              lib/validator.rs                 8      0.53  STRONG
 config/db.yaml             config/cache.yaml                6      0.35  MODERATE
──────────────────────────────────────────────────────────────────────────────────

12 coupled pairs found (3 shown). Showing pairs with >= 3 shared commits.
Strong coupling (>= 0.5) suggests hidden dependencies — consider extracting shared abstractions.
```

**Aviso:** los renombres de archivos no se siguen a lo largo del historial de git. Los archivos renombrados aparecen como entradas separadas.
