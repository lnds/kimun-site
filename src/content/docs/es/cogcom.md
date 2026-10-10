---
title: "km cogcom"
description: "Complejidad cognitiva"
---

Calcula la complejidad cognitiva por archivo y por función con el [método de SonarSource](https://www.sonarsource.com/docs/CognitiveComplexity.pdf) (2017). A diferencia de la complejidad ciclomática, la complejidad cognitiva mide qué tan difícil es *entender* el código: penaliza las estructuras muy anidadas y premia el flujo de control lineal.

```bash
km cogcom [path]
```

Opciones:

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse,github,codeclimate}` | Formato de salida (por defecto: table). `github` emite anotaciones de GitHub Actions; `codeclimate` (alias: `gitlab`) emite JSON de CodeClimate para GitLab Code Quality |
| `--include-tests` | Incluye los archivos de test en el análisis (excluidos por defecto) |
| `--top N` | Muestra solo los N primeros archivos (por defecto: 20) |
| `--min-complexity N` | Omite los archivos cuya función más compleja está por debajo de N; con `--per-function`, oculta también las funciones por debajo de N (por defecto: 1) |
| `--per-function` | Muestra el desglose por función |
| `--sort-by METRIC` | Ordena por `total`, `max` o `avg` (por defecto: `total`) |
