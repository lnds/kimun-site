---
title: "Referencias"
description: "Los libros y artículos en que se basan las métricas de Kimün."
---

Las métricas y metodologías implementadas en Kimün se basan en las siguientes fuentes:

## Libros

- **Adam Thornhill**, *Your Code as a Crime Scene* (Pragmatic Bookshelf, 2015). Base del análisis de hotspots (caps. 4–5), del acoplamiento temporal (cap. 7), de los mapas de conocimiento y la propiedad del código (caps. 8–9), y de la complejidad por indentación como indicador indirecto de la calidad del código.
- **Adam Thornhill**, *Software Design X-Rays* (Pragmatic Bookshelf, 2018). Extiende la metáfora de la escena del crimen con más técnicas de análisis del comportamiento del código.

## Artículos y estándares

- **Maurice H. Halstead**, *Elements of Software Science* (Elsevier, 1977). Define las métricas de operadores y operandos: vocabulario, volumen, dificultad, esfuerzo, bugs estimados y tiempo de desarrollo.
- **Thomas J. McCabe**, "A Complexity Measure", *IEEE Transactions on Software Engineering*, SE-2(4), diciembre de 1976, pp. 308–320. Presenta la complejidad ciclomática como medida de los caminos independientes en el grafo de flujo de control de un programa.
- **Paul Oman & Jack Hagemeister**, "Metrics for Assessing a Software System's Maintainability", *Proceedings of the International Conference on Software Maintenance (ICSM)*, 1992. Fórmula original del índice de mantenibilidad, que combina el volumen de Halstead, la complejidad ciclomática y las líneas de código.
- **Microsoft**, [Code Metrics — Maintainability Index range and meaning](https://learn.microsoft.com/en-us/visualstudio/code-quality/code-metrics-maintainability-index-range-and-meaning). Variante de Visual Studio: normalizada a una escala de 0 a 100, sin el término de peso de los comentarios.
- **Verifysoft**, [Maintainability Index](https://www.verifysoft.com/en_maintainability.html). Fórmula extendida del MI con un componente de peso de los comentarios (MIcw) que premia el código bien comentado.
- **Yasutaka Kamei et al.**, "A Large-Scale Empirical Study of Just-in-Time Quality Assurance" (IEEE TSE 39(6), 2013). Base de las medidas de difusión de `km impact`.
- **Thomas Zimmermann, Andreas Zeller, Peter Weissgerber, Stephan Diehl**, "Mining Version Histories to Guide Software Changes" (IEEE TSE 31(6), 2005). Base del radio lógico de `km impact`.
