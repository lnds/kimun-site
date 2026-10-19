---
title: "km deps"
description: "Análisis del grafo de dependencias"
---

Analiza las dependencias internas entre módulos leyendo las sentencias import/use/require. Construye un grafo dirigido del acoplamiento entre archivos y detecta ciclos con el algoritmo SCC de Tarjan.

```bash
km deps [path]
```

Soporta Elixir (cada módulo al que el código se refiere, con el `alias` deshecho; mira las notas más abajo), Rust (cada ruta que nombra un módulo del workspace: `use`, `crate::`, `super::`, un módulo hijo; mira las notas más abajo), Python (`import` y `from … import`, absolutos y relativos; mira las notas más abajo), JavaScript/TypeScript (`import`, `export … from`, `require` e `import()`, relativos o a través de los alias de `tsconfig.json` y de los paquetes del workspace; mira las notas más abajo), Go (imports de los paquetes del repositorio, según la ruta de módulo de cada `go.mod`; mira las notas más abajo), C y C++ (`#include`, como lo encuentra un compilador; mira las notas más abajo), Java (las clases que nombra un archivo, a través de su paquete y de sus imports; mira las notas más abajo), C# (los tipos que nombra un archivo, a través de sus namespaces y de sus directivas `using`; mira las notas más abajo), Ruby (`require_relative`, `require` según el load path, y las constantes que nombra un archivo, como las carga Rails; mira las notas más abajo) y Kaikai (`import a.b.c`, incluidas las formas `as` y `.{…}`). Las dependencias externas (crates, paquetes de npm, headers del sistema, la biblioteca estándar de Kaikai) se ignoran.

Los archivos en cualquier otro lenguaje quedan fuera del grafo, en vez de listarse con cero dependencias. El pie de la tabla, el arreglo `unsupported` de la salida JSON y el campo `unsupported:N` del formato short dicen cuántos archivos se omitieron, así que "no medido" nunca se muestra como "sin dependencias".

Algunos imports no cargan un módulo cuando se carga el que importa: un `import type` de TypeScript (y `import { type A }` cuando todos los nombres son tipos, y `export type … from`) y un import de Python bajo `if TYPE_CHECKING:` toman solo tipos, y un import de Python dentro de una función o un `import()` dinámico se ejecuta después. Se quedan en el grafo, marcados `type` o `deferred`, y cuentan en fan-in y fan-out, porque igual son acoplamiento, pero quedan fuera de la detección de ciclos: un ciclo es un conjunto de archivos que se necesitan entre sí para cargarse. El pie de la tabla los cuenta (`Imports left out of cycles: …`), y el JSON da `type_fan_out` y `deferred_fan_out` por archivo, que son parte de `fan_out`, y `type_edges` y `deferred_edges` en total.

Un import que tiene la forma de un archivo del proyecto pero no resuelve a ninguno se reporta, para que una arista que falta no se lea como ausencia de dependencia: un `#include` entre comillas que no es un header del sistema (a menudo un archivo generado al compilar), un especificador relativo de JavaScript o TypeScript que nombra un script, un import relativo de Python, un import de Go dentro de un módulo del repositorio. Los paquetes externos nunca se listan. El pie de la tabla los cuenta (`Unresolved internal imports: N in M files`), el JSON los lista por archivo en `unresolved` y los cuenta en `unresolved_count`, y el formato short da `unresolved:N`. Rust, Elixir, Java, C# y Kaikai nombran módulos y tipos en vez de archivos, donde nada distingue un nombre interno de uno externo, así que no reportan ninguno.

El JSON lista las aristas en `edges`, cada una como `{"from", "to", "kind"}`, con `kind` igual a `load`, `compile`, `deferred` o `type`: las que salen de los archivos listados, así que `--top` y `--cycles-only` las acotan igual que a `files`.

Notas sobre Elixir:

