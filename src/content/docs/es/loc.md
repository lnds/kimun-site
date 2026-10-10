---
title: "km loc"
description: "Contar líneas de código"
---

```bash
km loc [path]
```

Ejecútalo en el directorio actual:

```bash
km loc
```

Ejecútalo en una ruta específica:

```bash
km loc src/
```

Opciones:

| Flag | Descripción |
|------|-------------|
| `-v`, `--verbose` | Muestra estadísticas de resumen (archivos leídos, únicos, ignorados, tiempo transcurrido) |
| `--by-author` | Desglosa las líneas de código por autor de git (requiere un repositorio git) |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |

Ejemplo de salida:

```
────────────────────────────────────────────────────────────────────
 Language                Files        Blank      Comment         Code
────────────────────────────────────────────────────────────────────
 Rust                        5          120           45          850
 TOML                        1            2            0           15
────────────────────────────────────────────────────────────────────
 SUM:                        6          122           45          865
────────────────────────────────────────────────────────────────────
```
