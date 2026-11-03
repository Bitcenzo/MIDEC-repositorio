# Experiencia MIDEC

Abrir `/Appweb/` con `npm run dev` desde la raíz. La pantalla inicial muestra una lista ordenada: 1. Punto Fundacional (Plaza Artigas), 2. Puerto de El Carmelo. `points.js` define el orden y las ubicaciones. `main.jsx` permite elegir y cambiar de punto; `PlazaArtigas.jsx` conserva el recorrido anterior y `PuertoCarmelo.jsx` agrega el segundo de forma independiente. `useSensors.js` controla permisos y sensores.

Puerto de El Carmelo usa el destino **Letras de Carmelo** del enlace compartido: -34.0038125, -58.2874531. Se toma el destino del enlace de indicaciones, sin reutilizar su origen. El mapa abre indicaciones a pie desde la ubicación actual. El puerto tiene ilustración, cámara, orientación, menú y audio de muestra propios; su video y fotografías definitivos quedan pendientes. “Cambiar punto” libera los sensores y vuelve a la lista.

## Recorrido

1. Video local de referencia de **30 segundos**, compuesto con las imágenes existentes. Reproduce sin audio para permitir autoplay; ofrece pausa, guía de voz del dispositivo y salto inmediato. Si falla, se puede saltar. La guía de voz se divide en tres partes de diez segundos; el video ocupa toda la pantalla y muestra solo el título y los controles.
2. Pantalla para solicitar cámara, ubicación y orientación desde una acción explícita. No solicita permisos durante el video.
3. La cámara muestra orientación al Monumento a Artigas. Distancia por GPS y rumbo relativo a la brújula: no calcula un itinerario peatonal ni detecta obstáculos. La flecha requiere ubicación de menos de 20 segundos, precisión de 35 metros o mejor y orientación absoluta de menos de 5 segundos. El mapa está siempre disponible.
4. Cerca del destino (25 metros) se invita a apuntar. El visitante confirma que está frente al monumento. Se muestra una superposición de referencia durante 15 segundos, sin reconocimiento visual ni anclaje 3D. Al finalizar o saltar se abre el menú.
5. Fotos, Audiolibro e IA Mente Museo conservan los contenidos de muestra. El asistente todavía no tiene servicio conectado. Cada recurso permite volver al menú.
6. Seguir el recorrido abre el mapa de Plaza Artigas y una valoración de prueba en memoria. Los demás portales aún no tienen ubicaciones configuradas; no se inventan destinos.

Los sensores se liberan al salir a recursos, ocultar la página o desmontar el componente. Al volver se reanudan con un botón. Para probar cámara y GPS en un teléfono se necesita HTTPS; una dirección HTTP de la red local no equivale a localhost.

## Ubicación y contenido

- Enlace proporcionado: https://maps.app.goo.gl/x4JBzKniUuNkj839A?g_st=iw (Plaza Artigas, Carmelo).
- Coordenadas del monumento en `location.js`: -33.99913, -58.28785; referencia cartográfica: https://mapcarta.com/N2153595683, basada en OpenStreetMap node 2153595683. Comprobar sobre el terreno antes de uso público.
- Video: `frontend/assets/video/bienvenida-referencia.mp4`, H.264, 720 × 1280, 30 segundos, sin pista de audio. Sustituirlo por el video definitivo conservando la duración o ajustando capítulos y progreso.
- Orientación: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent y https://developer.apple.com/documentation/webkitjs/deviceorientationevent.

Validar GPS y brújula sobre el terreno en Safari iOS y Chrome Android. Las pruebas con sensores simulados verifican el recorrido y los permisos, pero no la precisión física.
