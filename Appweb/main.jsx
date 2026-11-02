import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Icon, PanelContent } from './Resources.jsx'
import useSensors from './useSensors.js'
import { directionFrom, mapsUrl, relativeAngle } from './location.js'
import './style.css'

const chapters = [
  ['La historia,', 'en tu entorno.', 'Bienvenido a MIDEC. Descubrí Carmelo desde otra mirada, a través de sus imágenes y sus historias.'],
  ['Acercate.', 'Mirá de nuevo.', 'Activá la cámara y tu ubicación. Las flechas te orientan hacia el Monumento a Artigas.'],
  ['Un lugar.', 'Muchas historias.', 'Explorá las fotos, escuchá los relatos y descubrí Mente Museo. Vos elegís cómo seguir.'],
]
const titles = { photos: 'Fotos del punto', audio: 'Escuchá el lugar', ai: 'IA Mente Museo' }

function Welcome({ onNext }) {
  const video = useRef(null)
  const [time, setTime] = useState(0), [playing, setPlaying] = useState(true), [error, setError] = useState(false), [voice, setVoice] = useState(false)
  const chapter = Math.min(2, Math.floor(time / 10))
  useEffect(() => {
    if (voice && playing && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const speech = new SpeechSynthesisUtterance(chapters[chapter][2]); speech.lang = 'es-UY'
      window.speechSynthesis.speak(speech)
    }
    return () => window.speechSynthesis?.cancel()
  }, [chapter, voice, playing])
  useEffect(() => {
    video.current.play().catch(() => setPlaying(false))
    const pause = () => { if (document.hidden) video.current?.pause() }
    document.addEventListener('visibilitychange', pause)
    return () => document.removeEventListener('visibilitychange', pause)
  }, [])
  return <section className="welcome">
    <video ref={video} className="intro-film" src="/assets/video/bienvenida-referencia.mp4" poster="/assets/imagenes/plaza-artigas-historica.png" autoPlay muted playsInline onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onEnded={onNext} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} onError={() => setError(true)} aria-label="Video de bienvenida de referencia: imágenes de Plaza Artigas" />
    <div className="film-shade" />
    <div className="welcome-copy"><span className="eyebrow">UN MUSEO A CIELO ABIERTO</span><h1>{chapters[chapter][0]}<br/><em>{chapters[chapter][1]}</em></h1><p>{chapters[chapter][2]}</p></div>
    <div className="film-controls"><span className="pill">BIENVENIDA · VIDEO DE REFERENCIA</span>
      {error && <p role="alert">No pudimos cargar el video. Podés continuar con la experiencia.</p>}
      <div className="chapters" aria-label="Progreso del video">{chapters.map((_, i) => <span key={i}><i style={{ width: `${Math.max(0, Math.min(100, (time - i * 10) * 10))}%` }}/></span>)}</div>
      <div className="film-actions"><button className="plain" aria-label={playing ? 'Pausar video' : 'Reproducir video'} onClick={() => { if (playing) video.current.pause(); else video.current.play().catch(() => setError(true)) }}>{playing ? 'Ⅱ' : '▶'}</button><span>0:{String(Math.floor(time)).padStart(2, '0')} / 0:30</span>
        {'speechSynthesis' in window && <button className="plain voice" onClick={() => setVoice(!voice)}>{voice ? 'Silenciar guía' : 'Escuchar guía'}</button>}
        <button className="skip-video" onClick={onNext}>Saltar video <span>↗</span></button></div>
    </div>
  </section>
}

