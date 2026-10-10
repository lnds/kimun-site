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
| C++ | `.cpp`, `.cxx`, `.cc`, `.hpp`, `.hxx` |
| Clojure | `.clj`, `.cljs`, `.cljc`, `.edn` |
| CSS | `.css` |
| Dart | `.dart` |
| Dockerfile | `Dockerfile` |
| DOS Batch | `.bat`, `.cmd` |
| Elixir | `.ex` |
| Elixir Script | `.exs` |
| Erlang | `.erl`, `.hrl` |
| F# | `.fs`, `.fsi`, `.fsx` |
| Go | `.go` |
| Gradle | `.gradle` |
| Groovy | `.groovy` |
| Haskell | `.hs` |
| HTML | `.html`, `.htm` |
| Java | `.java` |
| JavaScript | `.js`, `.mjs`, `.cjs` |
| JSON | `.json` |
| Julia | `.jl` |
| Kaikai | `.kai` |
| Kotlin | `.kt`, `.kts` |
| Lua | `.lua` |
| Makefile | `.mk`, `Makefile`, `makefile`, `GNUmakefile` |
| Markdown | `.md`, `.markdown` |
| Nim | `.nim` |
| Objective-C | `.m`, `.mm` |
| OCaml | `.ml`, `.mli` |
| Perl | `.pl`, `.pm` |
| PHP | `.php` |
| Properties | `.properties` |
| Python | `.py`, `.pyi` |
| R | `.r`, `.R` |
| Ruby | `.rb`, `Rakefile`, `Gemfile` |
| Rust | `.rs` |
| Scala | `.scala`, `.sc`, `.sbt` |
| SQL | `.sql` |
| Swift | `.swift` |
| Terraform | `.tf` |
| Text | `.txt` |
| TOML | `.toml` |
| TypeScript | `.ts`, `.mts`, `.cts` |
| XML | `.xml`, `.xsl`, `.xslt`, `.svg`, `.fsproj`, `.csproj`, `.vbproj`, `.vcxproj`, `.sln`, `.plist`, `.xaml` |
| YAML | `.yaml`, `.yml` |
| Zig | `.zig` |
| Zsh | `.zsh` |

## Notas específicas por lenguaje

- **Kaikai**: `#[...]` abre un atributo, no un comentario `#`, así que los atributos
  cuentan como código. Los atributos de documentación (`#[doc("...")]`, incluida la
  forma de varias líneas `#[doc("""...""")]`) cuentan como comentarios y se excluyen
  de los análisis de complejidad, de Halstead y de smells.
- **Las líneas interiores de los strings de varias líneas** (los literales con
  triple comilla de Kaikai y Python) cuentan como código para `km loc`, pero se
  excluyen de los análisis ciclomático, cognitivo, de Halstead y de smells: la
  prosa y los datos incrustados no son flujo de control.


## Características

- Respeta automáticamente las reglas de `.gitignore`
- Elimina archivos repetidos por hash de contenido (los archivos idénticos se cuentan una vez)
- Detecta los lenguajes por la extensión del archivo, por su nombre o por la línea shebang
- Soporta comentarios de bloque anidados (Rust, Haskell, OCaml, etc.)
- Trata los pragmas (p. ej., `{-# LANGUAGE ... #-}` de Haskell) como código
- Las líneas mixtas (código + comentario) se cuentan como código, igual que en `cloc`
