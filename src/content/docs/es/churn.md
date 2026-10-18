---
title: "km churn"
description: "Análisis de churn"
---

Mide la frecuencia de cambio pura por archivo a partir del historial de git (solo la cantidad de commits, sin ponderar por complejidad). Identifica los archivos que más se modifican: un churn alto sin una mejora de calidad que lo acompañe es una señal de mantenimiento.

La tasa son los commits por mes desde el primer commit del archivo hasta hoy, o desde el inicio de la ventana de `--since` hasta hoy, con un mínimo de un mes. Una ráfaga de commits de hace tiempo se reparte en el tiempo transcurrido desde entonces, así que no supera a un archivo que sigue cambiando. HIGH es más de 4 al mes, MEDIUM desde 1, LOW por debajo.

```bash
km churn [path]
```

Opciones:

| Flag | Descripción |
|------|-------------|
| `--top N` | Filas de la tabla (por defecto: 20); el JSON lista todos los archivos salvo que se indique `--top` |
| `--sort-by METRIC` | Ordena por `commits` (por defecto), `rate` (commits por mes) o `file` |
| `--since DURATION` | Considera solo los commits desde este momento (p. ej. `6m`, `1y`, `30d`) |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |

Ejemplo de salida:

```
Code Churn — Change Frequency
──────────────────────────────────────────────────────────────────────────────
 File                     Language  Commits   Rate/mo   First Seen   Last Seen
──────────────────────────────────────────────────────────────────────────────
 src/main.rs                  Rust       18      3.2    2025-01-10  2026-03-28
 src/loc/counter.rs           Rust        7      1.3    2025-01-10  2026-02-14
 src/dups/detector.rs         Rust        7      1.2    2025-02-01  2026-02-20
──────────────────────────────────────────────────────────────────────────────
```
