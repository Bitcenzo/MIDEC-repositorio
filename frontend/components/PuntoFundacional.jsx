import { useEffect, useRef, useState } from 'react';
import logo from '../assets/componentes/logo-midec.svg';
import './PuntoFundacional.css';

const texts = {
  es: { title: 'Punto Fundacional', scroll: 'Deslizá para descubrir las experiencias', actions: ['Realidad Aumentada', 'IA Mente Museo', 'Relatos', 'Fotos'], start: 'Explorar este lugar', close: 'Cerrar', menu: 'Menú', about: 'Nosotros', contact: 'Contacto', review: '¿Qué te pareció esta experiencia?', comment: 'Tu comentario es muy importante...', send: 'Compartir', local: 'Las opiniones se muestran solo durante esta visita.', thanks: 'Gracias por compartir tu experiencia.', unavailable: 'Esta experiencia estará disponible próximamente.', gallery: 'Próximamente, las imágenes de este lugar.', read: 'El relato de este lugar estará disponible próximamente.', open: 'Entrar', email: 'Escribinos', replay: 'Volver a ver el video' },
  en: { title: 'Founding Point', scroll: 'Scroll to discover the experiences', actions: ['Augmented Reality', 'AI Mente Museo', 'Stories', 'Photos'], start: 'Explore this place', close: 'Close', menu: 'Menu', about: 'About us', contact: 'Contact', review: 'How was your experience?', comment: 'Your comment matters...', send: 'Share', local: 'Reviews appear during this visit only.', thanks: 'Thank you for sharing your experience.', unavailable: 'This experience is coming soon.', gallery: 'Photographs of this place are coming soon.', read: 'The story of this place is coming soon.', open: 'Enter', email: 'Write to us', replay: 'Watch the video again' },
};
const kinds = ['ar', 'ai', 'stories', 'photos'];

