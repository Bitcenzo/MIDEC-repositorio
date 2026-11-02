import { useCallback, useEffect, useRef, useState } from 'react'

export default function useSensors() {
  const video = useRef(null)
  const active = useRef(false), generation = useRef(0), stream = useRef(null), watch = useRef(null)
  const removeOrientation = useRef(() => {})
  const [camera, setCamera] = useState('off')
  const [cameraMessage, setCameraMessage] = useState('')
  const [position, setPosition] = useState(null)
  const [gpsMessage, setGpsMessage] = useState('Esperando tu ubicación')
  const [heading, setHeading] = useState(null)
  const [compassMessage, setCompassMessage] = useState('Esperando brújula')
  const stop = useCallback(() => {
    active.current = false
    generation.current++
    stream.current?.getTracks().forEach(track => track.stop())
    stream.current = null
    if (video.current) video.current.srcObject = null
    if (watch.current !== null) navigator.geolocation?.clearWatch(watch.current)
    watch.current = null
    removeOrientation.current()
    setCamera('off'); setPosition(null); setHeading(null)
  }, [])

  const start = useCallback(() => {
    stop()
    active.current = true
    const token = generation.current
    setCamera('loading'); setCameraMessage('Permití el acceso a la cámara.')
    setGpsMessage('Buscando señal GPS…'); setCompassMessage('Esperando brújula…')
    // Request orientation inside the click gesture, as required by Safari.
    const orientation = window.DeviceOrientationEvent
    const permission = typeof orientation?.requestPermission === 'function'
      ? orientation.requestPermission() : Promise.resolve('granted')
    permission.then(result => {
      if (generation.current !== token) return
      if (result !== 'granted') { setCompassMessage('Brújula sin permiso. Usá el mapa.'); return }
      const onOrientation = event => {
        let value = null
        if (Number.isFinite(event.webkitCompassHeading) && !(event.webkitCompassAccuracy < 0)) value = event.webkitCompassHeading
        else if (event.absolute && Number.isFinite(event.alpha)) value = (360 - event.alpha) % 360
        if (value === null) return
        const rotation = window.screen.orientation?.angle || 0
        setHeading({ value: (value + rotation + 360) % 360, timestamp: Date.now() })
        setCompassMessage('Brújula activa')
      }
      window.addEventListener('deviceorientationabsolute', onOrientation)
      window.addEventListener('deviceorientation', onOrientation)
      removeOrientation.current = () => {
        window.removeEventListener('deviceorientationabsolute', onOrientation)
        window.removeEventListener('deviceorientation', onOrientation)
      }
    }).catch(() => setCompassMessage('Brújula no disponible. Usá el mapa.'))

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCamera('error'); setCameraMessage('La cámara necesita HTTPS o localhost y un navegador compatible.')
    } else navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then(async incoming => {
      if (generation.current !== token) { incoming.getTracks().forEach(track => track.stop()); return }
      stream.current = incoming
      video.current.srcObject = incoming
      await video.current.play()
      if (generation.current === token) { setCamera('on'); setCameraMessage('Cámara activa') }
    }).catch(error => {
      if (generation.current !== token) return
      stream.current?.getTracks().forEach(track => track.stop())
      stream.current = null
      setCamera('error')
      setCameraMessage(error.name === 'NotAllowedError' ? 'Cámara bloqueada. Podés habilitarla en los ajustes del navegador o saltar esta parte.' : 'No pudimos abrir la cámara. Podés reintentar o explorar los recursos.')
    })
    if (!navigator.geolocation) setGpsMessage('Ubicación no disponible. Usá el mapa.')
    else watch.current = navigator.geolocation.watchPosition(p => {
      if (generation.current !== token) return
      setPosition({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy, timestamp: p.timestamp })
      setGpsMessage(`GPS ±${Math.round(p.coords.accuracy)} m`)
    }, error => {
      if (generation.current !== token) return
      setPosition(null)
      setGpsMessage(error.code === 1 ? 'Ubicación bloqueada. Podés usar el mapa.' : 'Sin señal GPS precisa. Intentá al aire libre.')
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 })
  }, [stop])

  useEffect(() => {
    const suspend = () => { if (active.current) { stop(); setCameraMessage('La experiencia está en pausa. Tocá Reanudar para continuar.') } }
    const visibility = () => { if (document.hidden) suspend() }
    window.addEventListener('pagehide', suspend)
    document.addEventListener('visibilitychange', visibility)
    return () => { stop(); window.removeEventListener('pagehide', suspend); document.removeEventListener('visibilitychange', visibility) }
  }, [stop])
  return { video, camera, cameraMessage, position, gpsMessage, heading, compassMessage, start, stop }
}
