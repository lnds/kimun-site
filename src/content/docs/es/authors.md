---
title: "km authors"
description: "Resumen de propiedad por autor"
---

Resume la propiedad del código de todo el proyecto por autor. Agrupa los datos de `git blame` para responder "¿quién sabe qué?" a nivel de equipo: complementa a `km knowledge` (vista por archivo) con una vista del equipo.

```bash
km authors [path]
```

Opciones:

| Flag | Descripción |
|------|-------------|
| `--since DURATION` | Considera solo la actividad desde este momento (p. ej. `6m`, `1y`, `30d`) |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |

Ejemplo de salida:

```
──────────────────────────────────────────────────────────────────────
 Author              Owned      Lines  Languages    Last Active
──────────────────────────────────────────────────────────────────────
 E. Diaz                38       8432  Rust, TOML   2026-03-15
 R. Ramirez              4        312  Rust         2026-02-10
──────────────────────────────────────────────────────────────────────
```
