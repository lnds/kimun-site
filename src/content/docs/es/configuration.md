---
title: "Configuración"
description: "El archivo .kimun.toml: umbrales, compuertas de calidad y cómo generarlo con km init."
---

Ejecuta `km init` para analizar tu proyecto y generar un `.kimun.toml` calibrado en un solo paso:

```
$ km init
Analyzing project... done.

Current state:
  avg function length: 38 lines  →  suggested max_lines = 45
  avg param count:     3.2       →  suggested max_params = 4
  dup ratio:           4.1%      →  suggested max_dup_ratio = 5.0
  health score:        B+        →  suggested fail_below = B

Write .kimun.toml with these values? [Y/n]
```

Usa `--yes` para saltarte la pregunta. Agrega `-y` en CI para escribir el archivo sin interacción.

Como alternativa, pon a mano un archivo `.kimun.toml` en la raíz de tu repositorio para fijar los valores por defecto del proyecto para los umbrales y las compuertas de calidad. `km` busca el archivo en la raíz del repositorio git y, si no lo encuentra, en el directorio actual.

Los flags de la línea de comandos siempre tienen precedencia sobre `.kimun.toml`, que a su vez tiene precedencia sobre los valores por defecto incorporados.

```toml
[smells]
max_lines  = 30    # flag functions longer than N body lines (default: 50)
max_params = 3     # flag functions with more than N parameters (default: 4)

[dups]
min_lines      = 8     # minimum block size for duplication detection (default: 6)
                       # also applies to `km report` and `km score`
max_duplicates = 10    # CI gate: fail if duplicate groups exceed N
max_dup_ratio  = 5.0   # CI gate: fail if duplicated-lines ratio exceeds this %

[score]
model      = "cogcom"  # scoring model: cogcom (default) or legacy
fail_below = "B-"      # CI gate: fail if health score is below this grade

[age]
active_days = 60    # files modified within N days are Active (default: 90)
frozen_days = 180   # files not modified for more than N days are Frozen (default: 365)

[tc]
min_degree   = 5    # minimum commits per file to include in coupling analysis (default: 3)
min_strength = 0.5  # only show pairs with coupling strength >= this value

[hotspots]
complexity = "cogcom"  # complexity metric: indent (default), cycom, or cogcom

[impact]
inert = ["scripts/**"]  # changed files that reach nothing, besides documentation
entry_points = ["**/endpoint.ex"]  # files run rather than used, besides tasks and scripts
```

Todas las secciones y todos los campos son opcionales: omite los que no necesites. Hay una plantilla completamente documentada en [`.kimun.toml.example`](https://github.com/lnds/kimun/blob/main/.kimun.toml.example).
