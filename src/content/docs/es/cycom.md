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
| `--include-tests` | Incluye los tests, ejemplos y benchmarks en el análisis (excluidos por defecto) |
| `--top N` | Filas de la tabla (por defecto: 20); el JSON lista todos los archivos salvo que se indique `--top` |
| `--min-complexity N` | Omite los archivos cuya función más compleja está por debajo de N; con `--per-function`, oculta también las funciones por debajo de N (por defecto: 1) |
| `--per-function` | Muestra el desglose por función |

## Cómo se encuentran las funciones

`cycom`, `cogcom` y `smells` comparten un mismo detector de funciones. Una declaración se reconoce por el marcador de su lenguaje (`fn`, `def`, `func`, `function`, `defmacro`) o, en la familia C, por su forma, sobre la firma completa aunque ocupe varias líneas:

- parámetros en varias líneas, el nombre solo en la línea de arriba (estilo GNU), la `{` en la línea siguiente;
- una línea que empieza dentro de paréntesis abiertos (la continuación de una condición, un parámetro con atributo) nunca es una declaración, ni tampoco una anotación (`@Override`, `[HttpGet]`) o una clase anónima (`new Adapter() {`);
- las directivas de preprocesador y las líneas que un `\` final les une no son código: no declaran funciones ni suman complejidad;
- los métodos de Go se nombran sin su receptor;
- en JavaScript y TypeScript, las funciones asignadas a un nombre (`res.send = function`, `const f = (x) => {`, `name: Type = <T>(x) => {`) toman ese nombre, una función pasada como argumento es `<anonymous>`, y las llaves de una expresión regular literal no son bloques;
- en Elixir, el código dentro de un bloque `quote` no es parte de la función que lo contiene, y las funciones que declara se miden por separado.
