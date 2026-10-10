---
title: "km age"
description: "Análisis de antigüedad de archivos"
---

Clasifica los archivos fuente como **Active**, **Stale** o **Frozen** según cuánto tiempo hace que se modificaron por última vez en el historial de git. Ayuda a identificar código descuidado o abandonado.

```bash
km age [path]
```

## Clasificación por estado

| Estado | Condición | Significado |
|--------|-----------|---------|
| ACTIVE | Modificado dentro de los últimos `--active-days` días (por defecto: 90) | Se toca con regularidad |
| STALE | Entre `--active-days` y `--frozen-days` (por defecto: 365) | Descuidado |
| FROZEN | Sin modificaciones hace más de `--frozen-days` días | Posiblemente abandonado |

Opciones:

| Flag | Descripción |
|------|-------------|
| `--active-days N` | Umbral en días para el estado Active (por defecto: 90) |
| `--frozen-days N` | Umbral en días para el estado Frozen (por defecto: 365) |
| `--sort-by METRIC` | Ordena por `date` (los más antiguos primero, por defecto), `status` o `file` |
| `--status FILTER` | Muestra solo los archivos con este estado: `active`, `stale` o `frozen` |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |

Ejemplo de salida:

```
──────────────────────────────────────────────────────────────────────────────
 File                    Language     Last Modified  Days  Status
──────────────────────────────────────────────────────────────────────────────
 src/legacy/parser.rs    Rust           2023-01-15   840  FROZEN
 src/util.rs             Rust           2024-09-20   197  STALE
 src/main.rs             Rust           2026-03-01    34  ACTIVE
──────────────────────────────────────────────────────────────────────────────

  ACTIVE     12  (modified < 90 days)
  STALE       8  (90 days – 365 days)
  FROZEN      3  (not modified > 365 days)
```
