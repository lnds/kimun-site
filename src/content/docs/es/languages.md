---
title: "Lenguajes soportados"
description: "Los lenguajes que Kimün reconoce y cómo cuenta cada archivo."
---

| Lenguaje | Extensiones / Nombres de archivo |
|---|---|
| Bourne Again Shell | `.bash` |
| Bourne Shell | `.sh` |
| C | `.c`, `.h` |
| C# | `.cs` |
| C++ | `.cpp`, `.cxx`, `.cc`, `.hpp`, `.hxx`, `.hh` |
| Clojure | `.clj`, `.cljs`, `.cljc`, `.edn` |
| CMake | `.cmake`, `CMakeLists.txt` |
| CSS | `.css` |
| Dart | `.dart` |
| Dockerfile | `Dockerfile` |
| DOS Batch | `.bat`, `.cmd` |
| Elixir | `.ex` |
| EEx | `.eex` |
| Elixir Script | `.exs` |
| Erlang | `.erl`, `.hrl` |
| F# | `.fs`, `.fsi`, `.fsx` |
| Fortran 77 | `.f`, `.for`, `.ftn`, `.f77`, `.pfo` (y en mayúsculas) |
| Fortran 90 | `.f90`, `.F90` |
| Fortran 95 | `.f95`, `.F95` |
| Fortran 2003 | `.f03`, `.F03` |
| Fortran 2008 | `.f08`, `.F08` |
| Go | `.go` |
| Gradle | `.gradle` |
| Groovy | `.groovy` |
| Haskell | `.hs` |
| HTML | `.html`, `.htm` |
| HTML EEx | `.heex` |
| Java | `.java` |
| JavaScript | `.js`, `.mjs`, `.cjs` |
| jq | `.jq` |
| JSON | `.json` |
| JSX | `.jsx` |
| Julia | `.jl` |
| Kaikai | `.kai` |
| Kotlin | `.kt`, `.kts` |
| lex | `.l`, `.lex` |
| Lua | `.lua` |
| Makefile | `.mk`, `Makefile`, `makefile`, `GNUmakefile` |
| Markdown | `.md`, `.markdown` |
| Nim | `.nim` |
| Objective-C | `.m`, `.mm` |
| OCaml | `.ml`, `.mli` |
| Pascal | `.pas`, `.dpr`, `.dpk`, `.lpr`, `.pp`, `.pascal` |
| Perl | `.pl`, `.pm` |
| PHP | `.php` |
| Properties | `.properties` |
| Python | `.py`, `.pyi` |
| R | `.r`, `.R` |
| reStructuredText | `.rst`, `.rest` |
| Ruby | `.rb`, `Rakefile`, `Gemfile` |
| Rust | `.rs` |
| Scala | `.scala`, `.sc`, `.sbt` |
| SQL | `.sql` |
| Swift | `.swift` |
| Terraform | `.tf` |
| Text | `.txt` |
| TOML | `.toml` |
| TypeScript | `.ts`, `.tsx`, `.mts`, `.cts` |
| yacc | `.y`, `.yacc` |
| XML | `.xml`, `.xsl`, `.xslt`, `.svg`, `.fsproj`, `.csproj`, `.vbproj`, `.vcxproj`, `.sln`, `.plist`, `.xaml` |
| YAML | `.yaml`, `.yml` |
| Zig | `.zig` |
| Zsh | `.zsh` |

## Notas específicas por lenguaje

- **Kaikai**: `#[...]` abre un atributo, no un comentario `#`, así que los atributos
  cuentan como código. Los atributos de documentación (`#[doc("...")]`, incluida la
  forma de varias líneas `#[doc("""...""")]`) cuentan como comentarios y se excluyen
  de los análisis de complejidad, de Halstead y de smells.
- **Elixir**: los heredocs de `@moduledoc` y `@doc` (`"""`, `'''` y los sigilos
  `~S"""` y `~s"""`) cuentan como comentarios, como los cuenta cloc, y se excluyen
  de los análisis de complejidad, de Halstead y de smells. Un `@doc "..."` de una
  línea y cualquier otro heredoc cuentan como código.
- **Python**: un string con triple comilla, sobre todo un docstring, cuenta
  como comentario, como lo cuenta cloc: sus líneas son comentario salvo que
  compartan línea con código (`SQL = """` es código, las líneas que siguen son
  comentario).