function App() {
  const [stage, setStage] = useState('welcome'), [panel, setPanel] = useState(null), [now, setNow] = useState(() => Date.now()), [elapsed, setElapsed] = useState(0)
  const [rating, setRating] = useState(0), [saved, setSaved] = useState(false)
  const dialog = useRef(null), headingTitle = useRef(null)
  const { video: cameraRef, camera: cameraState, cameraMessage, position, gpsMessage, heading, compassMessage, start, stop } = useSensors()
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer) }, [])
  useEffect(() => { headingTitle.current?.focus() }, [stage])
  useEffect(() => {
    if (panel) dialog.current.showModal()
  }, [panel])
  useEffect(() => {
    if (stage !== 'ar' || cameraState !== 'on') return
    const timer = setTimeout(() => {
      if (elapsed >= 14) { stop(); setStage('menu') }
      else setElapsed(elapsed + 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [stage, cameraState, elapsed, stop])
  const goMenu = () => { stop(); setStage('menu') }
  const closePanel = () => { dialog.current.close(); setPanel(null); window.speechSynthesis?.cancel() }
  const freshPosition = position && now - position.timestamp < 20000
  const precise = freshPosition && position.accuracy <= 35
  const navigation = freshPosition ? directionFrom(position) : null
  const headingFresh = heading && now - heading.timestamp < 5000
  const angle = navigation && headingFresh ? relativeAngle(navigation.bearing, heading.value) : null
  const arrived = precise && navigation.distance <= 25
  const canDirect = precise && headingFresh && cameraState === 'on'
  const distance = navigation ? (navigation.distance > 1000 ? `${(navigation.distance / 1000).toFixed(1)} km` : `${Math.round(navigation.distance)} m`) : '—'
  const openExperience = () => { setStage('guide'); start() }

  return <main className={`app stage-${stage}`}>
    <video className="camera" ref={cameraRef} muted autoPlay playsInline aria-label="Vista de la cámara trasera" />
    <div className="ambient" />
    <header className="header"><a href="/punto-fundacional/" aria-label="Volver a Punto Fundacional"><img src="/assets/componentes/logo-midec.svg" alt="MIDEC · Museo Interactivo de Carmelo" /></a><span className="location-label">CARMELO, URUGUAY<br/><b>Punto Fundacional</b></span><a className="exit" href="/punto-fundacional/">Salir ↗</a></header>
    {stage === 'welcome' ? <Welcome onNext={() => setStage('permissions')} /> : <div className="stage-content">
      <div className="step-label"><span className="red-dot" /> PLAZA ARTIGAS <span>{stage === 'permissions' ? '01 / PREPARATE' : stage === 'guide' ? '02 / EXPLORÁ' : stage === 'ar' ? '03 / DESCUBRÍ' : 'TU RECORRIDO'}</span></div>
      {stage === 'permissions' && <section className="permission-screen">
        <div className="monument-frame"><img src="/assets/imagenes/monumento-artigas.png" alt="Monumento a Artigas"/><span className="frame-corners"/><span className="pill">TU HISTORIA EMPIEZA ACÁ</span></div>
        <h1 ref={headingTitle} tabIndex={-1}>Acercate al<br/><em>Monumento Artigas.</em></h1><p>Abrí una ventana a la historia. Activá la cámara y seguí la orientación hasta la estatua.</p>
        <div className="permission-list"><span>◉ Cámara <small>Para mirar a tu alrededor</small></span><span>⌖ Ubicación y brújula <small>Para orientarte hacia el monumento</small></span></div>
        <button className="primary wide" onClick={openExperience}>Abrir cámara y comenzar <span>↗</span></button><p className="notice">La cámara se usa en tu dispositivo. No grabamos ni enviamos imágenes ni tu ubicación.</p><button className="skip-ar" onClick={goMenu}>Saltar realidad aumentada →</button>
      </section>}
      {(stage === 'guide' || stage === 'ar') && <section className="guide-screen">
        <div className="compass"><span>O</span><span>· · · · ·</span><b>{headingFresh ? `${Math.round(heading.value)}°` : 'BRÚJULA'}</b><span>· · · · ·</span><span>E</span></div>
        <div className="sensor-badges"><span>{gpsMessage}</span><span>{headingFresh ? 'Brújula activa' : 'Sin orientación fiable'}</span></div>
        <div className="guide-center">
          {stage === 'ar' ? <article className="ar-story"><span className="eyebrow">UNA VENTANA AL PASADO</span><img src="/assets/imagenes/plaza-artigas-historica.png" alt="Imagen de referencia de Plaza Artigas"/><h2>Punto Fundacional</h2><p>Un lugar, muchas historias. Descubrí las imágenes, las voces y las memorias de Carmelo.</p><small>Superposición de referencia · {Math.max(0, 15 - elapsed)} s</small><progress max="15" value={elapsed} aria-label="Progreso de la experiencia"/></article> : <>
            <div className={`direction ${canDirect ? 'ready' : ''}`} aria-hidden="true">{canDirect ? <span style={{ transform: `rotate(${angle}deg)` }}>↑</span> : <span>⌖</span>}</div>
            <span className="pill">MONUMENTO A ARTIGAS · {distance}</span>
            <h1 ref={headingTitle} tabIndex={-1}>{arrived ? 'Estás cerca.' : canDirect ? Math.abs(angle) < 25 ? 'El monumento está adelante.' : angle > 0 ? 'Orientate a la derecha.' : 'Orientate a la izquierda.' : 'Busquemos el monumento.'}</h1>
            <p>{arrived ? 'Apuntá hacia la estatua y confirmá cuando la tengas frente a vos.' : 'La flecha señala la dirección del monumento. Seguí los senderos y observá tu entorno.'}</p>
            {!canDirect && <p className="notice">{!freshPosition ? gpsMessage : !precise ? 'Esperá una mejor precisión del GPS para ver la flecha.' : compassMessage} Podés orientarte con el mapa.</p>}
            <a className="map-link" href={mapsUrl} target="_blank" rel="noreferrer">Ver ubicación en el mapa ↗</a>
          </>}
        </div>
        <div className="guide-bottom"><p role="status">{cameraMessage}</p>
          {cameraState !== 'on' && <button className="primary" disabled={cameraState === 'loading'} onClick={start}>{cameraState === 'loading' ? 'Esperando permiso…' : 'Reanudar cámara y ubicación'}</button>}
          {stage === 'guide' && cameraState === 'on' && <button className="primary wide" onClick={() => { setElapsed(0); setStage('ar') }}>Estoy frente al monumento <span>↗</span></button>}
          <button className="skip-ar" onClick={goMenu}>Saltar realidad aumentada →</button></div>
      </section>}
      {stage === 'menu' && <section className="menu-screen"><span className="eyebrow">TU PUNTO DE ENCUENTRO CON LA HISTORIA</span><h1 ref={headingTitle} tabIndex={-1}>Un lugar.<br/><em>Muchas historias.</em></h1><p>Elegí cómo querés descubrir Plaza Artigas.</p><div className="resource-list">{[{kind:'photos',name:'Fotos',desc:'El lugar, a través del tiempo.'},{kind:'audio',name:'Audiolibro',desc:'Ponete cómodo. Escuchá su historia.'},{kind:'ai',name:'IA Mente Museo',desc:'Tu curiosidad tiene mucho por descubrir.'}].map((item,i) => <button key={item.kind} className="resource" onClick={() => setPanel(item.kind)}><span className="resource-icon"><Icon kind={item.kind}/></span><span><small>0{i+1} / EXPLORAR</small><strong>{item.name}</strong><span>{item.desc}</span></span><b>↗</b></button>)}</div><button className="primary wide" onClick={() => setStage('route')}>Seguir el recorrido <span>→</span></button><button className="skip-ar" onClick={() => setStage('permissions')}>Volver a la realidad aumentada</button></section>}
      {stage === 'route' && <section className="route-screen"><button className="plain" onClick={() => setStage('menu')}>← Volver a los recursos</button><h1 ref={headingTitle} tabIndex={-1}>La historia<br/><em>continúa.</em></h1><p>Estás explorando el Punto Fundacional de Carmelo.</p><iframe title="Mapa de Plaza Artigas" src="https://www.openstreetmap.org/export/embed.html?bbox=-58.292%2C-34.002%2C-58.283%2C-33.996&layer=mapnik&marker=-33.99913%2C-58.28785" loading="lazy"/><a className="map-link" href={mapsUrl} target="_blank" rel="noreferrer">Abrir Plaza Artigas en Google Maps ↗</a><p className="notice">Próximamente se sumarán los demás portales del recorrido.</p><form className="review" onSubmit={e => { e.preventDefault(); setSaved(true) }}><h2>¿Cómo fue tu experiencia?</h2><fieldset><legend>Elegí de 1 a 5 estrellas</legend>{[1,2,3,4,5].map(n => <label key={n}><input type="radio" name="rating" required value={n} checked={rating===n} onChange={() => { setRating(n); setSaved(false) }}/><span aria-hidden="true" className={n <= rating ? 'selected' : ''}>★</span><span className="sr-only">{n} estrellas</span></label>)}</fieldset><button className="primary" disabled={!rating}>Guardar valoración</button><p className="notice" role="status">{saved ? 'Gracias. Tu valoración quedó registrada durante esta visita.' : 'Valoración de prueba: se conserva solo durante esta visita.'}</p></form></section>}
      <footer>MUSEO INTERACTIVO DE CARMELO <span>LA HISTORIA ESTÁ CERCA.</span></footer>
    </div>}
    <dialog ref={dialog} aria-labelledby="dialog-title" onClose={() => { setPanel(null); window.speechSynthesis?.cancel() }}><button className="plain" onClick={closePanel}>← Volver a los recursos</button><h2 id="dialog-title">{titles[panel]}</h2>{panel && <PanelContent panel={panel}/>}</dialog>
  </main>
}

createRoot(document.getElementById('root')).render(<App />)
export default App


