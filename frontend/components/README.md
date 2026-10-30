# Punto Fundacional

Componente funcional React con **CSS puro**, sin dependencias visuales. Está integrado con React y Vite en `frontend-react` y se monta en `/punto-fundacional/`. Consultá el README de la raíz para desarrollo y publicación en Netlify.

## Integración en una aplicación React

Requiere React y React DOM (18 o superior) y un compilador que admita JSX, CSS e importaciones SVG como URL. Conservá la carpeta `assets` y la ubicación relativa del logo, o reemplazá su importación.

```jsx
import PuntoFundacional from "./components/PuntoFundacional";

export default function App() {
  return <PuntoFundacional />;
}
```

Montá `App` con el mecanismo habitual de tu aplicación React. Incluí `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` en el HTML y `body { margin: 0; }` en los estilos globales. Publicá esta página en la ruta que codifique el QR, por ejemplo `/punto-fundacional`, configurando el servidor para servir esa ruta.

## Contenido configurable

- `videoUrl`: URL de inserción de YouTube o Vimeo. El valor predeterminado es un video de muestra, **no una introducción real de 30 segundos**. Al incorporar el definitivo, pasá `videoIsPlaceholder={false}`.
- `imageUrl` y `imageAlt`: fotografía real del punto y descripción accesible. La imagen remota inicial es referencial y no representa Plaza Artigas. Pasá `imageIsPlaceholder={false}` al reemplazarla.
- `history` y `storyText`: texto breve y relato ampliado; inicialmente Lorem Ipsum para evitar inventar hechos históricos.
- `arUrl` y `assistantUrl`: destinos de las experiencias reales. Sin esos valores, se abre una explicación con el aviso de que aún no están disponibles. No se simula una cámara ni una IA.
- `photos`: galería con objetos `{ src, alt }`; inicialmente vacía.
- `aboutUrl` y `contactUrl`: enlaces de navegación, predeterminados a `/index.html` y `/contacto.html`.

La interfaz cambia entre español e inglés; los textos editoriales recibidos mediante props deben proporcionarse traducidos desde la aplicación si se desea traducir también el contenido histórico. Las URLs de integración deben provenir de configuración confiable.

El modal inicial usa `useState(true)` y un elemento nativo `dialog`: admite cierre con X, Escape y el botón para explorar, mantiene el foco dentro del modal y bloquea el scroll de fondo. Al cerrar se desmonta el iframe para detener la reproducción. No reproduce automáticamente.

Las estrellas son controles radio accesibles. Las opiniones se agregan con `useState` al foro de esta visita; desaparecen al recargar. Para un foro compartido hay que conectar una API y agregar persistencia, moderación y tratamiento de errores. La interfaz informa explícitamente esta limitación.

## Verificación manual al integrarlo

1. Abrir la ruta en 320, 390 y 768 px: comprobar modal, scroll y ausencia de desbordamientos.
2. Cerrar con X, Escape y el botón de explorar; volver a abrir la introducción desde el pie.
3. Navegar con Tab y comprobar el foco dentro del modal; cambiar idioma y abrir el menú.
4. Abrir las cuatro opciones, con y sin destinos/galería configurados.
5. Seleccionar estrellas con teclado o toque, escribir un comentario y enviarlo. Confirmar el aviso de demo y que recargar elimina las opiniones.
6. Sustituir y comprobar el video, la fotografía y los enlaces antes de publicar el QR.
