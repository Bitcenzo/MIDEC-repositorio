
const CONTACT_API_URL = 'http://localhost:3000/api/contacto';

const form = document.getElementById('contact-form');
const status = document.getElementById('contact-status');
const submit = document.getElementById('contact-submit');

if (form && status && submit) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    submit.disabled = true;
    submit.textContent = 'Enviando...';
    status.textContent = '';
    status.className = 'contact-status';

    const datos = Object.fromEntries(new FormData(form).entries());

    try {
      const respuesta = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: datos.nombre,
          correo: datos.correo,
          asunto: datos.asunto,
          mensaje: datos.mensaje,
          website: datos.website
        })
      });

      const resultado = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        throw new Error(
          resultado.message || 'No se pudo enviar el mensaje.'
        );
      }

      status.textContent =
        resultado.message || '¡Gracias! Tu mensaje fue enviado.';

      status.classList.add('is-success');
      form.reset();

    } catch (error) {
      console.error('Error al enviar el contacto:', error);

      status.textContent =
        error.message || 'No se pudo conectar con el servidor.';

      status.classList.add('is-error');

    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Enviar mensaje <span aria-hidden="true">↗</span>';
    }
  });
}
