import { useEffect, useRef, useState } from 'react';
import logo from '../assets/componentes/logo-midec.svg';
import './PuntoFundacional.css';

const texts = {
  es: { title: 'Punto Fundacional', scroll: 'Deslizá para descubrir las experiencias', actions: ['Realidad Aumentada', 'IA Mente Museo', 'Relatos', 'Fotos'], start: 'Explorar este lugar', close: 'Cerrar', menu: 'Menú', about: 'Nosotros', contact: 'Contacto', review: '¿Qué te pareció esta experiencia?', comment: 'Tu comentario es muy importante...', send: 'Compartir', local: 'Las opiniones se muestran solo durante esta visita.', thanks: 'Gracias por compartir tu experiencia.', unavailable: 'Esta experiencia estará disponible próximamente.', gallery: 'Próximamente, las imágenes de este lugar.', read: 'El relato de este lugar estará disponible próximamente.', open: 'Entrar', email: 'Escribinos', replay: 'Volver a ver el video' },
  en: { title: 'Founding Point', scroll: 'Scroll to discover the experiences', actions: ['Augmented Reality', 'AI Mente Museo', 'Stories', 'Photos'], start: 'Explore this place', close: 'Close', menu: 'Menu', about: 'About us', contact: 'Contact', review: 'How was your experience?', comment: 'Your comment matters...', send: 'Share', local: 'Reviews appear during this visit only.', thanks: 'Thank you for sharing your experience.', unavailable: 'This experience is coming soon.', gallery: 'Photographs of this place are coming soon.', read: 'The story of this place is coming soon.', open: 'Enter', email: 'Write to us', replay: 'Watch the video again' },
};
const descriptions = {
  es: ['Apuntá tu cámara y descubrí cómo la historia se superpone al lugar que tenés enfrente.', 'Una pregunta puede abrir mil historias. Conversá con Mente Museo y dejate llevar por tu curiosidad.', 'Detenete a leer las voces, las memorias y las historias que atraviesan este lugar.', 'Recorré el lugar a través de sus imágenes y encontrá los detalles que el tiempo transforma.'],
  en: ['Point your camera and discover history layered over the place in front of you.', 'One question can open a thousand stories. Talk with Mente Museo and follow your curiosity.', 'Take time to read the voices, memories and stories of this place.', 'Explore this place through photographs and discover the details that time transforms.'],
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

function ExperienceArt({ kind }) {
  return <svg viewBox="0 0 500 400" fill="none" aria-hidden="true">
    {kind === 'ar' && <>
      <g className="pf-ar-place"><path d="M70 310h360M100 310V160l95-55 95 55v150M130 310V190h40v120M215 310V190h40v120M100 160h190"/><path d="M310 310V210h95v100M330 235h20M365 235h20"/></g>
      <g className="pf-ar-phone"><rect x="185" y="55" width="155" height="285" rx="24" fill="#000"/><path d="M230 72h65M245 323h35"/><path className="pf-art-accent" d="M202 290V160l60-40 60 40v130ZM202 160h120M240 290v-85h44v85"/><path className="pf-ar-scan pf-art-accent" d="M200 200h125"/></g>
      <path className="pf-art-accent" d="M160 100V55h-40M365 295v45h40"/>
    </>}
    {kind === 'ai' && <>
      <g className="pf-person"><path d="M70 335v-35q0-55 65-55t65 55v35" fill="#ffffff10"/><circle cx="135" cy="200" r="40" fill="#ffffff15"/><path d="M98 190q10-48 58-20l18 18M145 216q12 8 20-3M130 192h2M156 192h2M100 280l35 25 35-25"/></g>
      <g className="pf-question"><path d="M65 70h150v78h-70l-26 24v-24H65Z" fill="#000"/><path d="M91 96h90M91 119h60"/></g>
      <g className="pf-answer"><path className="pf-art-accent" d="M245 120h190v112h-45v27l-30-27H245Z" fill="#ff000018"/><path d="M270 151h135M270 174h110M270 197h75"/></g>
      <g className="pf-ai-companion"><rect x="310" y="280" width="80" height="65" rx="22" fill="#ff000020" className="pf-art-accent"/><path d="M333 302v4M367 302v4M337 322q13 12 26 0M350 280v-14"/><circle cx="350" cy="262" r="4" className="pf-art-accent"/></g>
    </>}
    {kind === 'stories' && <>
      <path d="M250 120c-50-35-105-40-160-20v200c55-20 110-15 160 20 50-35 105-40 160-20V100c-55-20-110-15-160 20ZM250 120v200"/>
      <g className="pf-story-lines"><path d="M120 145q50-12 100 14M120 180q50-12 100 14M120 215q50-12 100 14M280 159q50-26 100-14M280 194q50-26 100-14M280 229q50-26 100-14"/></g>
      <path className="pf-story-page pf-art-accent" d="M250 120q40-55 115-65v200q-75 10-115 65Z"/>
    </>}
    {kind === 'photos' && <>
      <g className="pf-photo-back"><path d="m95 85 265-20 18 250-265 20Z"/></g>
      <g className="pf-photo-front"><path d="m140 105 270 25-20 240-270-25Z"/><path d="m155 125 232 22-14 155-232-22Z"/><path d="m150 245 65-60 55 60 35-30 70 70"/><circle cx="325" cy="185" r="18" className="pf-art-accent"/></g>
      <path className="pf-photo-flash pf-art-accent" d="M100 70v-25M80 82l-20-12M120 65l15-20"/>
    </>}
  </svg>;
}

// The observer activates CSS animations only while a section is on screen.
function Experience({ kind, title, description, onOpen }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => typeof window !== 'undefined' && !('IntersectionObserver' in window));
  useEffect(() => {
    const element = ref.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let active = false;
    const paint = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      element.style.setProperty('--journey', reduced.matches ? '.5' : progress.toFixed(4));
    };
    const schedule = () => { if (active && !frame) frame = requestAnimationFrame(paint); };
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      setVisible(active);
      if (active) schedule();
    }, { rootMargin: '80px' }) : null;
    if (observer) observer.observe(element);
    else { active = true; schedule(); }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', paint);
    return () => {
      observer?.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', paint);
    };
  }, []);
  return <section ref={ref} className={`pf-experience pf-${kind} ${visible ? 'is-visible' : ''}`}>
    <button type="button" className="pf-experience-trigger" onClick={onOpen} aria-haspopup="dialog">
      <div className="pf-network" aria-hidden="true"><ExperienceArt kind={kind} /></div>
      <div className="pf-experience-copy">
        <h2>{title}</h2><p>{description}</p><Icon className="pf-experience-arrow" type="arrow" />
      </div>
    </button>
  </section>;
}

export default function PuntoFundacional({
  videoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  imageUrl = 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1800&q=85',
  imageAlt = 'Imagen urbana de referencia',
  logoUrl = logo, title, description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae justo at tellus feugiat tincidunt. Sed tempus, sem at volutpat consequat, arcu erat porttitor nibh, vitae malesuada neque lorem vel erat.', storyText, arUrl, assistantUrl, photos = [],
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
      <section className="pf-hero" aria-labelledby="pf-title"><img className="pf-hero-image" src={imageUrl} alt={imageAlt} fetchPriority="high" /><div className="pf-hero-fade" aria-hidden="true" /><div className="pf-hero-copy"><h1 id="pf-title">{title || t.title}</h1><p>{description}</p></div></section>
      <a className="pf-scroll" href="#pf-experiences">{t.scroll}<Icon type="down" /></a>
      <div id="pf-experiences" className="pf-experiences">{kinds.map((kind, index) => <Experience key={kind} kind={kind} title={t.actions[index]} description={descriptions[language][index]} onOpen={() => setPanel(kind)} />)}</div>
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
