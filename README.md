# MIDEC

Sitio multipágina: portada y contacto en HTML, y Punto Fundacional en React.

## Desarrollo

```sh
npm ci --prefix frontend-react
npm run dev
```

- Portada: http://localhost:5173/
- Punto Fundacional: http://localhost:5173/punto-fundacional/
- Prueba de AR: http://localhost:5173/Appweb/
- Contacto: http://localhost:5173/contacto.html

## Compilación y vista previa

```sh
npm run build
npm run preview
```

Abrir http://localhost:4173/punto-fundacional/. Vite genera el sitio completo en `frontend-react/dist`: HTML, JavaScript compilado, estilos y recursos estáticos existentes.

## Netlify

La configuración está en `netlify.toml`, en la raíz del repositorio:

- Directorio base: raíz del repositorio (`.`).
- Comando: `npm ci --prefix frontend-react --include=dev && npm run build`.
- Directorio de publicación: `frontend-react/dist`.
- Node.js: 24.

Subir los cambios a la rama de producción vinculada a Netlify. Una vez terminado el deploy, la experiencia estará en https://midec.uy/punto-fundacional/.

No publicar directamente `frontend`: contiene JSX fuente que el navegador no puede ejecutar. La carpeta `dist` se genera en Netlify y no necesita incluirse en Git. No hace falta redirigir todas las rutas a la portada, porque cada página tiene su propio HTML.

Para verificar un deploy, el código fuente de `/punto-fundacional/` debe cargar un archivo `/assets/*.js`, nunca `./main.jsx`. Si sigue apareciendo JSX, revisar que el deploy corresponda al último commit y que Netlify haya detectado `netlify.toml`.

El video, la foto y los textos de Punto Fundacional son de muestra. AR enlaza a una página de prueba en `Appweb`; Marujita requiere su URL definitiva. Los comentarios son locales y no se guardan. La API de contacto en `backend` se despliega por separado.
