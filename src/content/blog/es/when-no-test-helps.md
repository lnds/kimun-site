---
title: "Cuando ninguna prueba avisa"
description: "En el artículo anterior, una prueba siempre le dijo al agente dónde mirar. Esta vez le quitamos esa ayuda: errores que la suite no detecta y solo un reporte del síntoma. [PENDIENTE: una frase con el resultado.]"
date: 2026-10-30
authors: [Madu, Edo. Díaz]
---

<!-- BORRADOR. Los datos marcados [PENDIENTE] salen del experimento, que todavía no se corre. -->

En [el artículo anterior](/blog/is-your-code-llm-friendly/) pusimos a prueba `km map --color-by llm` con 47 errores. En código que el modelo conocía, el naranja casi no importó; en sc-cli, un proyecto que casi seguro no estaba en sus datos de entrenamiento, el agente gastó un tercio más de tokens en los archivos naranjas.

Pero en esas dos rondas hubo una ayuda que no medimos: **siempre había una prueba que fallaba**. El agente leía la traza del error, buscaba la función y leía unas 40 líneas. Con una pista así, el tamaño del archivo casi da lo mismo.

En la vida real no siempre hay pista. Un usuario reporta que algo se comporta raro, ninguna prueba falla y alguien tiene que encontrar la causa. Ahí es donde un archivo difícil de entender debería pasar la cuenta completa.

## Los errores que la suite no ve

