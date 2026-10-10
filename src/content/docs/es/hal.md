---
title: "km hal"
description: "Métricas de complejidad de Halstead"
---

Calcula las [métricas de complejidad de Halstead](https://en.wikipedia.org/wiki/Halstead_complexity_measures) por archivo, extrayendo operadores y operandos del código fuente.

```bash
km hal [path]
```

## Métricas

| Símbolo | Métrica | Fórmula | Descripción |
|--------|--------|---------|-------------|
| n1 | Operadores distintos | -- | Operadores únicos en el código |
| n2 | Operandos distintos | -- | Operandos únicos en el código |
| N1 | Total de operadores | -- | Apariciones totales de operadores |
| N2 | Total de operandos | -- | Apariciones totales de operandos |
| n | Vocabulario | n1 + n2 | Tamaño del "alfabeto" usado |
| N | Longitud | N1 + N2 | Número total de tokens |
| V | Volumen | N * log2(n) | Tamaño de la implementación |
| D | Dificultad | (n1/2) * (N2/n2) | Propensión a errores |
| E | Esfuerzo | D * V | Esfuerzo mental para desarrollarlo |
| B | Bugs | V / 3000 | Bugs entregados estimados |
| T | Tiempo | E / 18 segundos | Tiempo de desarrollo estimado |

Un esfuerzo, un volumen y una cantidad de bugs más altos indican código más complejo y más propenso a errores.

Opciones:

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--include-tests` | Incluye los archivos de test en el análisis (excluidos por defecto) |
| `--top N` | Muestra solo los N primeros archivos (por defecto: 20) |
| `--sort-by METRIC` | Ordena por `effort`, `volume` o `bugs` (por defecto: `effort`) |

Ejemplo de salida:

```
Halstead Complexity Metrics
──────────────────────────────────────────────────────────────────────────────
 File                      n1   n2    N1    N2    Volume     Effort   Bugs
──────────────────────────────────────────────────────────────────────────────
 src/loc/counter.rs       139  116  3130  1169   34367.7   24070888  11.46
 src/main.rs               37   43   520   185    4457.0     354743   1.49
──────────────────────────────────────────────────────────────────────────────
 Total (2 files)                     3650  1354   38824.7   24425631  12.95
```

## Lenguajes soportados

Rust, Python, JavaScript, TypeScript, Go, C, C++, C#, Java, Objective-C, PHP, Dart, Ruby, Kotlin, Swift, Shell (Bash/Zsh).
