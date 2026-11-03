import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import PlazaArtigas from './PlazaArtigas.jsx'
import PuertoCarmelo from './PuertoCarmelo.jsx'
import PointSelection from './PointSelection.jsx'
import './style.css'

function App() {
  const [selected, setSelected] = useState(null)
  const container = useRef(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    container.current?.querySelector('h1')?.focus()
  }, [selected])

  return <div ref={container}>
    {!selected ? <PointSelection onSelect={setSelected} /> : <>
      {selected === 'plaza-artigas' ? <PlazaArtigas /> : <PuertoCarmelo />}
      <div className="point-return"><button className="plain" onClick={() => setSelected(null)}>← Cambiar punto</button></div>
    </>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
export default App