- Las dependencias son entre módulos, y la mayoría no necesita import, así que cada nombre de módulo en el código cuenta como una referencia: llamadas, structs, `use`, `import`, `require`, `@behaviour`, `defimpl`. Los comentarios, strings, heredocs y sigils se apartan primero, así que un doctest no es una dependencia.
- El `alias` se deshace, incluidas las formas con `as:`, agrupadas y de varias líneas, y `__MODULE__`. La sentencia en sí no es un uso.
- Los `defmodule` anidados reciben el nombre del módulo que los contiene, que se deduce de la indentación tal como la deja `mix format`.
- Un módulo definido en varios archivos (proyectos hechos a partir de una misma plantilla) se resuelve al archivo más cercano al que se refiere a él.
- Los comentarios y los literales no contienen referencias, pero el código que un string interpola sí: `"Total: #{Orders.total(order)}"` usa `Orders`.
- Un controlador de Phoenix usa las vistas que llevan su nombre (`PageController` y `PageJSON`, `PageHTML`, `PageView`), y un módulo usa los componentes que renderizan sus plantillas `~H`.
- `mix.exs`, `.formatter.exs` y los scripts de un directorio `config` configuran el build: quedan en el grafo sin dependencias, y los módulos que nombran (`groups_for_modules`, `config :app, App.Endpoint`) o definen (`App.MixProject`) no generan aristas.
- `use Foo, :nombre` ejecuta `Foo.nombre` y `use Foo` ejecuta `Foo.__using__`. Cuando `Foo` es un módulo del proyecto, el código de esa función, y de las funciones que inserta con `unquote(ayudante())`, se lee como si estuviera escrito en quien lo usa: sus alias, imports y referencias son de quien lo usa. Una live view que hace `use MyAppWeb, :live_view` usa `MyAppWeb.CoreComponents` y los `Layouts` que nombra, tal como lo ve el compilador. El quote se lee entero, tome la rama que tome la macro.
- `import Foo, only: [bar: 1]` llama a `Foo.bar`. Sin `only:`, una llamada sin módulo (`bar(x)`, `&bar/1`, `<.bar>` en una plantilla) que el archivo no define llama a la función de ese nombre de cada módulo del proyecto que importa.
- Un uso que el archivo necesita para compilar se marca `compile`: un `use`, y una llamada a una macro (`defmacro`, `defguard`) del proyecto, porque el compilador la expande en quien la llama. Lo que contiene un bloque `quote` se compila donde se llama la macro, así que no es un uso `compile` del archivo que lo escribe; lo que inyecta un `use` se compila en el usuario. Un `import` o un `require` por sí solo recompila el archivo solo cuando cambian las exportaciones del módulo (`mix xref` lo llama `export`), así que es un uso común. Un uso `compile` cuenta en los ciclos; el pie de la tabla los cuenta (`Compile-time uses …`), y el JSON da `compile_fan_out` por archivo y `compile_edges` en total. Una función llamada en el cuerpo de un módulo, fuera de toda función (`plug Plug.Static, only: MyAppWeb.static_paths()`), también se ejecuta al compilar, y no se detecta.
- No se ven: los módulos nombrados en tiempo de ejecución (`apply/3`, configuración), los generados por macros, y los que un router de Phoenix nombra bajo el alias de un `scope`. Las funciones se distinguen por nombre, no por aridad.

Notas sobre Rust:

