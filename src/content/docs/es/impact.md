---
title: "km impact"
description: "Impacto de un diff"
---

Mide hasta dónde llega un cambio, sea un PR o trabajo sin commit, antes de hacer el merge.

## Qué es el blast radius

El **blast radius** (radio de impacto) de un cambio es la parte del sistema que puede comportarse distinto por su causa, más allá de los archivos que edita. Un cambio en una función no es solo esa función: es todo el código que la llama, y lo que llama a ese código. Si los tests propios de la función pasan y algo que la usa falla en producción, la falla estaba dentro del radio y fuera de los tests.

`km impact` lo mide en dos niveles, e informa qué lo resguarda:

| Nivel | El radio es | Se lee de |
|-------|---------------|-----------|
| Proyectos | Los proyectos del repositorio que dependen de los que cambiaron, directamente o a través de otros | Los manifiestos |
| Archivos fuente | Los archivos que llaman a las funciones que cambiaron, y los archivos que usan a esos | El grafo de dependencias del código |

En cada nivel el radio es una cuenta sobre un total: `3 of 6 projects`, `2 of 618 source files`. Responde **de cuánto del sistema hay que preocuparse**. A su lado viene **lo que está desprotegido**: los archivos dentro del radio que ningún test ejercita. Un radio amplio cubierto por completo con tests es un cambio que hay que hacer con cuidado; un solo archivo del radio sin test es donde se va a romper sin aviso, y el informe lo nombra.

Otras dos medidas describen el cambio en sí y no su alcance: qué tan disperso es (**difusión**), y qué archivos suelen cambiar con él y quedaron fuera (**radio lógico**).


```bash
km impact --since-ref origin/main [path]         # la rama en la que estás
km impact --since-ref main --until-ref feature   # una rama, sin cambiarte a ella
git diff main... | km impact --diff -               # un parche
km impact --pr 123                               # un pull request de GitHub
```

## Qué se mide

| Origen | El cambio | El historial termina en | Los manifiestos y archivos se leen de |
|--------|------------|-----------------|-------------------------------|
| `--since-ref REF` | Desde donde `REF` y `HEAD` divergieron hasta el árbol de trabajo: cambios con commit, sin commit y sin seguimiento, y eliminaciones | Ese merge base | El árbol de trabajo |
| `--since-ref A --until-ref B` | Lo que `B` trae desde que divergió de `A`, sin importar qué rama tengas activa | Ese merge base | El árbol de `B` |
| `--diff FILE` | Un parche en formato git, desde un archivo o desde stdin (`-`) | `HEAD`, o donde `--since-ref` y `HEAD` divergieron si se indica | El árbol de trabajo |
| `--pr NUMBER` | Un pull request de GitHub | Como en el modo en que se resuelve | Como en el modo en que se resuelve |

Siempre es el cambio sobre todo el repositorio: `path` solo ubica el repositorio y no acota el análisis. Los archivos generados (archivos lock, recursos minificados) quedan fuera de todas las medidas.

