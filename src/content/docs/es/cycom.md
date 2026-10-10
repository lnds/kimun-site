---
title: "km cycom"
description: "Complejidad ciclomática"
---

Calcula la complejidad ciclomática por archivo y por función contando los puntos de decisión (`if`, `for`, `while`, `match`, `&&`, `||`, etc.).

```bash
km cycom [path]
```

Opciones:

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse,github,codeclimate}` | Formato de salida (por defecto: table). `github` emite anotaciones de GitHub Actions; `codeclimate` (alias: `gitlab`) emite JSON de CodeClimate para GitLab Code Quality |
| `--include-tests` | Incluye los archivos de test en el análisis (excluidos por defecto) |
| `--top N` | Muestra solo los N primeros archivos (por defecto: 20) |
| `--min-complexity N` | Omite los archivos cuya función más compleja está por debajo de N; con `--per-function`, oculta también las funciones por debajo de N (por defecto: 1) |
| `--per-function` | Muestra el desglose por función |