- Una dependencia es una ruta: `use crate::git::GitRepo`, una ruta calificada `super::analyzer::run(x)`, una llamada sobre un módulo hijo (`report::print(x)`). Se leen los grupos, `as`, `self`, los globs y los `use` de varias líneas. `mod x;` solo dice dónde vive un módulo y no agrega relación.
- Cada crate es un árbol de módulos que crece desde su raíz (`src/lib.rs`, `src/main.rs`, un archivo de `src/bin`, `tests`, `examples` o `benches`, `build.rs`) por sus declaraciones `mod`, incluido `#[path]`. Una ruta lleva al archivo del módulo más profundo que nombra: el ítem puede estar definido ahí o solo reexportado. Un módulo declarado dos veces bajo `#[cfg]` opuestos, con un `#[path]` cada uno, lleva a ambos archivos.
- Un crate reexportado bajo un nombre (`pub extern crate grep_printer as printer`, `pub use grep_printer as printer`) se sigue: `grep::printer::Stats` lleva a la librería de `grep-printer`, y la fachada la usa.
- Los demás targets de un paquete llegan a su librería por el nombre (`my_app::orders` desde `tests/` o `main.rs`), y también los otros crates del workspace. El nombre sale de `[package] name`, con `-` leído como `_`.
- Un tipo usa los archivos que tienen sus bloques `impl`, porque lo que definen se alcanza a través del tipo.
- Para `km impact`, un archivo con funciones `#[test]` tiene un test propio; un archivo de `tests/` que las tiene, o un módulo `tests.rs`, es un test. Lo que un paquete ejecuta (`src/main.rs`, `src/bin`, `examples`, `benches`, `build.rs`) es un punto de entrada.
- Los comentarios, los strings y `$crate` dentro de una macro no nombran nada.
- No se ve: lo que una macro genera o nombra, `include!`, una librería con `[lib] path` o `name` propios, una dependencia renombrada en `Cargo.toml`, y los módulos detrás de `cfg`, que cuentan todos. Un uso hecho solo desde un módulo de tests en el mismo archivo igual convierte al archivo en dependiente. Un test que ejecuta el binario (`assert_cmd`, `CARGO_BIN_EXE_*`) no nombra ningún archivo, así que no protege a ninguno. Dos paquetes con el mismo nombre en un repositorio no se distinguen.

Notas sobre Python:

- Se lee cada `import a.b` y `from a.b import c`, donde sea que esté escrito: en una función, bajo `if TYPE_CHECKING:`, en varias líneas entre paréntesis o con una barra invertida. Uno escrito en un docstring o en un comentario no es un import. Dónde está escrito se lee por la indentación: bajo `if TYPE_CHECKING:` (o `if typing.TYPE_CHECKING:`) es `type`, en una función (`def`, `async def`, un método) es `deferred`, y en cualquier otra parte carga, incluidos el cuerpo de una clase y el `else:` de `if TYPE_CHECKING:`. Ninguno de los dos primeros forma un ciclo.
- Una ruta con puntos nombra `a/b.py` o el paquete `a/b/__init__.py`; un stub (`.pyi`) vale por un módulo sin fuente. Solo se usa el módulo más profundo: `import a.b.c` no agrega arista hacia `a/__init__.py`.
- En `from a.b import c`, `c` es el submódulo `a/b/c.py` cuando ese archivo existe, y si no, un nombre que `a.b` define.
- Un import relativo parte del paquete del archivo que importa, un nivel más arriba por cada punto adicional.
- Un import absoluto se busca desde cada directorio sobre el archivo que importa que no sea él mismo un paquete (no tiene `__init__.py`), del más cercano al más lejano, y desde el directorio `src` bajo cada uno. Eso cubre un proyecto que se ejecuta desde su raíz, un layout `src` con `tests/` al lado, y varios proyectos en un repositorio. Después vienen las raíces que declara el `pyproject.toml` más cercano por encima: donde el backend de build encuentra los paquetes (`where` y `package-dir` de setuptools, `packages` de Poetry, `sources` y `packages` de Hatch, `python-source` de maturin, `package-dir` de PDM, `module-root` de uv) y lo que agrega pytest (`pythonpath`). Lo que no se encuentra bajo ninguno es externo: la biblioteca estándar, los paquetes instalados.
- Para `km impact`, `test_*.py`, `*_test.py` y `tests.py` son tests, y `conftest.py` es soporte de tests, que no protege nada; `__main__.py`, `setup.py` y `manage.py` son puntos de entrada, igual que lo que está bajo `management/commands`.
- No se ven: los módulos nombrados en tiempo de ejecución (`importlib`, `__import__`, los settings de Django e `INSTALLED_APPS`), las raíces agregadas en tiempo de ejecución (`sys.path`, `PYTHONPATH`, un archivo `.pth`) o declaradas en `setup.py`, `setup.cfg` o `pytest.ini`, y un paquete namespace repartido en varias raíces. Un nombre que un paquete reexporta lleva a su `__init__.py`, y de ahí al módulo que lo define.

