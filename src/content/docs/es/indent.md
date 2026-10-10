---
title: "km indent"
description: "Complejidad por indentación"
---

Mide la complejidad de cada archivo a partir de su indentación: la desviación estándar de las profundidades de indentación y la profundidad máxima. Una desviación estándar más alta sugiere un flujo de control más complejo.

```bash
km indent [path]
```

Opciones:

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--include-tests` | Incluye los archivos de test en el análisis (excluidos por defecto) |
