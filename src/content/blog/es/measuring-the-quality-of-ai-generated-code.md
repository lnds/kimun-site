---
title: "Kimün: midiendo la calidad del código generado por la IA"
description: "Por qué existe Kimün: cuando un agente escribe cientos de líneas por hora, saber si ese código es bueno no puede ser un acto de fe. Tiene que ser una medición."
date: 2026-10-12
---

> «No puedes controlar lo que no puedes medir.»
>
> Tom DeMarco

Hay un miedo antiguo en nuestra profesión. No es nuevo, pero la IA lo amplificó: **¿cómo sé que el código que estoy generando es bueno?**

Es una pregunta legítima. Cuando le pides a un agente de IA que te escriba una función, un módulo completo o incluso un proyecto entero, estás delegando decisiones que antes tomabas línea por línea. Y sí, el resultado puede compilar, pasar los tests y hasta verse elegante. Pero ¿es mantenible? ¿Es demasiado complejo? ¿Tiene duplicaciones ocultas? ¿Vas a entenderlo en seis meses?

La respuesta no puede ser un acto de fe. Tiene que ser una medición.

Muchos desarrolladores confían ciegamente en el código que genera la IA. Otros lo rechazan por principio. Ambas posturas son cómodas, y ambas son equivocadas.

Lo que necesitamos son herramientas que nos permitan **evaluar objetivamente** la calidad del código, venga de donde venga: de un humano, de un LLM o de una combinación de ambos.

Existen productos comerciales para esto. Codacy, SonarQube y CodeClimate hacen un trabajo respetable. Pero yo quería algo diferente: una herramienta que fuera **rápida, que corriera en la terminal, que pudiera integrarse directamente con agentes de IA**, y que estuviera basada en investigación sólida, no en reglas arbitrarias inventadas por un comité.

Así nació **Kimün**.

## ¿Qué es Kimün?

Kimün significa «conocimiento» o «sabiduría» en mapudungun. Es una herramienta de línea de comandos para analizar la calidad del código: un solo binario, `km`, que reemplaza toda una colección de herramientas. Cuenta líneas como `cloc`, mide complejidad como SonarQube y aplica las ideas de Adam Tornhill para leer la historia de un repositorio.

Está escrita en Rust, es rápida y reconoce más de cuarenta lenguajes.

## La ciencia detrás de Kimün

No inventé nada nuevo. Kimün implementa métricas que tienen décadas de investigación detrás.

### Métricas de Halstead

En 1977, Maurice Halstead propuso medir el software como si fuera un fenómeno físico. Sus métricas extraen los operadores y operandos del código fuente para calcular:

- **Volumen**: el tamaño del programa en bits de información.
- **Dificultad**: el esfuerzo mental necesario para comprenderlo.
- **Esfuerzo**: el trabajo total requerido.
- **Estimación de bugs**: los defectos que predice la fórmula V/3000.

Halstead fue criticado en su época. Pero sus métricas siguen siendo sorprendentemente útiles como indicadores relativos: te dicen qué archivos son más densos, más propensos a errores y más costosos de mantener.

### Complejidad ciclomática

Thomas McCabe propuso en 1976 contar los caminos independientes que atraviesan el código. Cada `if`, cada `for`, cada `while` agrega un camino. Más caminos son más estados posibles, y código más difícil de probar y de entender.

### Complejidad cognitiva

La complejidad ciclomática cuenta caminos, pero no distingue un `switch` plano de cuatro condiciones anidadas, y cualquiera que haya leído ambos sabe que no cuestan lo mismo. La complejidad cognitiva, el método que propuso SonarSource, mide qué tan difícil es *entender* el código: castiga el anidamiento y deja pasar el flujo lineal.

### El trabajo de Tornhill

Adam Tornhill cambió la forma en que pensamos sobre la calidad del código con sus libros *Your Code as a Crime Scene* y *Software Design X-Rays*. Su idea central: **el código más problemático no es el más complejo, sino el que es complejo y además cambia con frecuencia**.

Kimün implementa tres análisis inspirados en Tornhill:

- **Hotspots**: combina la frecuencia de cambios en git con la complejidad del código. Un archivo complejo que nadie toca es un riesgo menor. Un archivo complejo que se modifica cada semana es una bomba de tiempo.
- **Mapas de conocimiento**: analiza `git blame` para detectar concentración de conocimiento. Si una sola persona es dueña de más del 80% de un módulo crítico, tienes un problema de *bus factor*.
- **Acoplamiento temporal**: identifica los archivos que siempre cambian juntos en los commits, y así revela dependencias de arquitectura que el código no declara.