Notas sobre Go:

- Un import nombra un paquete, y un paquete es un directorio: el import depende de cada archivo `.go` que esté directamente dentro, no de los que están en sus subdirectorios, que son otros paquetes. No se lee en qué archivo está lo que se usó, así que el fan-out cuenta archivos: un import de un paquete de 17 archivos suma 17.
- Los imports se leen del código: uno escrito en un comentario o en un string, como el programa de ejemplo del comentario de un paquete, no es un import. Un paquete no puede importarse a sí mismo, así que un import del directorio del propio archivo no agrega arista, salvo que el archivo sea un paquete de test externo.
- Los archivos de test (`_test.go`) no son parte de lo que un paquete ofrece, ni tampoco los que la herramienta ignora (`_x.go`, `.x.go`). Un test en un paquete de test externo (`package store_test`) que importa su propio paquete depende de los archivos que tiene al lado.
- Se lee cada `go.mod` bajo el directorio analizado, así que los módulos de un repositorio con varios se resuelven cada uno desde su propio directorio, con o sin `go.work`. Un import de la ruta del módulo misma es el paquete en la raíz del módulo.
- Los archivos de un mismo paquete se usan entre sí sin importarse, así que no hay aristas entre ellos. El grafo de imports es, por lo tanto, una cota inferior de las dependencias reales.
- No se ven: las restricciones de compilación (`//go:build`, nombres de archivo como `x_linux.go`), así que un archivo que queda fuera de una compilación cuenta igual, ni los paquetes bajo `vendor/`.
- Un import bajo la ruta de un módulo del repositorio que no nombra ningún directorio con un paquete se reporta como no resuelto.

Notas sobre JavaScript/TypeScript:

- Solo se leen las formas de import: `import … from`, un `import '…'` solo, `export … from`, `require('…')`, `import('…')` e `import x = require('…')`, varias en una línea o en varias líneas. Cualquier otro string no es un import, así que una ruta que se pasa a `fs.readFile` o a `path.resolve` no es una dependencia.
- Un especificador relativo se resuelve desde el archivo que importa, probando las extensiones de JavaScript y TypeScript y el `index` de un directorio. Un `.js` que no existe nombra su fuente en TypeScript (`./a.js` es `a.ts`), y una query como el `?raw` de Vite nombra el mismo archivo.
- Cualquier otro especificador pasa primero por los `paths` del `tsconfig.json` o `jsconfig.json` más cercano por encima del archivo que importa, y gana el patrón más específico; después, por su `baseUrl`. Se sigue `extends` dentro del repositorio, y un directorio cuyo config principal no tiene alias toma los de los otros que están a su lado (`tsconfig.app.json`). Se aceptan comentarios y comas finales.
- Después, un especificador puede nombrar un paquete del repositorio, por el `name` de su `package.json`: `@acme/ui` lleva a su punto de entrada (`source`, `module`, `main`, `types`, `exports`, leídos desde `src` cuando apuntan a un directorio de build, o si no `src/index`), y `@acme/ui/button` a ese archivo del paquete o de su `src`. Los paquetes bajo `node_modules` no se leen. Lo que no se resuelve por ninguno de estos caminos es externo.
- Un barrel (`index.ts`) es un archivo como cualquier otro: quienes lo importan dependen de él, y él de lo que reexporta.
- `import type`, `export type … from`, y un import o reexport cuyos nombres están todos marcados `type` (`import { type A, type B }`) toman solo tipos: el compilador los borra, así que son `type` y no forman ciclos. Un nombre que es un valor, o un import por defecto junto a ellos, hace que el import cargue. `import()` es `deferred`: el módulo se carga cuando se ejecuta la llamada.
- Un especificador relativo que no resuelve a ningún archivo se reporta como no resuelto cuando nombra un script: sin extensión o con una de JavaScript o TypeScript. Una hoja de estilos o una imagen no es un archivo del grafo.
- No se ve: los alias de la configuración de un bundler (`resolve.alias` de Vite o webpack), los `imports` de `package.json` (`#internal`), los especificadores que se arman en tiempo de ejecución, ni los archivos `.vue` y `.svelte`.

