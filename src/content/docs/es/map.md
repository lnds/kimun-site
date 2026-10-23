---
title: "km map"
description: "Diagrama de círculos del código"
---

Dibuja el código como círculos anidados, el diagrama de *Your Code as a Crime Scene*: cada directorio es un círculo que contiene los círculos de sus subdirectorios y archivos, el área de un archivo crece con sus líneas de código, y una métrica colorea los archivos. Una tabla ordena archivos; el mapa muestra dónde están los que resaltan, si dispersos o reunidos en un módulo, y cuán grande es ese módulo junto al resto.

```bash
km map --html map.html [path]
km map --html map.html --color-by hotspots --since 6m
km map --format json [path]   # el árbol dispuesto, para otras herramientas
```

La página es un único archivo HTML que no necesita nada más, en tema claro y oscuro. Un clic en un directorio hace zoom en él, un clic fuera de él o en **Up** lo deshace; al pasar el cursor sobre un archivo se ven su ruta, sus líneas y su valor. Los nombres de los directorios aparecen cuando su círculo es suficientemente grande. Al pie, la página da crédito a aquello en que se basa.

Los dos extremos de la escala son naranja bermellón y azul (Okabe-Ito), que se distinguen con todo tipo de daltonismo. **Patterns** los dibuja además sin color, líneas sobre los archivos naranjas y puntos sobre los azules, para imprimir en blanco y negro; la página se imprime con sus colores y sin sus controles.

| `--color-by` | Colores | Como |
|---|---|---|
| `score` (por defecto) | naranja bajo 70, gris de 70 a 90, azul desde 90 | `km score`, por archivo |
| `hotspots` | naranja según la proporción del hotspot mayor, gris bajo una décima de él | `km hotspots` |
| `churn` | alto naranja, medio naranja pálido, bajo gris | `km churn` |
| `age` | activo azul, inactivo gris, congelado naranja pálido | `km age` |
| `knowledge` | crítico naranja a bajo gris; naranja cuando el dueño está inactivo | `km knowledge` |
| `cycles` | naranja cuando el archivo está en un ciclo de dependencias | `km deps` |
| `llm` | azul desde 95 (apto para LLM), gris desde 70 (requiere cuidado), naranja bajo 70 (riesgo para LLM) | preparación para agentes de código, según `km score` |

Sobre el mapa va la proporción de las líneas en cada lado de la escala (`85% an LLM risk · 9% needing care · 5% LLM-friendly`), y en él una etiqueta con la ruta del directorio donde más se reúne cada lado (`Most LLM risk: src/tui/`), no el único lugar de ese lado: el directorio bajo la raíz con más de esas líneas y la mayor proporción de ellas, un directorio que es una parte del código y no casi todo. `--color-by llm` sigue la afirmación de que los agentes de código trabajan bien solo sobre código sano: CodeScene pone la vara en 9,5 de su Code Health, y 95 es su equivalente en la escala de 0 a 100 de `km score`, que se mide de otra forma. Ambos umbrales se pueden cambiar en `.kimun.toml` (`[map] llm_friendly = 95`, `llm_risk = 70`).

Los archivos sin valor (sin historia, un lenguaje sin grafo de dependencias) se dibujan tenues. Las métricas de git necesitan un repositorio y leen la historia desde `--since`; los umbrales vienen de `.kimun.toml` como los leen sus comandos. El layout empaqueta los hijos de cada directorio del más grande al más chico, luego por nombre, como `d3.pack` empaqueta círculos, así que el mismo código da el mismo mapa.

| Flag | Descripción |
|------|-------------|
| `--html FILE` | Escribe el mapa como una página HTML interactiva en este archivo |
| `--color-by METRIC` | `score` (por defecto), `hotspots`, `churn`, `age`, `knowledge`, `cycles` o `llm` |
| `--since TIME` | Lee la historia desde este momento (p. ej. `6m`, `1y`, `30d`) |
| `--format {table,json}` | `json` imprime el árbol dispuesto: cada nodo con `x`, `y`, `r`, `depth`, `parent`, `lines`, y para los archivos `heat` (-1 a 1) y `label` |
