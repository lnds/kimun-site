---
title: "km deps"
description: "Análisis del grafo de dependencias"
---

Analiza las dependencias internas entre módulos leyendo las sentencias import/use/require. Construye un grafo dirigido del acoplamiento entre archivos y detecta ciclos con el algoritmo SCC de Tarjan.

```bash
km deps [path]
```

Soporta Elixir (cada módulo al que el código se refiere, con el `alias` deshecho; mira las notas más abajo), Rust (cada ruta que nombra un módulo del workspace: `use`, `crate::`, `super::`, un módulo hijo; mira las notas más abajo), Python (`import` y `from … import`, absolutos y relativos; mira las notas más abajo), JavaScript/TypeScript (`import`/`require` relativos), Go (imports que coinciden con la ruta del módulo en `go.mod`) y Kaikai (`import a.b.c`, incluidas las formas `as` y `.{…}`). Las dependencias externas (crates, paquetes de npm, la biblioteca estándar de Kaikai) se ignoran.

Los archivos en cualquier otro lenguaje quedan fuera del grafo, en vez de listarse con cero dependencias. El pie de la tabla, el arreglo `unsupported` de la salida JSON y el campo `unsupported:N` del formato short dicen cuántos archivos se omitieron, así que "no medido" nunca se muestra como "sin dependencias".

Notas sobre Elixir:

- Las dependencias son entre módulos, y la mayoría no necesita import, así que cada nombre de módulo en el código cuenta como una referencia: llamadas, structs, `use`, `import`, `require`, `@behaviour`, `defimpl`. Los comentarios, strings, heredocs y sigils se apartan primero, así que un doctest no es una dependencia.
- El `alias` se deshace, incluidas las formas con `as:`, agrupadas y de varias líneas, y `__MODULE__`. La sentencia en sí no es un uso.
- Los `defmodule` anidados reciben el nombre del módulo que los contiene, que se deduce de la indentación tal como la deja `mix format`.
- Un módulo definido en varios archivos (proyectos hechos a partir de una misma plantilla) se resuelve al archivo más cercano al que se refiere a él.
- Los comentarios y los literales no contienen referencias, pero el código que un string interpola sí: `"Total: #{Orders.total(order)}"` usa `Orders`.
- Un controlador de Phoenix usa las vistas que llevan su nombre (`PageController` y `PageJSON`, `PageHTML`, `PageView`), y un módulo usa los componentes que renderizan sus plantillas `~H`.
- No se ven: los módulos nombrados en tiempo de ejecución (`apply/3`, configuración), los generados por macros, y los que un router de Phoenix nombra bajo el alias de un `scope`.

Notas sobre Rust:

- Una dependencia es una ruta: `use crate::git::GitRepo`, una ruta calificada `super::analyzer::run(x)`, una llamada sobre un módulo hijo (`report::print(x)`). Se leen los grupos, `as`, `self`, los globs y los `use` de varias líneas. `mod x;` solo dice dónde vive un módulo y no agrega relación.
- Cada crate es un árbol de módulos que crece desde su raíz (`src/lib.rs`, `src/main.rs`, un archivo de `src/bin`, `tests`, `examples` o `benches`, `build.rs`) por sus declaraciones `mod`, incluido `#[path]`. Una ruta lleva al archivo del módulo más profundo que nombra: el ítem puede estar definido ahí o solo reexportado.
- Los demás targets de un paquete llegan a su librería por el nombre (`my_app::orders` desde `tests/` o `main.rs`), y también los otros crates del workspace. El nombre sale de `[package] name`, con `-` leído como `_`.
- Un tipo usa los archivos que tienen sus bloques `impl`, porque lo que definen se alcanza a través del tipo.
- Para `km impact`, un archivo con funciones `#[test]` tiene un test propio; un archivo de `tests/` que las tiene, o un módulo `tests.rs`, es un test. Lo que un paquete ejecuta (`src/main.rs`, `src/bin`, `examples`, `benches`, `build.rs`) es un punto de entrada.
- Los comentarios, los strings y `$crate` dentro de una macro no nombran nada.
- No se ve: lo que una macro genera o nombra, `include!`, una librería con `[lib] path` o `name` propios, una dependencia renombrada en `Cargo.toml`, y los módulos detrás de `cfg`, que cuentan todos. Un uso hecho solo desde un módulo de tests en el mismo archivo igual convierte al archivo en dependiente. Un test que ejecuta el binario (`assert_cmd`, `CARGO_BIN_EXE_*`) no nombra ningún archivo, así que no protege a ninguno. Dos paquetes con el mismo nombre en un repositorio no se distinguen.

