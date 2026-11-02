const narration = 'Bienvenidos al Punto Fundacional de MIDEC. Mirá a tu alrededor: cada lugar guarda historias y memorias. Te invitamos a descubrir Carmelo desde otra mirada.'

function Icon({ kind }) {
  if (kind === 'photos') return <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="4" width="24" height="24" rx="3"/><circle cx="11" cy="11" r="2"/><path d="m5 24 8-8 5 5 4-6 6 9"/></svg>
  if (kind === 'audio') return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 21v-6a11 11 0 0 1 22 0v6"/><rect x="4" y="17" width="6" height="11" rx="3"/><rect x="22" y="17" width="6" height="11" rx="3"/></svg>
  if (kind === 'ar') return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 12 7v13l-12 7L4 23V10zM4 10l12 7 12-7M16 17v13"/></svg>
  return <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="9" width="22" height="19" rx="6"/><path d="M16 9V4m-3 0h6M1 16v6m30-6v6M12 23h8"/><circle cx="11" cy="16" r="1"/><circle cx="21" cy="16" r="1"/></svg>
}

function PanelContent({ panel }) {
  if (panel === 'photos') return <>
    <figure><img src="/assets/imagenes/plaza-artigas-historica.png" alt="Imagen de referencia de Plaza Artigas"/><figcaption>Plaza Artigas · Imagen de muestra del recorrido MIDEC.</figcaption></figure>
    <figure><img src="/assets/imagenes/monumento-artigas.png" alt="Vista del monumento a Artigas"/><figcaption>Una mirada al monumento.</figcaption></figure>
  </>
  if (panel === 'audio') return <>
    <p>{narration}</p>
    <button className="primary" type="button" disabled={!('speechSynthesis' in window)} onClick={() => {
      window.speechSynthesis.cancel()
      const speech = new SpeechSynthesisUtterance(narration)
      speech.lang = 'es-UY'
      window.speechSynthesis.speak(speech)
    }}>{'speechSynthesis' in window ? 'Escuchar muestra' : 'Voz no disponible'}</button>{' '}
    <button className="secondary" type="button" onClick={() => window.speechSynthesis?.cancel()}>Detener</button>
    <p className="notice">Relato de demostración con voz del dispositivo. El audiolibro del punto se incorporará próximamente.</p>
  </>
  return <>
    <p>Tu espacio para hacer preguntas y descubrir las historias del punto.</p>
    <p className="notice">El asistente todavía no está conectado en esta primera versión.</p>
    <a className="back" href="/punto-fundacional/">Explorar Punto Fundacional ↗</a>
  </>
}



export { Icon, PanelContent }