### Complejidad por indentación

También inspirada en Tornhill: Kimün mide cuánto varía la profundidad de la indentación. Es una heurística simple pero poderosa, porque el código profundamente anidado es difícil de seguir. La desviación estándar de la indentación se correlaciona bien con la complejidad que perciben los desarrolladores.

## El score: una nota para tu código

El comando estrella de Kimün es `km score`. Combina cinco dimensiones en una sola calificación, de A++ a F--:

| Dimensión | Peso | Qué mide |
|---|---|---|
| Complejidad cognitiva | 30% | Qué tan difícil es entender el código |
| Duplicación | 20% | Porcentaje de código duplicado |
| Esfuerzo de Halstead | 20% | Esfuerzo mental por línea de código |
| Complejidad por indentación | 15% | Variación de la profundidad de anidamiento |
| Tamaño de archivo | 15% | Puntaje completo hasta 500 líneas; baja a 0 en 4.000 |

Correrlo es trivial:

```bash
km score .
```

Obtienes la nota del proyecto y su desglose por dimensión. Si quieres ver más archivos problemáticos:

```bash
km score . --bottom 20
```

Esto te muestra los 20 archivos que más atención necesitan. Es perfecto para decidir qué refactorizar primero.

¿Necesitas integrarlo en un pipeline de CI/CD? Los comandos que miden responden en JSON:

```bash
km score . --format json
```

Y puedes usar la nota como compuerta. Este comando compara tu rama con la principal y falla si el código empeoró:

```bash
km score --trend origin/main --fail-if-worse
```

Todas las opciones están en la [documentación de `km score`](/docs/score/).

## La integración con Claude Code

Aquí es donde la cosa se pone interesante. Kimün se integra directamente con Claude Code, con un solo comando:

```bash
km ai skill claude
```

Esto instala una *skill* que le enseña a Claude Code los comandos de `km`. Una vez instalada, puedes pedirle cosas como:

> «Analiza la calidad del código de este proyecto.»

> «Muéstrame los hotspots de los últimos seis meses.»

> «¿Qué archivos tienen peor mantenibilidad?»

Claude Code ejecuta los comandos de `km` que correspondan, interpreta los resultados en JSON y te entrega un análisis narrado. Es como tener un auditor de código que habla tu idioma.

La gracia es que esto **cierra el ciclo**: usas IA para generar código, y luego usas IA más métricas objetivas para evaluarlo. No es fe ciega. Es verificación asistida.

## Instalación

La forma más sencilla es con Homebrew:

```bash
brew install lnds/kimun/kimun
```

Si ya tienes instalado el toolchain de Rust, también puedes usar Cargo:

```bash
cargo install kimun
```

Y si prefieres descargar el binario ya compilado, hay versiones para macOS (Apple Silicon), Linux (x86_64 y arm64) y Windows en la [página de releases](https://github.com/lnds/kimun/releases).

## Por qué construí esto

Llevo poco más de dos años usando agentes de IA para escribir código. Y me di cuenta de que la conversación sobre calidad estaba dominada por dos extremos: los evangelistas que dicen que la IA escribe código perfecto, y los escépticos que dicen que todo lo que genera es basura.

La verdad, como siempre, está en los datos. No en las opiniones.

Kimün es mi forma de poner números sobre la mesa. De decir: «este módulo tiene una complejidad ciclomática de 47 y un índice de mantenibilidad de 23. No importa quién lo escribió, hay que refactorizarlo».

Las métricas no reemplazan el juicio humano. Pero te dan una base objetiva para tomar decisiones. Y cuando generas cientos de líneas de código por hora con ayuda de la IA, esa base objetiva es más necesaria que nunca.

## Pruébalo

El código está en [GitHub](https://github.com/lnds/kimun). Es código abierto, se mantiene activamente y acepto contribuciones.

Corre `km score .` en tu proyecto. Mira la nota. Si te sorprende, bien: para eso están las métricas, para mostrarte lo que no querías ver.

---

*Una primera versión de esta nota apareció el 25 de febrero de 2026 en [La Naturaleza del Software](https://lnds.net/blog/lnds/2026/02/25/kimun-midiendo-la-calidad-del-codigo-generado-por-la-ia/). Esta edición la pone al día con lo que `km` hace hoy.*
