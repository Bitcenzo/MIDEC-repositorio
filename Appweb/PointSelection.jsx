import { points } from './points.js'
import './points.css'

export default function PointSelection({ onSelect }) {
  return <main className="point-selection">
    <header className="header"><img src="/assets/componentes/logo-midec.svg" alt="MIDEC · Museo Interactivo de Carmelo" /></header>
    <section className="point-selection-content" aria-labelledby="points-title">
      <h1 id="points-title" tabIndex={-1}>Elegí un punto</h1>
      <ol className="point-list">{points.map(point => <li key={point.id}>
        <button className="point-option" onClick={() => onSelect(point.id)}>
          <span className="point-order" aria-hidden="true">{point.priority}</span>
          <span className="point-name"><strong>{point.name}</strong>{point.detail && <span>{point.detail}</span>}</span>
          <span className="point-arrow" aria-hidden="true">→</span>
        </button>
      </li>)}</ol>
    </section>
  </main>
}
