---
title: "km report"
description: "Informe completo de métricas"
---

Genera un informe de varias secciones que combina todas las métricas estáticas del código en una sola pasada: líneas de código, duplicados, indentación, Halstead, complejidad ciclomática, complejidad cognitiva e índice de mantenibilidad.

```bash
km report [path]
```

Opciones:

| Flag | Descripción |
|------|-------------|
| `--top N` | Muestra solo los N primeros archivos por sección (por defecto: 20) |
| `--min-lines N` | Mínimo de líneas para un bloque duplicado (por defecto: 6) |
| `--full` | Muestra todos los archivos en vez de cortar en los N primeros |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
