---
title: "km mi"
description: "Índice de mantenibilidad (variante de Visual Studio)"
---

Calcula el [índice de mantenibilidad](https://learn.microsoft.com/en-us/visualstudio/code-quality/code-metrics-maintainability-index-range-and-meaning) por archivo con la fórmula de Visual Studio. El MI se normaliza a una escala de 0 a 100, sin el término de peso de los comentarios.

```bash
km mi [path]
```

## Fórmula

```
MI = MAX(0, (171 - 5.2 * ln(V) - 0.23 * G - 16.2 * ln(LOC)) * 100 / 171)
```

Donde V = volumen de Halstead, G = complejidad ciclomática, LOC = líneas de código.

## Umbrales

| Puntaje MI | Nivel | Significado |
|----------|-------|---------|
| 20–100 | green | Buena mantenibilidad |
| 10–19 | yellow | Mantenibilidad moderada |
| 0–9 | red | Baja mantenibilidad |

Opciones:

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--include-tests` | Incluye los archivos de test en el análisis (excluidos por defecto) |
| `--top N` | Muestra solo los N primeros archivos (por defecto: 20) |
| `--sort-by METRIC` | Ordena por `mi` (ascendente), `volume`, `complexity` o `loc` (por defecto: `mi`) |

Ejemplo de salida:

```
Maintainability Index (Visual Studio)
──────────────────────────────────────────────────────────────────────
 File                       Volume Cyclo   LOC     MI  Level
──────────────────────────────────────────────────────────────────────
 src/loc/counter.rs        32101.6   115   731    0.0  red
 src/main.rs               11189.6    16   241   17.5  yellow
 src/loc/report.rs          6257.0    13   185   22.2  green
──────────────────────────────────────────────────────────────────────
 Total (3 files)                         1157   13.2
```
