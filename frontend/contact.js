/* Pegá este código al final de pre-pantalla.js.
   En producción, reemplazá localhost por la URL pública del backend. */
const CONTACT_API_URL = 'http://localhost:3000/api/contacto';

const contactToggle = document.getElementById('contact-toggle');
const contactPanel = document.getElementById('contact-form-panel');
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');
const contactSubmit = document.getElementById('contact-submit');

if (contactToggle && contactPanel && contactForm && contactStatus && contactSubmit) {
  contactToggle.addEventListener('click', () => {
    const willOpen = contactPanel.hidden;
    contactPanel.hidden = !willOpen;
    contactToggle.setAttribute('aria-expanded', String(willOpen));
    const icon = contactToggle.querySelector('.contact-toggle-icon');
    if (icon) icon.textContent = willOpen ? '−' : '+';

    if (willOpen) {
      contactPanel.querySelector('input:not([name="website"])')?.focus();
    }
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    contactSubmit.disabled = true;
    contactSubmit.textContent = 'Enviando...';
    contactStatus.textContent = '';
    contactStatus.className = 'contact-status';

    const formData = new FormData(contactForm);
    const payload = {
      nombre: formData.get('nombre'),
      correo: formData.get('correo'),
      asunto: formData.get('asunto'),
      mensaje: formData.get('mensaje'),
      website: formData.get('website'),
    };

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || 'No pudimos enviar el mensaje. Probá de nuevo.');
      }

      contactStatus.textContent = result.message || '¡Gracias! Tu mensaje fue enviado.';
      contactStatus.classList.add('is-success');
      contactForm.reset();
    } catch (error) {
      contactStatus.textContent = error.message || 'No se pudo conectar con el servidor. Probá de nuevo.';
      contactStatus.classList.add('is-error');
    } finally {
      contactSubmit.disabled = false;
      contactSubmit.textContent = 'Enviar mensaje';
    }
  });
}
