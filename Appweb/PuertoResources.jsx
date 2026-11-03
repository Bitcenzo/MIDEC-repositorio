const narration = 'Estás en Puerto de El Carmelo. Este audio es una muestra. El relato completo del puerto estará disponible próximamente.'

export function PanelContent({ panel }) {
  if (panel === 'photos') return <>
    <img src="/assets/imagenes/puerto-carmelo-referencia.svg" alt="Ilustración de referencia del puerto" />
    <p>Las fotos del puerto estarán disponibles próximamente.</p>
  </>
  if (panel === 'audio') return <>
    <p>Escuchá una muestra del recorrido.</p>
    <button className="primary" type="button" disabled={!('speechSynthesis' in window)} onClick={() => {
      window.speechSynthesis.cancel()
      const speech = new SpeechSynthesisUtterance(narration)
      speech.lang = 'es-UY'
      window.speechSynthesis.speak(speech)
    }}>{'speechSynthesis' in window ? 'Escuchar muestra' : 'Voz no disponible'}</button>{' '}
    <button className="secondary" type="button" onClick={() => window.speechSynthesis?.cancel()}>Detener</button>
  </>
  return <p>Mente Museo estará disponible próximamente.</p>
}