Notas sobre Python:

- Se lee cada `import a.b` y `from a.b import c`, donde sea que esté escrito: en una función, bajo `if TYPE_CHECKING:`, en varias líneas entre paréntesis o con una barra invertida. Uno escrito en un docstring o en un comentario no es un import.
- Una ruta con puntos nombra `a/b.py` o el paquete `a/b/__init__.py`; un stub (`.pyi`) vale por un módulo sin fuente. Solo se usa el módulo más profundo: `import a.b.c` no agrega arista hacia `a/__init__.py`.
- En `from a.b import c`, `c` es el submódulo `a/b/c.py` cuando ese archivo existe, y si no, un nombre que `a.b` define.
- Un import relativo parte del paquete del archivo que importa, un nivel más arriba por cada punto adicional.
- Un import absoluto se busca desde cada directorio sobre el archivo que importa que no sea él mismo un paquete (no tiene `__init__.py`), del más cercano al más lejano, y desde el directorio `src` bajo cada uno. Eso cubre un proyecto que se ejecuta desde su raíz, un layout `src` con `tests/` al lado, y varios proyectos en un repositorio. Después vienen las raíces que declara el `pyproject.toml` más cercano por encima: donde el backend de build encuentra los paquetes (`where` y `package-dir` de setuptools, `packages` de Poetry, `sources` y `packages` de Hatch, `python-source` de maturin, `package-dir` de PDM, `module-root` de uv) y lo que agrega pytest (`pythonpath`). Lo que no se encuentra bajo ninguno es externo: la biblioteca estándar, los paquetes instalados.
- Para `km impact`, `test_*.py`, `*_test.py` y `tests.py` son tests, y `conftest.py` es soporte de tests, que no protege nada; `__main__.py`, `setup.py` y `manage.py` son puntos de entrada, igual que lo que está bajo `management/commands`.
- No se ven: los módulos nombrados en tiempo de ejecución (`importlib`, `__import__`, los settings de Django e `INSTALLED_APPS`), las raíces agregadas en tiempo de ejecución (`sys.path`, `PYTHONPATH`, un archivo `.pth`) o declaradas en `setup.py`, `setup.cfg` o `pytest.ini`, y un paquete namespace repartido en varias raíces. Un nombre que un paquete reexporta lleva a su `__init__.py`, y de ahí al módulo que lo define.

Notas sobre Kaikai:

- `import a.b.c` nombra `a/b/c.kai` relativo a la raíz de un paquete, no al archivo que importa. Se prueba cada directorio ancestro del archivo que importa, del más cercano al más lejano, así que ejecuta `km deps` en un directorio que contenga la raíz del paquete.
- Cuando ese archivo no existe, `import a` puede nombrar un directorio de paquete `a/` que tenga un `kai.toml`; el import depende entonces de cada archivo `.kai` que esté directamente dentro.
- Un import que no se resuelve a ningún archivo analizado es externo y no agrega ninguna arista.
- Los archivos de un mismo paquete de Kaikai se fusionan, así que un módulo puede usar un nombre declarado en otro archivo de su paquete sin importarlo. El grafo de imports es, por lo tanto, una cota inferior de las dependencias reales.

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--cycles-only` | Muestra solo los archivos que participan en un ciclo de dependencias |
| `--sort-by METRIC` | Ordena por `fan-out` (por defecto) o `fan-in` |
| `--top N` | Muestra solo los N primeros archivos (por defecto: 20) |

Ejemplo de salida:

```
Dependency Graph
────────────────────────────────────────────────────────────────────────
 File                 Language Fan-In Fan-Out Cycle
────────────────────────────────────────────────────────────────────────
 report_helpers.rs        Rust     26       1    no
 util.rs                  Rust     25       2   yes
 walk.rs                  Rust     24       1    no
────────────────────────────────────────────────────────────────────────

Dependency cycles: 14
  Cycle 1 (3 files):
    cogcom/analyzer.rs
    cogcom/detection.rs
    cogcom/report.rs
```
