# Teseracto English · Inglés que se construye

**Primera versión funcional · Academia Teseracto · 24 de noviembre de 2026**

Una web estática, gratuita de alojar en GitHub Pages, creada para practicar inglés desde los cimientos y reutilizar cada estructura en frases cada vez más completas. No necesita cuentas de alumno, servidor, base de datos, herramientas de pago ni claves de acceso.

## Qué está terminado

- **20 bloques didácticos y 60 etapas** con códigos **001A–020C**, tres etapas por bloque: **A (comprender), B (entrenar), C (aplicar)**.
- Presente del verbo *be*, negación e interrogación, *can*, *have/has*, verbos habituales con *do/does*, *-ing*, contraste entre presente simple y continuo, adjetivos, adverbios, *will*, pasado regular e irregular y preguntas con *did*, con repaso integrador.
- **200 actividades** autocorregibles aproximadamente: 9 actividades comunes más una adaptada a cada franja de edad por bloque (cada alumno realiza 10 por bloque).
- Tres contextos de ejemplos: **niños / adolescentes / adultos**. El itinerario gramatical es común.
- Niveles accesibles por código, botón para volver, indicador de progreso y marcador de continuidad.
- Retos rápidos de 8 preguntas, preguntas que se repiten tras errores, historiales breves y puntuación de práctica (XP).
- Lectura de ejemplos en voz alta mediante síntesis de voz del navegador (si el dispositivo lo permite).
- Enlaces complementarios a recursos de British Council y BBC, alojados por sus respectivos editores.
- Materiales: tres PDF incluidos en `materiales/`; también es posible imprimir cada etapa y crear un PDF desde «Imprimir».
- Registro breve para docente y **exportación/importación JSON** (copia del progreso).
- Diseño adaptable a móvil, tablet y ordenador. Se incluye el icono de Teseracto.

## Publicarlo en GitHub Pages

1. Entra en GitHub con el usuario que administrará la academia. Crea un repositorio **público y nuevo** llamado `teseracto-english` (sin modificar `juego-lengua` u otras webs anteriores).
2. **Descomprime el ZIP**. Sube al repositorio **todo su contenido**, de modo que el archivo `index.html` quede en la raíz del repositorio (no dentro de una carpeta extra).
3. Abre **Settings → Pages → Build and deployment**. Elige **Deploy from a branch**, rama `main`, carpeta `/ (root)` y pulsa **Save**.
4. Cuando GitHub complete la publicación, la dirección habitual será `https://TU-USUARIO.github.io/teseracto-english/`. Puedes guardarla y compartirla con los alumnos.
5. Comprueba que se cargan el índice, los audios generados por el navegador, los ejercicios y los PDF. La primera publicación puede tardar un poco en aparecer.

> Si el repositorio no se llama `teseracto-english`, la URL final cambia. No debe anunciarse como publicada hasta confirmar la dirección en GitHub Pages.

## Uso por los alumnos

**1.** Seleccionar «Niños», «Adolescentes» o «Adultos» en **Perfiles**. No hace falta introducir un nombre real; basta un alias o el perfil inicial.

**2.** Elegir `001A` o continuar por el código que les haya indicado el profesor. El alumno puede saltar directamente a un código publicado desde **Mi ruta**.

**3.** Leer la estructura, escucharla, repetirla, practicar y comprobar las respuestas. Es recomendable escribir una frase original y mantener una pequeña conversación real antes de cerrar cada sesión.

**4.** Anotar el código en un cuaderno: «Me quedé en 014B». La plataforma también conserva un marcador local.

**5.** Exportar una copia JSON del progreso desde **Perfiles**. Importar ese archivo en otro dispositivo sustituye los recorridos actuales de ese navegador: conviene exportarlos primero.

**Importante:** los resultados se guardan en el almacenamiento local del navegador, **no en GitHub**, y **no se sincronizan entre dispositivos**. Borrar los datos de navegación o utilizar modo privado puede borrar el progreso. Los códigos de nivel sí son universales.

## Qué significan A, B y C

Las letras son **subetapas propias de Teseracto** y no se corresponden con A1, A2 o C1 del Marco Común Europeo. Una etapa se marca «superada hoy» con al menos un 75% de aciertos en ese intento, no como «competencia consolidada» ni como acreditación oficial. Para afirmar que hay aprendizaje estable hace falta revisarlo más adelante y observar su uso en comunicación real.

El itinerario previsto hasta el bloque **100** aparece como **plan editorial**, no como contenido ya realizado. Alcanzar un nivel equivalente a C2 requiere demostrar, con evaluación adecuada a la edad y el contexto, comprensión, interacción, expresión y mediación de alta complejidad; ninguna app de ejercicios breves puede otorgarlo por sí sola.

## Límites conocidos de esta versión

- No hay contraseña ni perfiles privados. Cualquiera con la URL pública puede abrir los niveles.
- El ejercicio de escribir compara la respuesta con una solución modelo y algunas alternativas configuradas. **Puede rechazar respuestas igualmente correctas**. El profesor debe poder revisarlas.
- La lectura del navegador depende del idioma y voces instaladas. No hay reconocimiento automático de pronunciación ni evaluación objetiva de habla.
- La repetición es un **primer prototipo** de práctica espaciada, no un modelo validado de consolidación.
- Los enlaces externos requieren conexión. Se ofrecen como referencia, sin copiar materiales ni grabaciones de terceros.
- La versión estática usa una lógica editorial inspirada en el ciclo Mirar–Aclarar–Entrenar–Revisar de MAER; la **Capa 2 de MAER sigue siendo una propuesta no aprobada**. La web no diagnostica dificultades ni sustituye el criterio docente.

## Arquitectura

```text
index.html                Interfaz principal
styles.css                Estilos responsive e impresión
app.js                    Navegación, ejercicios, seguimiento, audio y JSON
data/lessons.js           20 bloques originales y sus actividades
data/lessons-export.json  Volcado del contenido para generar material impreso
assets/                   Logotipo, iconos y favicon
materiales/               Tres PDF listos para descargar
manifest.webmanifest      Metadatos del sitio
tests/smoke.test.js       Prueba sin dependencias, con Node.js
make_pdfs.py              Genera los PDF a partir de lessons-export.json
```

Para comprobar sintaxis y navegación principal, desde una terminal con Node.js:

```bash
node --check app.js
node tests/smoke.test.js
```

Para editar clases, modificar `data/lessons.js` siguiendo el formato de las existentes; después actualizar `data/lessons-export.json` antes de regenerar los PDF con `make_pdfs.py`. Se incluye un script de exportación.

## Referencias didácticas y recursos externos

- Consejo de Europa, descriptores del MCER: https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors
- British Council, gramática A1–A2: https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2
- British Council, gramática para adolescentes: https://learnenglishteens.britishcouncil.org/grammar
- British Council, vídeos para niños: https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-videos
- British Council, canciones y vídeos para niños: https://learnenglishkids.britishcouncil.org/listen-watch
- BBC Learning English: https://www.bbc.co.uk/learningenglish/

La metodología editorial y los ejercicios internos son propios de Academia Teseracto. Los terceros son enlaces externos: no se ofrecen como contenido de la academia ni se redistribuyen.