Cuando [kalku](https://kalku.tools) lanzó 304 mutantes sobre sc-cli, la suite mató 49. Los otros 255 sobrevivieron: son cambios de un token (`<` por `<=`, un `&&` por `||`, un valor de retorno distinto) que dejan todas las pruebas en verde. Cada uno es un error que podría estar hoy en producción sin que nadie lo sepa.

| Archivo | Nota | Mutantes | Sobrevivieron |
|---|---|---|---|
| `git/mod.rs` | 99,5 | 44 | 41 |
| `git/operations.rs` | 92,5 | [PENDIENTE] | 4 |
| `api/client.rs` | 57,3 | 60 | 53 |
| `main.rs` | 30,7 | 60 | 57 |
| `ui/mod.rs` | 15,3 | 60 | 43 |

*[PENDIENTE: revisar la fila de `operations.rs`; el reporte de kalku la agrupa con `config.rs` y `story_creator.rs`.]*

No todos sirven. Algunos mutantes son equivalentes: cambian el código pero no el comportamiento, y ningún usuario podría notarlos. Para cada sobreviviente que elegimos, escribimos una prueba que lo detecta. Si no pudimos escribirla, lo descartamos. Esa prueba queda escondida: el agente no la ve, y la usamos al final para saber si el arreglo es correcto.

## Cómo lo medimos

Mismo modelo y mismo método que antes: una copia aislada del proyecto por error, con un historial de git nuevo, y un agente (Claude Sonnet) por copia. Lo que cambia es lo que recibe el agente. En vez de "esta prueba falla", recibe un reporte como el que escribiría un usuario:

> *Al listar historias con `--all`, la última página nunca aparece. Con 30 historias veo 25.*

*[PENDIENTE: reemplazar este ejemplo por un reporte real del experimento.]*

El reporte describe el síntoma, no la causa: ni el archivo, ni la función, ni la línea. Lo escribimos mirando solo el comportamiento del programa mutado.

[PENDIENTE: cuántos errores quedaron en archivos azules y cuántos en naranjas.] Al final, para cada intento, revisamos tres cosas:

1. **¿La prueba escondida pasa?** Es decir, ¿el agente arregló el error de verdad?
2. **¿Pasa el resto de la suite?** Un arreglo que rompe otra cosa no cuenta.
3. **¿Cuánto costó?** Tokens de entrada acumulados, herramientas usadas y el código que el agente sumó a su contexto.

## Resultados

| | Azules (n=[PENDIENTE]) | Naranjas (n=[PENDIENTE]) |
|---|---|---|
| Arreglo correcto (la prueba escondida pasa) | [PENDIENTE] | [PENDIENTE] |
| Rompió otra cosa | [PENDIENTE] | [PENDIENTE] |
| Herramientas usadas (mediana) | [PENDIENTE] | [PENDIENTE] |
| Tokens de entrada acumulados (mediana) | [PENDIENTE] | [PENDIENTE] |

[PENDIENTE: el párrafo central. Dos guiones posibles, según lo que salga:]

- *Si el naranja cobra más:* sin pruebas, la diferencia [crece de un tercio a PENDIENTE]. El agente ya no puede saltar a la línea culpable: tiene que leer el flujo del programa hasta dar con el lugar donde el comportamiento se tuerce, y en un archivo de 3.000 líneas con nota 15 ese recorrido es largo.
- *Si no cobra más:* sorpresa. [Explicar qué hizo el agente para orientarse sin pruebas: ¿escribió sus propias pruebas? ¿usó git? ¿leyó el archivo entero?]

[PENDIENTE: uno o dos casos concretos, como el de `linegen.py` en el artículo anterior. Qué reporte recibió, qué leyó, dónde se perdió, cuánto gastó.]

## Lo que hace el agente cuando no hay pista

[PENDIENTE: lo que muestren los transcripts. Preguntas que vale la pena contestar:]

- ¿Escribe una prueba que reproduzca el síntoma antes de tocar el código, como haría una persona con oficio?
- ¿Cuántas veces "arregla" algo que no era el error?
- ¿Reporta éxito sin haber reproducido el síntoma? En el artículo anterior, dos agentes dijeron que las pruebas pasaban sin mirar el resultado.

## Qué dice el estudio de CodeScene

En enero, Markus Borg, Adam Tornhill y otros autores publicaron [un estudio](https://arxiv.org/abs/2601.02200) sobre la misma pregunta, con otra tarea: le pidieron a varios modelos refactorizar 5.000 programas en Python y midieron cuántas veces rompían las pruebas. Los modelos medianos rompieron entre un 15% y un 30% menos el código sano. Claude Code, en cambio, rompió cerca del 5% en ambos grupos: fue tan conservador que casi solo renombró variables.

Las dos cosas se complementan. Ellos miden si el agente rompe el código; nosotros, cuánto le cuesta arreglarlo. Y su propio trabajo pendiente es el código muy malo, porque su muestra tenía pocos archivos bajo 7 de Code Health. sc-cli tiene el 87% de sus líneas bajo 70 en la escala de Kimün.

## Qué no mide este experimento

- **[PENDIENTE] casos**, una corrida por error y un solo modelo.
- **Seguimos en un solo proyecto**, con pocos archivos distintos.
- **Los reportes los escribimos nosotros.** Uno más vago o más preciso puede cambiar el resultado, aunque usamos el mismo estilo para todos.
- **Un mutante es un error artificial.** Los errores reales suelen venir de requisitos mal entendidos, no de un `<` en lugar de un `<=`.

## Lo que nos llevamos

[PENDIENTE: dos o tres conclusiones prácticas, según el resultado. Borrador:]

1. **Las pruebas son el mapa del agente.** Sin ellas, [lo que muestre el dato].
2. **Corre kalku antes de soltar un agente.** Los mutantes que sobreviven son los lugares donde un agente no va a tener pista si algo falla ahí.
3. **El naranja sin pruebas es el peor lugar del código** para delegar a ciegas. `km map --color-by llm` muestra dónde está el naranja; la cobertura y kalku, dónde no hay red.

En el próximo artículo vamos a la otra pregunta: **¿cuánto pesa la memoria?** Repetiremos la primera ronda sobre click, flask y black con todos los nombres cambiados, para que el modelo no pueda reconocerlos.

---

*[PENDIENTE: enlace a los datos en lnds/kimun-llm-experiment.]*