function Icon({ type, ...props }) {
  const paths = {
    ar: 'M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5M8 8h8v8H8z',
    ai: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3M8 8h8v8H8z',
    stories: 'M12 5v15M12 5C9 3 5 3 2 4v14c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1z',
    photos: 'M3 3h18v18H3zM3 17l6-6 5 5 3-3 4 4M16 7h.01',
    arrow: 'M5 19 19 5M5 5h14v14', close: 'M5 5l14 14M19 5 5 19', menu: 'M3 8h18M3 16h18', down: 'M12 3v18M5 14l7 7 7-7',
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" {...props}><path d={paths[type]} /></svg>;
}

function Modal({ open, onClose, label, closeLabel, intro = false, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  return <dialog ref={ref} className={`pf-dialog ${intro ? 'pf-intro' : ''}`} aria-label={label} onCancel={event => { event.preventDefault(); onClose(); }}>
    {open && <><button autoFocus type="button" className="pf-close" onClick={onClose} aria-label={closeLabel}><Icon type="close" /></button>{children}</>}
  </dialog>;
}

// The observer activates CSS animations only while a section is on screen.
function Experience({ kind, title, index, onOpen }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => typeof window !== 'undefined' && !('IntersectionObserver' in window));
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.18 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <section ref={ref} className={`pf-experience pf-${kind} ${visible ? 'is-visible' : ''}`}>
    <button type="button" className="pf-experience-trigger" onClick={onOpen} aria-haspopup="dialog">
      <div className="pf-network" aria-hidden="true">
        <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
          <g className="pf-frames"><path d="M350 30 780 100 780 450 350 380ZM405 90 720 140 720 390 405 340ZM460 150 660 180 660 330 460 300Z" /><path d="M350 30 460 150M780 100 660 180M780 450 660 330M350 380 460 300" /></g>
          <path className="pf-route" d="M0 390H180L290 280H480V210H650L760 100H1000" />
          <g className="pf-nodes"><circle cx="180" cy="390" r="4"/><circle cx="480" cy="280" r="4"/><circle cx="650" cy="210" r="4"/><circle cx="760" cy="100" r="4"/></g>
        </svg>
      </div>
      <span className="pf-experience-number" aria-hidden="true">0{index + 1}</span>
      <Icon className="pf-experience-icon" type={kind} />
      <h2>{title}</h2><Icon className="pf-experience-arrow" type="arrow" />
    </button>
  </section>;
}

export default function PuntoFundacional({
  videoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  imageUrl = 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1800&q=85',
  imageAlt = 'Imagen urbana de referencia',
  logoUrl = logo, title, storyText, arUrl, assistantUrl, photos = [],
  aboutUrl = '/index.html', contactUrl = '/contacto.html',
  instagramUrl = 'https://www.instagram.com/midec.uy/', contactEmail,
}) {
  const [videoOpen, setVideoOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState('es');
  const [scrolled, setScrolled] = useState(false);
  const [panel, setPanel] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const t = texts[language];
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  function submitReview(event) {
    event.preventDefault();
    if (!rating || !comment.trim()) return;
    setReviews(previous => [{ id: Date.now(), rating, comment: comment.trim() }, ...previous]);
    setComment(''); setRating(0); setSubmitted(true);
  }
  const destination = panel === 'ar' ? arUrl : assistantUrl;
  const panelTitle = t.actions[kinds.indexOf(panel)] || '';

  return <div className="pf" lang={language}>
    <header className={`pf-header ${scrolled || menuOpen ? 'is-scrolled' : ''}`}>
      <a className="pf-brand" href={aboutUrl}><img src={logoUrl} alt="MIDEC" width="190" height="72" /></a>
      <div className="pf-nav-controls">
        <label className="pf-sr-only" htmlFor="pf-language">Idioma / Language</label>
        <select id="pf-language" value={language} onChange={event => setLanguage(event.target.value)}><option value="es">ES</option><option value="en">EN</option></select>
        <button type="button" className="pf-icon-button" aria-label={t.menu} aria-expanded={menuOpen} aria-controls="pf-menu" onClick={() => setMenuOpen(!menuOpen)}><Icon type={menuOpen ? 'close' : 'menu'} /></button>
      </div>
      {menuOpen && <nav id="pf-menu" className="pf-menu" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); event.currentTarget.previousElementSibling?.querySelector('button')?.focus(); } }}><a href={aboutUrl}>{t.about}</a><a href="#pf-contact" onClick={() => setMenuOpen(false)}>{t.contact}</a></nav>}
    </header>
    <main>
      <section className="pf-hero" aria-labelledby="pf-title"><img className="pf-hero-image" src={imageUrl} alt={imageAlt} fetchPriority="high" /><div className="pf-hero-fade" aria-hidden="true" /><h1 id="pf-title">{title || t.title}</h1></section>
      <a className="pf-scroll" href="#pf-experiences">{t.scroll}<Icon type="down" /></a>
      <div id="pf-experiences" className="pf-experiences">{kinds.map((kind, index) => <Experience key={kind} kind={kind} index={index} title={t.actions[index]} onOpen={() => setPanel(kind)} />)}</div>
      <section className="pf-reviews" aria-labelledby="pf-review-title">
        <h2 id="pf-review-title">{t.review}</h2>
        <form onSubmit={submitReview}>
          <fieldset className="pf-rating"><legend className="pf-sr-only">{t.review}</legend><div>{[1, 2, 3, 4, 5].map(star => <label key={star}><input type="radio" name="pf-rating" value={star} checked={rating === star} required onChange={() => { setRating(star); setSubmitted(false); }} /><svg viewBox="0 0 24 24" className={star <= rating ? 'is-selected' : ''} aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2l-5-4.9 6.9-1z" /></svg><span className="pf-sr-only">{star} / 5</span></label>)}</div></fieldset>
          <label className="pf-sr-only" htmlFor="pf-comment">{t.comment}</label>
          <textarea id="pf-comment" value={comment} onChange={event => { setComment(event.target.value); setSubmitted(false); }} placeholder={t.comment} rows={3} maxLength={1000} required aria-describedby="pf-local" />
          <div className="pf-form-bottom"><p id="pf-local">{t.local}</p><button className="pf-send" type="submit" disabled={!rating || !comment.trim()}>{t.send}<Icon type="arrow" /></button></div>
          <p className="pf-status" role="status">{submitted ? t.thanks : ''}</p>
        </form>
        <div className="pf-opinions">{reviews.map(review => <article key={review.id}><span aria-label={`${review.rating} / 5`}>{'★'.repeat(review.rating)}</span><p>{review.comment}</p></article>)}</div>
      </section>
    </main>
    <footer id="pf-contact" className="pf-footer">
      <a className="pf-brand" href={aboutUrl}><img src={logoUrl} alt="MIDEC" width="190" height="72" loading="lazy" /></a>
      <div className="pf-contact-links"><a href={instagramUrl} target="_blank" rel="noreferrer">Instagram<Icon type="arrow" /></a><a href={contactEmail ? `mailto:${contactEmail}` : contactUrl}>{contactEmail || t.email}<Icon type="arrow" /></a><a href={contactUrl}>{t.contact}<Icon type="arrow" /></a></div>
      <div className="pf-footer-bottom"><span>Museo Interactivo De El Carmelo</span><button type="button" onClick={() => setVideoOpen(true)}>{t.replay}</button></div>
    </footer>
    <Modal open={videoOpen} onClose={() => setVideoOpen(false)} label={t.start} closeLabel={t.close} intro>
      <video className="pf-video" src={videoUrl} autoPlay muted loop playsInline disablePictureInPicture preload="auto" />
      <button type="button" className="pf-explore-button" onClick={() => setVideoOpen(false)}>{t.start}<Icon type="arrow" /></button>
    </Modal>
    <Modal open={Boolean(panel)} onClose={() => setPanel(null)} label={panelTitle} closeLabel={t.close}>
      <div className="pf-panel-content"><Icon type={panel || 'ar'} /><h2>{panelTitle}</h2>
        {panel === 'stories' && <p>{storyText || t.read}</p>}
        {panel === 'photos' && (photos.length ? <div className="pf-gallery">{photos.map((photo, index) => <figure key={`${photo.src}-${index}`}><img src={photo.src} alt={photo.alt} loading="lazy" /><figcaption>{photo.alt}</figcaption></figure>)}</div> : <p>{t.gallery}</p>)}
        {(panel === 'ar' || panel === 'ai') && (destination ? <a className="pf-explore-button" href={destination}>{t.open}<Icon type="arrow" /></a> : <p>{t.unavailable}</p>)}
      </div>
    </Modal>
  </div>;
}
