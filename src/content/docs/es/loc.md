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

Los archivos de tests quedan fuera por defecto, así que los totales son menores que los de `cloc` sobre el mismo directorio. Con `--include-tests` ambos cuentan los mismos archivos. Bajo la tabla, cuando hay más de uno, van las líneas de cada [tipo de archivo](/docs/dups#tipos-de-archivo): code, docs, infra y data (`kinds` en el JSON).

Opciones:

| Flag | Descripción |
|------|-------------|
| `-v`, `--verbose` | Muestra estadísticas de resumen (archivos leídos, únicos, ignorados, tiempo transcurrido) |
| `--by-author` | Desglosa las líneas de código por autor de git (requiere un repositorio git) |
| `--include-tests` | Cuenta también los archivos y directorios de tests (por defecto quedan fuera) |
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