Notas sobre C y C++:

- No se leen los directorios de include del build (`-I`, `include_directories` de CMake). Un `#include "a/b.h"` entre comillas se busca primero junto al archivo que lo incluye; después, con comillas o sin ellas, en cada directorio por encima y en el directorio `include` de cada uno; y por último dondequiera que un archivo del repositorio termine con esa ruta, cuando uno es el más cercano al que incluye.
- `#include <stdio.h>` y cualquier otro nombre suelto entre ángulos que no esté en esos directorios es un header del sistema: no agrega arista, aunque el repositorio tenga en otra parte un archivo con ese nombre.
- Un archivo que incluye un header usa también lo que define su archivo fuente: `foo.h` y el `foo.c` junto a él, o `include/x/foo.h` y `src/x/foo.c`. `km deps` muestra solo los includes que escribe el código, así que un archivo fuente y un header que incluyen la contraparte del otro no forman un ciclo; `km impact` sigue ambos, así que un cambio en `foo.c` alcanza a quien incluye `foo.h`.
- Las condiciones del preprocesador (`#ifdef`) no se evalúan: cuenta cada include.
- Un include entre comillas que no resuelve a ningún archivo del repositorio se reporta como no resuelto, salvo que nombre un header de la biblioteca de C o de POSIX (`"stdio.h"`, `"sys/types.h"`), al que un include entre comillas también puede llegar. Un include entre `<…>` nunca se reporta.

Notas sobre Java:

- Una clase se conoce por su paquete y su nombre, y vive en el archivo de su clase de nivel superior, dondequiera que esté la raíz de las fuentes (`src/main/java`, `src`, un módulo de un build de varios módulos).
- Un archivo usa las clases que nombra: las de su propio paquete y las de cada import a pedido (`import a.b.*`) por su nombre simple, cada clase que importa por sí sola y cualquier clase escrita con su paquete (`a.b.C`). Una clase anidada (`a.b.Outer.Inner`) y un import estático llevan al archivo de la clase exterior. Un import es un uso aunque nada nombre la clase.
- Cuando varios archivos declaran la misma clase (dos variantes de una biblioteca, una copia generada), se toma la más cercana al archivo que la nombra.
- El JDK y las bibliotecas no declaran ningún archivo del repositorio: sus clases son externas.
- Un campo, una variable o un método con el nombre de una clase no se distingue de ella.

Notas sobre C#:

- Un `using` nombra un namespace, no un archivo. Un tipo se conoce por su namespace (de bloque o de archivo) y su nombre, y un archivo usa los tipos que nombra.
- Un archivo ve por su nombre simple los tipos de cada namespace en que está y de los que lo rodean (`App.Web` ve `App`), del namespace global, de cada `using` y de cada `global using` escrito en su directorio o más arriba. Un alias (`using M = App.Models;`) nombra un tipo o un namespace, `using static` usa el tipo que nombra, y `[Audited]` nombra la clase `AuditedAttribute`.
- Un tipo parcial lo declara cada uno de sus archivos, y usarlo los usa a todos. Cuando dos proyectos declaran un tipo del mismo nombre, se toma el más cercano al archivo que lo nombra.
- Los tipos de .NET y de los paquetes de NuGet no declaran ningún archivo del repositorio: son externos. Los usings implícitos del SDK no traen nada del repositorio.
- Un método de extensión (`this` antes del primer parámetro, en una clase estática) se llama sobre un valor sin nombrar su clase. Una llamada después de un punto (`t.IsValueType()`) usa el archivo que declara un método de extensión con ese nombre, que recibe esa cantidad de argumentos, en un namespace que el archivo que llama ve. El tipo del receptor no se conoce: una llamada que varios archivos podrían atender es ambigua y no agrega arista, y un método de instancia con el mismo nombre y la misma aridad que una extensión visible se toma por ella. Los métodos de extensión privados quedan fuera.
- Un campo, una variable o un método con el nombre de un tipo no se distingue de él.

