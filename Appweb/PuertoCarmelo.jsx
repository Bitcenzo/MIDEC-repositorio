import { useEffect, useRef, useState } from 'react'

import { Icon } from './Resources.jsx'
import { PanelContent } from './PuertoResources.jsx'
import useSensors from './useSensors.js'
import { directionFrom, relativeAngle } from './location.js'
import { puerto } from './points.js'
const mapsUrl = puerto.mapsUrl
import './style.css'

const titles = { photos: 'Fotos del puerto', audio: 'Escuchá el puerto', ai: 'IA Mente Museo' }

function Welcome({ onNext }) {
  return <section className="welcome port-welcome">
    <img className="port-cover" src="/assets/imagenes/puerto-carmelo-referencia.svg" alt="Ilustración de un puerto" />
    <div className="film-shade" />
    <div className="film-controls"><h1>Puerto de El Carmelo</h1><button className="primary wide" onClick={onNext}>Comenzar <span>→</span></button></div>
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
  const navigation = freshPosition ? puerto.destination ? directionFrom(position, puerto.destination) : null : null
  const headingFresh = heading && now - heading.timestamp < 5000
  const angle = navigation && headingFresh ? relativeAngle(navigation.bearing, heading.value) : null
  const arrived = precise && navigation && navigation.distance <= 25
  const canDirect = navigation && precise && headingFresh && cameraState === 'on'
  const distance = navigation ? (navigation.distance > 1000 ? `${(navigation.distance / 1000).toFixed(1)} km` : `${Math.round(navigation.distance)} m`) : '—'
  const openExperience = () => { setStage('guide'); start() }

  return <main className={`app stage-${stage}`}>
    <video className="camera" ref={cameraRef} muted autoPlay playsInline aria-label="Vista de la cámara trasera" />
    <div className="ambient" />
    <header className="header"><a href="/punto-fundacional/" aria-label="Volver a Punto Fundacional"><img src="/assets/componentes/logo-midec.svg" alt="MIDEC · Museo Interactivo de Carmelo" /></a></header>
    {stage === 'welcome' ? <Welcome onNext={() => setStage('permissions')} /> : <div className="stage-content">
      {stage === 'permissions' && <section className="permission-screen">
        <div className="monument-frame"><img src="/assets/imagenes/puerto-carmelo-referencia.svg" alt="Ilustración del puerto"/></div>
        <h1 ref={headingTitle} tabIndex={-1}>Vamos al puerto</h1><p>Activá la cámara para explorar este punto.</p>
        <button className="primary wide" onClick={openExperience}>Abrir cámara <span>→</span></button><button className="skip-ar" onClick={goMenu}>Saltar realidad aumentada</button>
      </section>}
      {(stage === 'guide' || stage === 'ar') && <section className="guide-screen">
        <div className="guide-center">
          {stage === 'ar' ? <article className="ar-story"><img src="/assets/imagenes/puerto-carmelo-referencia.svg" alt="Ilustración de referencia del puerto"/><h2>Puerto de El Carmelo</h2><p>Vista de prueba</p><progress max="15" value={elapsed} aria-label="Progreso de la experiencia"/></article> : <>
            <div className={`direction ${canDirect ? 'ready' : ''}`} aria-hidden="true">{canDirect ? <span style={{ transform: `rotate(${angle}deg)` }}>↑</span> : <span>⌖</span>}</div>
            {navigation && <span className="distance">{distance}</span>}
            <h1 ref={headingTitle} tabIndex={-1}>{arrived ? 'Llegaste' : canDirect ? Math.abs(angle) < 25 ? 'Hacia adelante' : angle > 0 ? 'A tu derecha' : 'A tu izquierda' : 'Puerto de El Carmelo'}</h1>
            {canDirect && <p>{arrived ? 'Apuntá la cámara al puerto.' : 'Acercate al puerto por los accesos peatonales.'}</p>}
            {!canDirect && <p className="notice">{!puerto.destination ? 'Podés ubicar el puerto en el mapa.' : !freshPosition ? gpsMessage : !precise ? 'Esperando una señal GPS más precisa.' : compassMessage}</p>}
            <a className="map-link" href={mapsUrl} target="_blank" rel="noreferrer">Ver mapa ↗</a>
          </>}
        </div>
        <div className="guide-bottom">{cameraState !== 'on' && <p role="status">{cameraMessage}</p>}
          {cameraState !== 'on' && <button className="primary" disabled={cameraState === 'loading'} onClick={start}>{cameraState === 'loading' ? 'Esperando permiso…' : 'Reanudar cámara y ubicación'}</button>}
          {stage === 'guide' && cameraState === 'on' && <button className="primary wide" onClick={() => { setElapsed(0); setStage('ar') }}>Estoy en el puerto <span>↗</span></button>}
          <button className="skip-ar" onClick={goMenu}>Saltar realidad aumentada</button></div>
      </section>}
      {stage === 'menu' && <section className="menu-screen"><h1 ref={headingTitle} tabIndex={-1}>Puerto de El Carmelo</h1><div className="resource-list">{[{kind:'photos',name:'Fotos'},{kind:'audio',name:'Audiolibro'},{kind:'ai',name:'IA Mente Museo'}].map(item => <button key={item.kind} className="resource" onClick={() => setPanel(item.kind)}><span className="resource-icon"><Icon kind={item.kind}/></span><strong>{item.name}</strong><span aria-hidden="true">→</span></button>)}</div><button className="primary wide" onClick={() => setStage('route')}>Seguir el recorrido <span>→</span></button><button className="skip-ar" onClick={() => setStage('permissions')}>Volver a la cámara</button></section>}
      {stage === 'route' && <section className="route-screen"><button className="plain" onClick={() => setStage('menu')}>← Volver a los recursos</button><h1 ref={headingTitle} tabIndex={-1}>El recorrido</h1>{puerto.mapEmbed && <iframe title="Mapa de Puerto de El Carmelo" src={puerto.mapEmbed} loading="lazy"/>}<a className="map-link" href={mapsUrl} target="_blank" rel="noreferrer">Abrir en Google Maps ↗</a><p className="notice">Abrí el mapa para ver el puerto.</p><form className="review" onSubmit={e => { e.preventDefault(); setSaved(true) }}><h2>¿Cómo fue tu experiencia?</h2><fieldset><legend>Elegí de 1 a 5 estrellas</legend>{[1,2,3,4,5].map(n => <label key={n}><input type="radio" name="rating" required value={n} checked={rating===n} onChange={() => { setRating(n); setSaved(false) }}/><span aria-hidden="true" className={n <= rating ? 'selected' : ''}>★</span><span className="sr-only">{n} estrellas</span></label>)}</fieldset><button className="primary" disabled={!rating}>Guardar valoración</button><p className="notice" role="status">{saved ? 'Gracias. Tu valoración quedó registrada durante esta visita.' : 'Valoración de prueba: se conserva solo durante esta visita.'}</p></form></section>}
    </div>}
    <dialog ref={dialog} aria-labelledby="dialog-title" onClose={() => { setPanel(null); window.speechSynthesis?.cancel() }}><button className="plain" onClick={closePanel}>← Volver a los recursos</button><h2 id="dialog-title">{titles[panel]}</h2>{panel && <PanelContent panel={panel}/>}</dialog>
  </main>
}


export default App
