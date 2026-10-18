---
title: "km indent"
description: "Complejidad por indentación"
---

Mide la complejidad de cada archivo a partir de su indentación: la desviación estándar de las profundidades de indentación y la profundidad máxima. Una desviación estándar más alta sugiere un flujo de control más complejo.

```bash
km indent [path]
```

La profundidad se lee como estructura, no como diagramación. Una línea que continúa una instrucción queda a lo más un nivel más adentro que la línea que continúa: los argumentos alineados bajo un paréntesis de apertura, una línea que sigue a otra terminada en `::`, `&&`, `||`, `|>`, `|` o `\`, y una línea que empieza con `.`, `|`, `&&` o `||`. Dentro de un bloque abierto entre paréntesis (el cuerpo de una closure o de un `fn` de Elixir), las profundidades vuelven a contar desde ese bloque. Un archivo con menos de 10 líneas de código no se clasifica (`-`): la dispersión de unas pocas líneas no dice nada. Los archivos de datos y prosa quedan fuera.

Opciones:

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--include-tests` | Incluye los tests, ejemplos y benchmarks en el análisis (excluidos por defecto) |
