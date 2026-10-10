---
title: "km knowledge"
description: "Análisis de propiedad del código"
---

Analiza los patrones de propiedad del código con git blame (mapas de conocimiento). Se basa en el método de Adam Thornhill ("Your Code as a Crime Scene", capítulos 8 y 9).

```bash
km knowledge [path]
```

Identifica el riesgo de bus factor y la concentración del conocimiento por archivo. Los archivos generados (archivos lock, JS minificado, etc.) se excluyen automáticamente.

## Niveles de riesgo

| Riesgo | Condición | Significado |
|------|-----------|---------|
| CRITICAL | 1 persona es dueña de más del 80% | Alto riesgo de bus factor |
| HIGH | 1 persona es dueña del 60-80% | Concentración significativa |
| MEDIUM | 2-3 personas son dueñas de más del 80% entre todas | Concentración moderada |
| LOW | Bien distribuido | Propiedad sana |

## Detección de pérdida de conocimiento

Usa `--since` para definir qué es "actividad reciente". Si el dueño principal de un archivo no tiene commits en ese período, el archivo se marca con riesgo de **pérdida de conocimiento**. Usa `--risk-only` para mostrar solo esos archivos.

Opciones:

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--include-tests` | Incluye los archivos de test en el análisis (excluidos por defecto) |
| `--top N` | Muestra solo los N primeros archivos (por defecto: 20) |
| `--sort-by METRIC` | Ordena por `concentration`, `diffusion` o `risk` (por defecto: `concentration`) |
| `--since DURATION` | Define la ventana de actividad reciente para la pérdida de conocimiento (p. ej. `6m`, `1y`, `30d`) |
| `--risk-only` | Muestra solo los archivos con riesgo de pérdida de conocimiento |
| `--summary` | Agrupa por autor: archivos de los que es dueño, líneas, lenguajes, peor riesgo |
| `--bus-factor` | Muestra el bus factor del proyecto (el mínimo de colaboradores que cubren el 80% del código) |
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

Usa `--bus-factor` para calcular cuántos colaboradores te puedes permitir perder:

```
$ km knowledge --bus-factor
Project Bus Factor: 2

 Losing 2 key contributors would put 80% of the project's knowledge at risk.
 Risk: HIGH — two people hold critical knowledge

──────────────────────────────────────────────
 Rank  Author        Lines    Share  Cumulative
──────────────────────────────────────────────
    1  E. Diaz        8420   68.12%     68.12%
    2  A. Torres      1490   12.06%     80.18%  ← 80% threshold
    3  R. Soto         940    7.61%     87.79%
──────────────────────────────────────────────
```
