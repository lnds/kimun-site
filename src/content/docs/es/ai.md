---
title: "km ai"
description: "Skill y análisis para agentes de código"
---

Conecta Kimün con agentes de código y modelos de lenguaje. Tiene tres subcomandos: `skill` y `permissions` preparan a Claude Code para usar `km`, y `analyze` le pide a un modelo que escriba un informe por su cuenta.

```bash
km ai skill claude
km ai permissions claude
km ai analyze claude [path]
```

El argumento de proveedor es siempre `claude`, el único soportado hoy.

## `km ai skill` — Instalar la skill

Instala una skill de Claude Code que le enseña al agente a ejecutar los subcomandos de `km` y a leer su salida JSON, para que mida antes de cambiar algo.

```bash
km ai skill claude                      # instala la skill
km ai skill claude --with-permissions   # y deja que km corra sin preguntar
```

No hace falta una clave de API: el modelo es el propio Claude Code.

| Flag | Descripción |
|------|-------------|
| `--with-permissions` | Configura además los permisos, como lo hace `km ai permissions` |

## `km ai permissions` — Ejecutar sin preguntar

Agrega reglas de permiso de Bash para todos los subcomandos de `km` al archivo `.claude/settings.local.json` del proyecto, para que Claude Code los ejecute sin preguntar cada vez. Se combina con los permisos que ya existen y es seguro ejecutarlo más de una vez.

```bash
km ai permissions claude
```

## `km ai analyze` — Un informe escrito por un modelo

Invoca a un modelo que usa las herramientas de `km` para analizar el repositorio y escribe un informe: salud del código, hotspots de complejidad, problemas de mantenibilidad y recomendaciones.

```bash
km ai analyze claude                      # analiza el directorio actual
km ai analyze claude src/                 # analiza un subdirectorio
km ai analyze claude --output report.md   # guarda el informe en un archivo
```

Llama a la API de Anthropic, así que necesita la variable de entorno `ANTHROPIC_API_KEY`.

| Flag | Descripción |
|------|-------------|
| `--model MODEL` | Modelo a usar |
| `-o`, `--output FILE` | Guarda el informe en un archivo |
