# Punto Fundacional

Página React integrada en `/punto-fundacional/`. Estilos en CSS puro: negro, blanco, rojo `#ff0000` y Raleway cargada desde Google Fonts en el HTML de entrada.

## Configuración

`frontend-react/src/App.jsx` monta `PuntoFundacional`. Props opcionales:

- `videoUrl`: URL directa MP4/WebM, no un iframe. Por defecto usa el video CC0 de flores de MDN como muestra técnica. Reemplazar por el video institucional antes de publicar. Se reproduce con `autoPlay muted loop playsInline`, sin controles. Algunos navegadores o modos de ahorro pueden bloquear autoplay; siempre se puede cerrar el modal.
- `imageUrl`, `imageAlt`: foto real del lugar y su descripción. La imagen actual es una referencia urbana de Unsplash, no una fotografía de Carmelo.
- `logoUrl`: logo para ambas etiquetas `<img>`. Se utiliza por defecto `logo-midec.svg`, derivado del SVG original ajustando solo el encuadre y dimensiones para eliminar sus márgenes. Puede reemplazarse por `/logo-midec.png` si se incorpora ese archivo.
- `title`: título editorial; por defecto Punto Fundacional (traducido al cambiar idioma).
- `storyText`: relato histórico verificado. Sin contenido se muestra un aviso de próxima disponibilidad.
- `arUrl`, `assistantUrl`: destinos reales de Realidad Aumentada e IA Mente Museo.
- `photos`: objetos `{ src, alt }` para la galería.
- `aboutUrl`, `contactUrl`: portada y formulario de contacto existentes.
- `instagramUrl`: Instagram oficial encontrado en la portada.
- `contactEmail`: dirección confirmada para el enlace `mailto:`. Sin email, Escribinos lleva al formulario de contacto existente.

El selector ES/EN traduce los textos de interfaz. Los contenidos editoriales externos deben traducirse desde la aplicación.

## Interacción

El modal nativo mantiene el foco, bloquea el fondo y cierra con X, Escape o Explorar. El video se desmonta al cerrar. Las experiencias abren paneles accesibles. Las animaciones CSS de portales, líneas y nodos se activan con IntersectionObserver solo cuando cada sección está visible; respetan `prefers-reduced-motion`. La cabecera escucha scroll de forma pasiva.

Las estrellas utilizan radios accesibles. Las opiniones viven en el estado de esta visita: no se publican ni persisten al recargar. La interfaz lo indica.

## Comandos

Desde la raíz: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`. Netlify publica `frontend-react/dist` según `netlify.toml`.