Notas sobre Ruby:

- `require_relative` se resuelve desde el archivo que lo escribe, igual que una ruta construida con `__dir__` o `__FILE__` (`File.expand_path('../x', __FILE__)`, `File.join(__dir__, 'x')`). `require`, `load` y `autoload` buscan la ruta bajo los directorios `lib`, `test` y `spec` del repositorio y las raíces de autoload de Rails (`app/*`, `app/*/concerns`), la más cercana primero; una ruta que no se encuentra en ninguna parte es una gema o la biblioteca estándar.
- La mayor parte del código de Rails no tiene `require`: un archivo usa los archivos que definen las constantes que nombra. Las constantes se buscan siempre, en cualquier proyecto, porque una constante cargada es global, sin importar qué la cargó (`require`, Zeitwerk, Bundler). Una referencia se busca completa desde los namespaces en que está escrita, del más interno al más externo (`Item` dentro de `module Shop` es `Shop::Item` antes que `Item`).
- Las clases y los módulos se anidan por indentación, como los tiene el código formateado. Un módulo que solo se abre para contener otras definiciones es un namespace, no una definición: `module Shop` alrededor de `class Cart` no hace que cada referencia a `Shop` use ese archivo. Una constante asignada en una clase o un módulo (`VERSION = "1"`, `Point = Struct.new(:x)`) es una definición.
- Una constante definida en varios archivos (una clase reabierta): la define el archivo que lleva su nombre como Zeitwerk nombra los archivos (`Shop::LineItem` en `shop/line_item.rb`). Si ninguno lo lleva, cuentan las definiciones más cercanas a la referencia, todas cuando están en un mismo directorio; repartidas en varios directorios sin una más cercana, la referencia es ambigua y queda fuera (`km impact` la cuenta). Una constante que ningún archivo define se busca por su ruta bajo las raíces de autoload.
- El código que se distribuye nunca usa lo que define un archivo de test o un directorio de tests; los tests ven ambos.
- Las clases del núcleo de Ruby (`String`, `Hash`, `Object`…) nunca son un uso, aunque un archivo del repositorio las reabra.
- Los comentarios, strings, heredocs, expresiones regulares y literales `%` no nombran nada; el código que interpola un string sí.
- No se ven: `const_get`, `send` y otra metaprogramación; los métodos que agrega una clase reabierta en un archivo que no lleva su nombre, cuando la referencia se resuelve al archivo que sí lo lleva; ERB y otras plantillas; rutas de autoload propias (`config.autoload_paths`) y directorios colapsados; los request specs que llegan a un controlador por su ruta.

Notas sobre Kaikai:

- `import a.b.c` nombra `a/b/c.kai` relativo a la raíz de un paquete, no al archivo que importa. Se prueba cada directorio ancestro del archivo que importa, del más cercano al más lejano, así que ejecuta `km deps` en un directorio que contenga la raíz del paquete.
- Cuando ese archivo no existe, `import a` puede nombrar un directorio de paquete `a/` que tenga un `kai.toml`, donde el compilador busca: el import depende de `a/a.kai` o, cuando el paquete no tiene un archivo con su nombre, de cada archivo `.kai` que esté directamente dentro.
- Un import que no se resuelve a ningún archivo analizado es externo y no agrega ninguna arista.
- Cada archivo es un módulo propio. Los archivos de un paquete no comparten nombres: se importan entre sí como cualquier otro módulo (`import store`, `import notes.store`), así que sus únicas aristas son sus imports, y un cambio en uno alcanza a los archivos de su paquete que lo importan. A diferencia de Go, donde los archivos de un paquete se ven sin importarse y un import los alcanza a todos.