**`--pr` requiere la [GitHub CLI](https://cli.github.com) (`gh`) instalada y autenticada.** kimun la ejecuta como un programa: no enlaza ningún cliente de GitHub ni guarda ningún token.

- Cuando el repositorio tiene los commits del pull request, se mide a partir de ellos, como entre dos refs. Un pull request integrado con squash o rebase, cuyo head nunca se trajo con fetch, se mide a partir del parche que sirve GitHub, leído contra el árbol del commit que lo integró. Su base y ese commit no se comparan: la base puede estar muchos merges atrás, y se contaría todo lo que se integró entre medio.
- En otro caso (un pull request desde un fork, o uno que no se trajo con fetch) su parche se obtiene de `gh pr diff` y se mide como cualquier otro parche, con un aviso en stderr. `git fetch origin pull/NUMBER/head` deja disponibles sus commits.

Un parche (`--diff`, o un pull request sin commits locales) se mide contra el árbol de trabajo, donde no está aplicado:

- debe estar en formato git con los prefijos `a/` y `b/`, tal como lo imprimen `git diff`, `git format-patch` y `gh pr diff`, sin colores;
- para una rama usa `git diff main...` (tres puntos): `git diff main` compara contra la punta de `main`, y muestra lo que `main` ganó desde entonces como si la rama lo hubiera deshecho. Para incluir el trabajo sin commit, `--since-ref main` es el camino directo;
- un proyecto que el parche crea no se conoce, así que sus archivos tienen alcance desconocido, y `--affected` lista todos los proyectos;
- si el parche ya está aplicado en `HEAD`, pasa `--since-ref` para que sus propios commits no se cuenten como historial.

## Blast radius: proyectos

Qué proyectos del repositorio alcanza el diff. Pensado para monorepos, donde un cambio en una biblioteca compartida alcanza aplicaciones que su autor quizás no conoce.

Un **proyecto** es un directorio con un manifiesto. Un proyecto **depende** de otro cuando su manifiesto lo nombra como dependencia local; las dependencias hacia registros u otros repositorios se ignoran. Un archivo modificado pertenece al proyecto más cercano por encima de él. El radio es todo proyecto que depende de uno que cambió, directamente o a través de otros.

| Ecosistema | Manifiesto | Dependencias locales que se leen |
|-----------|----------|-------------------------|
| Rust | `Cargo.toml` | dependencias con `path`, `workspace = true` resuelto a través de `[workspace.dependencies]`, en `[dependencies]`, `[dev-dependencies]`, `[build-dependencies]` y sus formas `[target.*]` |
| JavaScript / TypeScript | `package.json` | cualquier dependencia cuyo nombre sea otro paquete del repositorio (workspaces de npm, yarn y pnpm), además de `file:` y `link:` |
| Elixir | `mix.exs` | dependencias con `path:` e `in_umbrella: true` |
| Go | `go.mod`, `go.work` | módulos requeridos que son otro módulo del repositorio, y `replace` con un directorio |
| Python | `pyproject.toml` | cualquier requisito cuyo nombre sea otro proyecto del repositorio (sin distinguir mayúsculas ni `-`, `_`, `.`), y los que tienen un `path` en `[tool.uv.sources]` o en las tablas de Poetry; se leen `[project]` (`dependencies`, `optional-dependencies`), `[dependency-groups]`, `[build-system] requires`, `[tool.poetry]` y los grupos de desarrollo de uv y PDM |

```
Blast radius — projects reached through their manifests
──────────────────────────────────────────────────────────────────────────────
 3 of 6 projects reached (50%), 2 direct
 Changed: libs/core

 Changed    Reaches         Distance  Scope  Via
 libs/core  apps/inventory         1
 libs/core  libs/locker            1
 libs/core  apps/parcels           2         libs/locker
──────────────────────────────────────────────────────────────────────────────
Changed files outside every project (reach unknown): Makefile
```

- **Scope**: una dependencia `dev` (solo de desarrollo o de test) alcanza al dependiente, cuyos tests usan el proyecto que cambió, y se detiene ahí: el proyecto que cambió no es parte de lo que el dependiente entrega, así que no se alcanza a los dependientes del dependiente. Las dependencias `build` y `optional` siguen adelante igual que las de ejecución.
- **Raíces de workspace**: un `Cargo.toml` con `[workspace]`, un `package.json` con `workspaces` (o junto a un `pnpm-workspace.yaml`), un `mix.exs` umbrella con `apps_path`, un `go.work`, un `pyproject.toml` con `[tool.uv.workspace]`. Un cambio en el manifiesto o en el archivo lock de una de esas raíces (`Cargo.lock`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lock`, `mix.lock`, `uv.lock`) alcanza a todos los proyectos que tiene debajo a distancia 1, con scope `workspace`, y sigue adelante desde ellos. Una raíz de workspace es un proyecto por sí misma solo cuando declara uno (`[package]` en Cargo, `app:` en mix, `[project]` en Python); un `package.json` en una raíz de workspace nunca lo es.
- **Los archivos inertes** no alcanzan nada: un cambio en la documentación (`.md`, `.mdx`, `.rst`, `.adoc`, `.txt`) no rompe ninguna compilación ni ningún test. No cuenta como un cambio en su proyecto, ni como un archivo de alcance desconocido. `.kimun.toml` puede declarar más:

  ```toml
  [impact]
  inert = ["scripts/**", "notebooks/**"]   # globs, relative to the repository
  ```

- **Los archivos fuera de todo proyecto** (workflows de CI, configuración compartida) se listan aparte. Su alcance es desconocido, no cero.

- **`--affected`** imprime los proyectos cuyas compilaciones y tests pide el diff, uno por línea, y nada más: los que cambiaron y los alcanzados. Si algún archivo modificado está fuera de todo proyecto, imprime **todos** los proyectos y explica por qué en stderr: saltarse una suite de tests es peor que ejecutar una de más. Lee solo el diff y los manifiestos, no el historial.
- Un repositorio con un solo proyecto recibe una línea que dice que este nivel no aplica, en vez de "0 reached".
- En `node_modules`, `vendor` y `testdata` nunca se buscan manifiestos, ni en `deps`, `_build` y `target` (salvo que estén bajo `src`, `lib` o `app`, donde son parte del proyecto), ni tampoco en un directorio `fixtures` dentro de un directorio de tests. Una suite de extremo a extremo con su propio manifiesto (`test/e2e/package.json`) es un proyecto.

Límites:

- `mix.exs` es código y se lee como texto. Una dependencia cuya ruta se construye en tiempo de ejecución (`Path.expand(...)`, interpolación de strings, una lista generada) no se puede atribuir; el informe nombra el manifiesto y cuántas se le escaparon.
- De Python solo se lee `pyproject.toml`. Un proyecto que se declara en `setup.py` (que es código) o `setup.cfg` no se ve, ni una dependencia local escrita en `requirements.txt` (`-e ../lib`). Un `pyproject.toml` que solo configura herramientas, sin `[project]` ni `[tool.poetry]`, no es un proyecto. Los extras (`optional-dependencies`) son `optional`; los grupos de dependencias son `dev`.
- El acoplamiento entre ecosistemas no es visible: un cliente web y el servicio cuya API llama no tienen entre ellos ninguna dependencia de manifiesto.
- Un proyecto anidado en otro (`assets/package.json` dentro de una aplicación Phoenix) no tiene dependencia hacia el que lo contiene ni desde él, salvo que un manifiesto la declare.
- El grafo se lee del árbol de trabajo. Los archivos de un proyecto que el diff elimina o mueve ya no pertenecen a ningún proyecto: su alcance es desconocido, y los manifiestos que todavía lo nombran se informan como no leídos.

## Blast radius: archivos fuente

Dentro de los proyectos que el cambio afecta: qué archivos fuente usan lo que cambió, y cuáles de ellos no ejercita ningún test. Es la pregunta "los tests del módulo que cambié pasan; ¿quién más lo llama?".

La primera línea es la respuesta en corto: cuántos archivos llaman a lo que cambió, y cuántos de ellos no tienen test. `Radius` es la cuenta de los archivos que llaman a lo que cambió, y de los que usan a esos. `Upper bound` es lo que sería sin saber qué funciones cambiaron.

```
Structural radius — source files that use what changed
──────────────────────────────────────────────────────────────────────────────
 1 file calls what changed, 1 of them with no test
 Changed: lib/booking/insights.ex
 Functions: arrange
 Radius: 1 of 6 source files (17%): 1 at distance 1
 Not in the radius: 1 that refer to the module without calling it
 Upper bound, whatever the function: 4 files (67%)

 Tests  Dependent
  none  lib/booking_web/controllers/insight_controller.ex
            calls Insights.arrange
  none  lib/booking/export.ex
            refers to the module without calling it
──────────────────────────────────────────────────────────────────────────────
No test reaches 1 of the files that call what changed; an integration test is probably missing:
  lib/booking_web/controllers/insight_controller.ex
No test in the change exercises a file that uses what changed.
1 more with no test use the module without a call that tells whether the change concerns them.
```

Cómo se mide:

- El grafo de dependencias de `km deps` se lee hacia atrás desde los archivos fuente que cambiaron.
- En Elixir el cambio se **acota a funciones**: las líneas que toca el diff dicen qué funciones cambiaron, y un cambio en una función privada se traslada a las públicas que llegan a ella con llamadas locales. Un archivo que usa el módulo cae entonces en uno de tres casos: **llama** a una función que cambió, **se refiere** al módulo sin llamarlo (un struct, un `import`, un `use`), o solo llama a funciones que el cambio no toca, y no se lista. Cada archivo modificado se acota por separado. Fuera de las funciones, un `alias` o un `require` tocado no cambia ninguna (solo nombra lo que usan las funciones tocadas), y un atributo de módulo tocado cambia las funciones que lo leen. Un `use`, un `import`, un `defstruct` o un atributo que ninguna función lee puede concernir a todas las funciones: ese archivo no se acota, cuenta cada uso de él, y el informe dice qué línea fue. Un archivo nuevo nunca se acota.
- En Python el cambio se acota a los **nombres de nivel superior** del módulo: sus funciones, clases y asignaciones. Un método tocado cambia su clase; un decorador pertenece a lo que decora; un nombre que usa a uno que cambió también cambia, sea privado o no, porque nada impide que otro archivo lo importe. Un archivo que usa el módulo llama a lo que cambió cuando toma uno de esos nombres: `from m import nombre`, `m.nombre` sobre un módulo que importa (también bajo su alias) o, después de `from m import *`, un nombre que luego menciona. Un módulo entregado como valor puede dar cualquiera de sus nombres. Uno importado sin que se lea nada en él solo se refiere al módulo. Los imports, el docstring, un `if` o un `try` que solo elige imports, y el bloque `if __name__ == "__main__":` no cambian ningún nombre. Cualquier otro código al margen izquierdo se ejecuta al importar el módulo y puede concernir a todos los nombres: el archivo no se acota. No se ven: los nombres alcanzados en tiempo de ejecución (`getattr`, un registro llenado por decoradores, `mock.patch("m.nombre")`), ni qué llamadores usan el método que cambió. Un nombre que un paquete reexporta se sigue a través de su `__init__.py`, una distancia más lejos.
- El **radio** parte en los archivos que llaman a lo que cambió y sigue a quienes los usan, archivo por archivo. Un archivo que solo se refiere al módulo, sin una llamada que lo aclare, se lista pero no prolonga el radio: a un schema lo nombra medio proyecto, y seguir todo eso no dice nada. Tampoco se cuentan los archivos que solo pasan por un dependiente que el cambio no toca. Después del primer paso el radio sigue siendo por archivo, no por función, así que es una estimación por arriba. La **cota superior** es lo que sería el radio si contara cada uso de un archivo modificado, sea cual sea la función: en una base de código donde todo pasa por unos pocos contextos es la mayor parte del proyecto, y por eso el radio es el número que hay que leer.
- **Tests** dice cómo está protegido el dependiente. Un test rara vez nombra todo lo que ejercita (un controlador o una live view se prueban a través de su ruta, un helper a través de las vistas que lo usan), así que la protección viene en grados:

  | `Tests` | Protección | Cuándo |
  |---------|------------|------|
  | un número | directa | Esa cantidad de archivos de test se refieren a él, piden una ruta que él sirve, o están en el mismo lugar de la estructura de fuentes y tests (`lib/a/b.ex` y `test/a/b_test.exs`) |
  | `named` | por nombre | Un test lleva su nombre a un directorio de distancia (`live/page_live.ex` y `page_live_test.exs`), o el nombre del directorio en que está (`page_live/index.ex` y `page_live_test.exs`). Un test en el lugar de un archivo fuente es el test de ese archivo y no nombra a ningún otro: `app_test.exs` junto a `app.ex` no dice nada de los archivos de `app/` |
  | `users` | por quienes lo usan | No tiene test propio, pero un archivo que lo usa sí tiene uno |
  | `none` | ninguna | Ningún test llega a él |

  El soporte de tests (`test/support/`), la configuración y los scripts no son tests: una factory se refiere a todo y haría que todo pareciera protegido.
- Un archivo que llama a lo que cambió y al que ningún test llega está **desprotegido**: el cambio puede romperlo sin que ningún test lo note. Esa es la advertencia. Los dependientes se listan desde el menos protegido.
- **Los puntos de entrada** se distinguen del resto. Una tarea de línea de comandos o un script se ejecuta, no se usa: ningún test de otra cosa pasa por él, y pocos tienen uno propio. Sin test reciben una línea propia en lugar de la advertencia. Son los archivos bajo `mix/tasks/`, `management/commands/`, `bin/` y `scripts/` que ningún archivo fuente usa, más lo que declare `.kimun.toml`:

  ```toml
  [impact]
  entry_points = ["**/endpoint.ex"]   # globs, relative to the repository
  ```

- En Elixir, un test que pide una ruta protege al módulo que la sirve. Las rutas se leen del router de Phoenix del proyecto del test, con la ruta y el alias de cada `scope` que las rodea; `:id` coincide con un segmento cualquiera, y un segmento que el test escribe en tiempo de ejecución (`#{order.id}`) coincide solo con un parámetro de la ruta: pedir una orden no protege `/orders/new`.
- En Elixir, lo que un framework relaciona por convención cuenta como un uso. Un controlador de Phoenix usa las vistas que llevan su nombre (`PageController` y `PageJSON`, `PageHTML`, `PageView`), así que el test del controlador las protege. Un módulo usa los componentes que renderizan sus plantillas, ya sea que estén escritas en él con `~H`, guardadas en un archivo `.html.heex` a su lado (`page/index.ex` y `page/index.html.heex`) o en un directorio que lleva su nombre (`page_html.ex` y `page_html/home.html.heex`).


Se mide para los lenguajes cuyo grafo refleja el uso: Elixir, JavaScript/TypeScript, Kaikai, Python y Rust. Para Go el bloque dice que no está disponible, en vez de informar un radio trazado sobre declaraciones. Solo se leen los proyectos que el cambio afecta; el repositorio completo cuando el alcance sobre los proyectos es desconocido.

Límites: un test en el mismo lugar, o que lleva el nombre de un archivo, puede no ejercitar la llamada que cambió, y uno que se refiere a un archivo puede simular con mocks lo que este llama: la columna dice que existe un test, no que cubre. `users` es más débil todavía: dice que algo que usa el archivo tiene tests. Los nombres de función se comparan sin aridad. Los módulos nombrados en tiempo de ejecución (`apply/3`, configuración) o generados por macros no se ven. Una petición se lee cuando su ruta está escrita en la llamada (`live(conn, ~p"/orders")`), no cuando viene de una variable o de un helper, y una ruta cuando está declarada en una sola línea.

## Difusión

Qué tan disperso es el cambio.
 Kamei et al. encontraron que la difusión está entre los predictores más fuertes de un cambio que introduce defectos.

| Medida | Significado |
|---------|---------|
| Archivos modificados | Archivos agregados, modificados, renombrados o eliminados |
| Directorios | Directorios distintos que contienen un archivo modificado |
| Subsistemas | Directorios distintos de primer nivel (los archivos de la raíz forman uno más) |
| Líneas agregadas / eliminadas | Los archivos binarios no cuentan líneas |
| Entropía | Entropía de Shannon de las líneas modificadas sobre los archivos, dividida por su máximo: `0` cuando un solo archivo contiene todas las líneas modificadas, `1` cuando todos los archivos contienen la misma cantidad |

## Radio lógico

Archivos que suelen cambiar con los archivos del diff y que **no** están en él: un cambio que puede haberse olvidado. Detecta el acoplamiento que el código no declara: tests, configuración, migraciones.

```
Confidence = shared_commits / commits of the changed file
```

Un archivo se informa cuando algún archivo modificado alcanza `--min-confidence` con al menos `--min-shared` commits compartidos. La confianza es direccional, a diferencia de la fuerza de `km tc`: un archivo que cambió tres veces, siempre junto a uno que cambió cien veces, tiene fuerza 1.0, pero hace falta en el 3% de los cambios del otro.

- El historial termina en el merge base: los commits del diff nunca son evidencia de sí mismos.
- Los commits que tocan más de `--max-changeset` archivos se ignoran, y el informe dice cuántos fueron: un reformateo o un renombre en todo el proyecto relaciona sus archivos entre sí por accidente.
- Un archivo modificado sin historial (nuevo, o fuera de `--since`) no predice nada. Se lista aparte, para que su silencio no se lea como "sin impacto".
- Los archivos que ya no existen no se informan.
- Los archivos de test siempre son parte del análisis: un test que suele cambiar con el código es un cambio que conviene esperar.

Opciones:

| Flag | Descripción |
|------|-------------|
| `--since-ref REF` | Ref de git contra la que se compara, p. ej. `origin/main`, `HEAD`. Obligatoria salvo que se indique `--diff` o `--pr` |
| `--until-ref REF` | Mide hasta esta ref en lugar del árbol de trabajo (necesita `--since-ref`) |
| `--diff FILE` | Mide un parche en formato git; `-` lee de stdin |
| `--pr NUMBER` | Mide un pull request de GitHub; requiere `gh` instalado y autenticado |
| `--since DURATION` | Considera solo el historial desde este momento (p. ej. `6m`, `1y`, `30d`) |
| `--min-confidence F` | Confianza mínima para informar un archivo faltante (por defecto: `0.5`) |
| `--min-shared N` | Mínimo de commits compartidos para informar un archivo faltante (por defecto: `3`) |
| `--max-changeset N` | Ignora como evidencia los commits que tocan más de N archivos (por defecto: `30`) |
| `--affected` | Imprime solo los proyectos que cambiaron y los alcanzados, uno por línea |
| `--top N` | Muestra solo los N primeros archivos faltantes (por defecto: 20) |
| `--format {table,json,short,terse}` | Formato de salida (por defecto: table) |

Ejemplo de salida:

```
Change Impact — diff against main

Blast radius — projects reached through their manifests
──────────────────────────────────────────────────────────────────────────────
 Single project (.): no other project to reach; this level does not apply.
──────────────────────────────────────────────────────────────────────────────

Diffusion
  Files changed           5
  Directories             3
  Subsystems              2
  Lines added           120
  Lines deleted          30
  Entropy              0.82  (0 = one file holds the change, 1 = evenly spread)

Logical radius — files that usually change with this diff and are not in it
──────────────────────────────────────────────────────────────────────────────
 Missing file      Confidence   Shared  Changes with
──────────────────────────────────────────────────────────────────────────────
 src/tc/report.rs        0.80     8/10  src/tc/mod.rs (+1 more)
 README.md               0.50     6/12  src/cli.rs
──────────────────────────────────────────────────────────────────────────────
No history before the diff (new or never committed): src/impact/mod.rs
Generated files ignored: 1
```

Cuando las filas son demasiado anchas para una tabla (rutas largas), cada archivo faltante se lista en una línea propia con su evidencia debajo.

## Salida JSON, para herramientas y LLM

`--format json` lleva todo lo que muestra la tabla, y las listas que la tabla recorta. Un agente que revisa un cambio puede leerlo en este orden:

```bash
km impact --since-ref origin/main --format json
```

| Campo | Significado |
|-------|---------|
| `source` | El cambio medido: `diff against main`, `PR #12`, `patch from stdin` |
| `structural.functions` | Funciones que el cambio afecta (las públicas en Elixir, los nombres de nivel superior en Python), sobre los archivos que permiten saberlo; `null` cuando ninguno se pudo acotar |
| `structural.narrowing[]` | Por archivo modificado: `functions`, o `null` con la razón (`reason`) por la que cuenta cada uso de él |
| `structural.direct[]` | Cada archivo que usa un archivo modificado: `file`, `exposure` (`calls`, `refers`, `elsewhere`), `protection` (`direct`, `named`, `users`, `none`), `calls`, `tests`, `tests_in_diff`, `entry_point` |
| `structural.unprotected[]` | Archivos que llaman a lo que cambió y a los que ningún test llega, ni siquiera a través de lo que los usa: ahí falta un test de integración |
| `structural.untested_entry_points[]` | Tareas de línea de comandos y scripts que llaman a lo que cambió y no tienen test; no se cuentan como desprotegidos |
| `structural.unknown_without_tests[]` | Archivos que usan el módulo modificado sin una llamada que lo aclare, y que no tienen test |
| `structural.change_tests_a_dependent` | Si un test del cambio protege un archivo que usa lo que cambió |
| `structural.radius` | `files`, `source_files` y `share` (de 0 a 1): el radio como número |
| `structural.reach[]` | Los archivos del radio, por `distance` |
| `structural.upper_bound` | Archivos alcanzados si contara cada uso de un archivo modificado, sea cual sea la función |
| `structural.unavailable[]` | Lenguajes de archivos modificados para los que no se mide el nivel de archivos fuente |
| `projects.changed[]`, `projects.reached[]` | Proyectos que contienen un archivo modificado, y los alcanzados, cada uno con `origin`, `distance`, `via`, `scope` |
| `projects.affected[]` | Proyectos cuyas compilaciones y tests pide el cambio (lo que imprime `--affected`) |
| `projects.outside[]` | Archivos modificados que no pertenecen a ningún proyecto: su alcance es desconocido |
| `projects.inert[]` | Archivos modificados que no alcanzan nada: documentación, y lo que `.kimun.toml` declara inerte |
| `diffusion` | Archivos, directorios, subsistemas, líneas y entropía del cambio |
| `logical_radius.missing[]` | Archivos que suelen cambiar con el cambio y no están en él, con cada uno de los archivos que los predicen |

`km ai` expone el comando a un LLM como la herramienta `km_impact`, y la skill que instala `km ai skill` lo documenta.

`Shared` se lee como commits compartidos sobre los commits del archivo modificado.
 `(+1 more)` significa que otro archivo modificado predice el mismo archivo faltante; `--format json` los lista todos. `--format terse` imprime el número de archivos faltantes.

**Aviso:** los renombres de archivos no se siguen a lo largo del historial de git. Un archivo renombrado en el propio diff conserva el historial de su ruta anterior.