- **Headers de C y C++**: un `.h` es C++ cuando su texto lo dice (una línea que
  empieza con `namespace`, `template`, `class`, un especificador de acceso,
  `using`, `constexpr`, o cualquier `std::`), y C en otro caso. cloc informa
  todos los headers como `C/C++ Header`; kimun los deja con el lenguaje que los
  analiza.
- **reStructuredText**: una línea que empieza con `..` (una directiva o un
  comentario) cuenta como comentario; cloc cuenta además como comentario las
  líneas indentadas bajo ella.
- **HTML EEx**: `<%!-- --%>` y las líneas que empiezan con `<% #` son
  comentarios, como los cuenta cloc. **EEx**: `<%# %>` es un comentario.
- **Fortran**: la forma libre (`.f90` y posteriores) comenta con `!`; la forma
  fija (`.f`, `.for`, `.f77`) además hace comentario de una línea con `C`, `c` o
  `*` en la primera columna. Las directivas de OpenMP y OpenACC (`!$omp`,
  `C$OMP`, `!$acc`) y la compilación condicional (`!$ `) cuentan como código,
  porque son directivas; cloc las cuenta como comentarios, y en forma libre
  también toma por comentario una línea que empieza con `c` en la primera
  columna (`contains`, `call`). En un string la barra invertida no escapa nada.
  Fortran no distingue mayúsculas de minúsculas, y tampoco lo hacen los análisis
  de complejidad, de Halstead y de smells, aunque los reportes nombran las
  funciones como están escritas. Las funciones son las unidades de programa
  (`subroutine`, `function`, `program`) hasta el `end` que las cierra, con las
  unidades que contienen; las de un bloque `interface` no declaran funciones. La
  anidación cognitiva se lee de las construcciones (`if … then`, `do`, `select`,
  `where`) y del `end` de cada una, no de la sangría, que la forma fija no tiene.
- **Pascal (Delphi, Free Pascal)**: tres clases de comentario: `//`, `{ … }` y
  `(* … *)`; los dos últimos se cierran solo con su propio delimitador. `{$…}` es
  una directiva del compilador y cuenta como código. Los strings van entre
  comillas simples, sin escapes con barra invertida; un delimitador dentro de uno
  no abre comentario (cloc no los distingue, así que suele contar código como
  comentario después de un `'{'` o de un `COUNT(*)`). Pascal no distingue
  mayúsculas de minúsculas, igual que Fortran. Las funciones son las rutinas de la
  implementación (`procedure`, `function`, `constructor`, `destructor`,
  `operator`, métodos de clase), desde su encabezado hasta el `end` de su bloque,
  con sus rutinas locales; las declaraciones de la sección `interface` y de los
  tipos de clase, y las `forward` o `external`, no tienen cuerpo. Los encabezados
  repetidos bajo compilación condicional son una sola rutina. La anidación
  cognitiva se lee de la sangría, dos columnas por nivel.
- **Las líneas interiores de los strings de varias líneas** (los literales con
  triple comilla de Kaikai, los heredocs de Elixir) cuentan como código
  para `km loc`, pero se excluyen de los análisis ciclomático, cognitivo, de
  Halstead y de smells: la prosa y los datos incrustados no son flujo de control.
- **Los strings crudos de Rust** (`r"..."`, `r#"..."#` y las formas con más `#`,
  también con prefijo `b` o `c`) terminan solo en una comilla seguida de tantos `#`
  como los que los abrieron, y abarcan varias líneas. Lo que contienen cuenta como
  código para `km loc`, se parezca a lo que se parezca, y queda fuera de los
  análisis ciclomático, cognitivo, de Halstead y de smells.


## Características

- Respeta automáticamente las reglas de `.gitignore`
- Elimina archivos repetidos por hash de contenido (los archivos idénticos se cuentan una vez)
- Detecta los lenguajes por la extensión del archivo, por su nombre o por la línea shebang
- Soporta comentarios de bloque anidados (Rust, Haskell, OCaml, etc.)
- Trata los pragmas (p. ej., `{-# LANGUAGE ... #-}` de Haskell) como código
- Las líneas mixtas (código + comentario) se cuentan como código, igual que en `cloc`
- Lee enteras las fuentes en cualquier codificación de 8 bits (Latin-1, Windows-1252): los bytes que no son UTF-8 se reemplazan, no se toman por el fin del archivo