| Flag | Descripción |
|------|-------------|
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |
| `--cycles-only` | Muestra solo los archivos que participan en un ciclo de dependencias |
| `--sort-by METRIC` | Ordena por `fan-out` (por defecto) o `fan-in` |
| `--top N` | Filas de la tabla (por defecto: 20); el JSON lista todos los archivos salvo que se indique `--top` |
| `--matrix` | Muestra la matriz de estructura de dependencias en vez de la tabla |
| `--depth N` | Niveles de directorios que la matriz muestra expandidos (por defecto: 1) |
| `--focus DIR` | Expande solo este directorio de la matriz y los que están sobre él |
| `--html FILE` | Escribe la matriz como una página HTML interactiva en este archivo |

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

Matriz de estructura de dependencias:

`--matrix` muestra qué archivo depende de cuál como una matriz de estructura de dependencias (DSM), como la dibuja IntelliJ IDEA. Filas y columnas son los mismos directorios y archivos, en el mismo orden; una columna lleva solo el número de su fila, para que la matriz siga siendo angosta. Una celda cuenta los archivos de su columna que usan archivos de su fila. Un directorio colapsado (`▸`) cuenta por todos los archivos bajo él; uno expandido (`▾`) encabeza las filas de lo que contiene. La raíz es el directorio más profundo que contiene todos los archivos, y un directorio que contiene solo otro se muestra junto con él (`lib/core/`).

Los hijos de cada directorio se ordenan de modo que un hermano va antes que los hermanos que usa: en un sistema en capas toda marca queda bajo la diagonal. Los hermanos que se usan entre sí forman un ciclo y quedan juntos, primero los que usan más del ciclo de lo que el ciclo los usa a ellos; el resto conserva el orden de sus nombres. Solo los usos que cargan o compilan ordenan las filas: los `type` y `deferred`, que no forman ciclos, se dibujan atenuados.

Una marca sobre la diagonal va contra las capas. La lista bajo la matriz da cada una con los usos detrás de ella, cinco como máximo, y por qué está ahí: en un ciclo entre archivos (`!` después del número, en rojo en una terminal), contra las capas cuando solo los directorios forman un ciclo (amarillo), o solo de tipos o diferido (atenuado). No hay colores cuando la salida no es una terminal o cuando `NO_COLOR` está definida.

`--depth N` expande los directorios que están a menos de N niveles bajo la raíz; `--focus DIR` expande solo ese directorio y los que están sobre él, con la ruta escrita como km la muestra. `--cycles-only` deja los archivos en ciclos. `--top` no se aplica a la matriz. Con `--format json` se entrega para herramientas y modelos: `rows` en su orden (`number`, `path`, un directorio termina en `/`, `level`), `groups` con los directorios expandidos, `cells` con `row`, `column`, `count`, `mark` (`cycle`, `layering`, `weak` o `plain`) y los `uses` detrás de cada una (`from`, `to`, `kind`, `cycle`), y `above_diagonal` como pares `[row, column]`. Una matriz más ancha que la terminal no se imprime: un `--depth` menor o `--focus` la angostan.

`--html FILE` escribe la matriz como un único archivo HTML que no necesita nada más, en tema claro y oscuro. Abre como la mostraría el texto, y en él un directorio se expande y se colapsa con un clic en su triángulo (o todos a la vez), un clic en un nombre marca en dos colores lo que usa y lo que lo usa, y un clic en una celda lista los usos detrás de ella. Los encabezados quedan fijos al desplazar la matriz, cada celda se sombrea según su número y un nombre muestra su ruta completa al pasar el cursor. El ancho de la terminal no la limita.

```
$ km deps --matrix --focus shop/core
Dependency Structure Matrix
A cell counts the files of its column that use files of its row; ! marks a cycle.

                1  2  3  4  5
 1 main.py      ·
 2 ▸ billing/   1  ·
 3 ▸ web/       1  1  ·
   ▾ core/
 4   db.py            1  · 1!
 5   models.py     1  2 1!  ·

Above the diagonal: 1 cell
  shop/core/models.py → shop/core/db.py: 1, in a cycle
    shop/core/models.py → shop/core/db.py
```
