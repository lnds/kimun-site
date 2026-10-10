---
title: "km miv"
description: "Índice de mantenibilidad (variante de verifysoft)"
---

Calcula el [índice de mantenibilidad](https://www.verifysoft.com/en_maintainability.html) por archivo. El MI combina el volumen de Halstead, la complejidad ciclomática, las líneas de código y la proporción de comentarios en un solo puntaje de mantenibilidad.

Esta es la variante de verifysoft.com, que incluye un término de peso de los comentarios (MIcw) que premia el código bien comentado.

```bash
km miv [path]
```

## Fórmula

```
MIwoc = 171 - 5.2 * ln(V) - 0.23 * G - 16.2 * ln(LOC)
MIcw  = 50 * sin(sqrt(2.46 * radians(PerCM)))
MI    = MIwoc + MIcw
```

Donde V = volumen de Halstead, G = complejidad ciclomática, LOC = líneas de código, PerCM = porcentaje de comentarios (convertido a radianes).

## Umbrales

| Puntaje MI | Nivel | Significado |
|----------|-------|---------|
| 85+ | good | Fácil de mantener |
| 65–84 | moderate | Mantenibilidad razonable |
| <65 | difficult | Difícil de mantener |

Opciones:

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--include-tests` | Incluye los archivos de test en el análisis (excluidos por defecto) |
| `--top N` | Muestra solo los N primeros archivos (por defecto: 20) |
| `--sort-by METRIC` | Ordena por `mi` (ascendente), `volume`, `complexity` o `loc` (por defecto: `mi`) |

Ejemplo de salida:

```
Maintainability Index
────────────────────────────────────────────────────────────────────────────────
 File                       Volume Cyclo   LOC  Cmt%   MIwoc      MI  Level
────────────────────────────────────────────────────────────────────────────────
 src/loc/counter.rs        32101.6   115   731   3.6   -16.2     2.8  difficult
 src/main.rs                8686.7    14   204  14.6    34.5    68.2  moderate
 src/util.rs                2816.9    18    76   9.5    55.4    84.7  moderate
────────────────────────────────────────────────────────────────────────────────
 Total (3 files)                         1011                  51.9
```
