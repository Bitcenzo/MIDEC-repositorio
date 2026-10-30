import { useEffect, useRef, useState } from "react";
import logo from "../assets/componentes/logo horizntal.svg";
import "./PuntoFundacional.css";

const copy = {
  es: {
    location: "Plaza Artigas · Carmelo", title: "Punto Fundacional",
    intro: "Estás aquí. La historia también.", explore: "¿Te gustaría conocer más este lugar?",
    ar: "Realidad Aumentada", arHelp: "Mirá el lugar a través de tu cámara y descubrí una nueva capa de historia.",
    ai: "IA MARUJITA SARACHU", aiHelp: "Conversá con la asistente del museo.",
    stories: "Relatos", storiesHelp: "Historias para leer sin apuro.", photos: "Fotos", photosHelp: "Otras miradas del mismo lugar.",
    review: "¿Qué te pareció esta experiencia?", comment: "Tu comentario es muy importante",
    placeholder: "¿Qué descubriste? Compartí tu experiencia…", submit: "Compartir opinión", rating: "Tu valoración",
    local: "Demo: las opiniones se muestran solo durante esta visita; no se publican ni se guardan.",
    thanks: "Gracias. Tu opinión se agregó a esta demostración local.", empty: "Sé la primera persona en compartir una mirada.",
    about: "Nosotros", contact: "Contacto", menu: "Menú", close: "Cerrar", start: "Explorar este lugar",
    welcome: "Un lugar. Muchas historias.", video: "En 30 segundos, descubrí cómo vivir este punto del recorrido.",
    replay: "Ver introducción", demoVideo: "Video de muestra: reemplazar por la introducción de MIDEC.",
    unavailable: "Esta experiencia todavía no está disponible en esta demostración.", visit: "Abrir experiencia",
    reference: "Imagen de referencia · sustituir por una fotografía del lugar", demoText: "Texto histórico de muestra",
    galleryEmpty: "La galería histórica se incorporará próximamente.", scroll: "Descubrí lo que hay detrás", number: "PUNTO 01", opinions: "Opiniones de esta visita",
  },
  en: {
    location: "Artigas Square · Carmelo", title: "Founding Point",
    intro: "You are here. So is history.", explore: "Want to discover more about this place?",
    ar: "Augmented Reality", arHelp: "Look through your camera and discover a new layer of history.",
    ai: "AI MARUJITA SARACHU", aiHelp: "Chat with the museum assistant.",
    stories: "Stories", storiesHelp: "Take your time with these stories.", photos: "Photos", photosHelp: "New perspectives on the same place.",
    review: "How was your experience?", comment: "Your comment matters",
    placeholder: "What did you discover? Share your experience…", submit: "Share your thoughts", rating: "Your rating",
    local: "Demo: reviews appear during this visit only; they are not published or saved.",
    thanks: "Thank you. Your review was added to this local demo.", empty: "Be the first to share your perspective.",
    about: "About us", contact: "Contact", menu: "Menu", close: "Close", start: "Explore this place",
    welcome: "One place. Many stories.", video: "Discover this stop on the route in 30 seconds.",
    replay: "Watch introduction", demoVideo: "Sample video: replace with the MIDEC introduction.",
    unavailable: "This experience is not available in this demo yet.", visit: "Open experience",
    reference: "Reference image · replace with a photograph of the site", demoText: "Sample historical text",
    galleryEmpty: "Historical photos will be added soon.", scroll: "Discover the stories behind it", number: "STOP 01", opinions: "Reviews from this visit",
  },
};

function Icon({ type, ...props }) {
  const paths = {
    ar: "M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5M8 8h8v8H8z",
    ai: "M4 4h16v12H9l-5 4V4zM8 9h.01M12 9h.01M16 9h.01",
    stories: "M12 5v15M12 5C9 3 5 3 2 4v14c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1z",
    photos: "M3 3h18v18H3zM3 17l6-6 5 5 3-3 4 4M16 7h.01",
    arrow: "M5 12h14M13 6l6 6-6 6", close: "M6 6l12 12M18 6 6 18", menu: "M3 7h18M3 17h18",
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}><path d={paths[type]} /></svg>;
}

// Native dialog provides focus containment, Escape handling and an inert background.
function Modal({ open, onClose, title, closeLabel, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  return <dialog ref={ref} className="pf-dialog" aria-label={title} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    {open && <><div className="pf-dialog-top"><span>MIDEC / {title}</span><button type="button" className="pf-icon-button" onClick={onClose} aria-label={closeLabel} autoFocus><Icon type="close" /></button></div>{children}</>}
  </dialog>;
}

/** URLs are trusted integration settings. Photo items: { src, alt }. */
export default function PuntoFundacional({
  videoUrl = "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ",
  videoIsPlaceholder = true,
  imageUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1400&q=80",
  imageAlt = "Fotografía urbana de referencia / Reference city photograph",
  imageIsPlaceholder = true,
  history = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae tellus at augue consequat viverra. Integer euismod, lectus sed memoria temporis, urna justo tincidunt erat, vitae volutpat sapien nulla eget est.",
  storyText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae justo eu erat elementum feugiat. Donec posuere, nibh sed cursus volutpat, felis urna interdum arcu, quis tincidunt lorem ante ac neque.",
  arUrl, assistantUrl, photos = [], aboutUrl = "/index.html", contactUrl = "/contacto.html",
}) {
  const [videoOpen, setVideoOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState("es");
  const [panel, setPanel] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const t = copy[language];
  const actions = [
    { id: "ar", title: t.ar, text: t.arHelp },
    { id: "ai", title: t.ai, text: t.aiHelp },
    { id: "stories", title: t.stories, text: t.storiesHelp },
    { id: "photos", title: t.photos, text: t.photosHelp },
  ];
  const active = actions.find((action) => action.id === panel);
  const destination = panel === "ar" ? arUrl : assistantUrl;

  function submitReview(event) {
    event.preventDefault();
    if (!rating || !comment.trim()) return;
    setReviews((previous) => [{ id: Date.now(), rating, comment: comment.trim() }, ...previous]);
    setComment(""); setRating(0); setSubmitted(true);
  }

  return <div className="pf" lang={language}>
    <header className="pf-header">
      <a className="pf-brand" href={aboutUrl} aria-label="MIDEC"><svg viewBox="350 780 1250 470" role="img" aria-label="MIDEC"><image href={logo} width="1950" height="1950" /></svg></a>
      <div className="pf-nav-controls">
        <label className="pf-sr-only" htmlFor="pf-language">Idioma / Language</label>
        <select id="pf-language" value={language} onChange={(event) => setLanguage(event.target.value)}><option value="es">ES</option><option value="en">EN</option></select>
        <button type="button" className="pf-icon-button" aria-label={t.menu} aria-expanded={menuOpen} aria-controls="pf-menu" onClick={() => setMenuOpen(!menuOpen)}><Icon type={menuOpen ? "close" : "menu"} /></button>
      </div>
      {menuOpen && <nav id="pf-menu" className="pf-menu" aria-label={t.menu} onKeyDown={(event) => { if (event.key === "Escape") { setMenuOpen(false); event.currentTarget.previousElementSibling?.querySelector("button")?.focus(); } }}><a href={aboutUrl}>{t.about}</a><a href={contactUrl}>{t.contact}</a></nav>}
    </header>

    <main>
      <section className="pf-hero" aria-labelledby="pf-title">
        <div className="pf-eyebrow"><span className="pf-dot" />{t.number}<span>{t.location}</span></div>
        <figure className="pf-place">
          <img src={imageUrl} alt={imageAlt} fetchPriority="high" />
          <div className="pf-portals" aria-hidden="true"><i /><i /><i /></div>
          <figcaption>{t.location}<span>↗</span></figcaption>
        </figure>
        {imageIsPlaceholder && <p className="pf-caption">{t.reference}</p>}
        <div className="pf-history"><p className="pf-kicker">{t.intro}</p><h1 id="pf-title">{t.title}<span aria-hidden="true">.</span></h1><p>{history}</p><a className="pf-scroll" href="#pf-explore">{t.scroll}<span aria-hidden="true">↓</span></a></div>
      </section>

      <section id="pf-explore" className="pf-explore" aria-labelledby="pf-explore-title">
        <div className="pf-section-label"><span>01 /</span> EXPLORAR · EXPLORE</div>
        <h2 id="pf-explore-title">{t.explore}</h2>
        <div className="pf-grid">{actions.map((action) => <button type="button" key={action.id} className={`pf-card ${action.id === "ar" ? "pf-card-featured" : ""}`} onClick={() => setPanel(action.id)} aria-haspopup="dialog"><Icon type={action.id} className={action.id === "ar" ? "pf-ar-icon" : ""} /><span className="pf-card-title">{action.title}</span><span className="pf-card-text">{action.text}</span><Icon type="arrow" className="pf-card-arrow" /></button>)}</div>
      </section>

      <section className="pf-reviews" aria-labelledby="pf-review-title">
        <div className="pf-section-label"><span>02 /</span> TU MIRADA · YOUR VIEW</div>
        <h2 id="pf-review-title">{t.review}</h2>
        <form onSubmit={submitReview}>
          <fieldset className="pf-rating"><legend>{t.rating}</legend><div>{[1, 2, 3, 4, 5].map((star) => <label key={star}><input type="radio" name="pf-rating" value={star} checked={rating === star} required onChange={() => { setRating(star); setSubmitted(false); }} /><span className={star <= rating ? "is-selected" : ""} aria-hidden="true">★</span><span className="pf-sr-only">{star} / 5</span></label>)}</div></fieldset>
          <label className="pf-comment-label" htmlFor="pf-comment">{t.comment}</label>
          <textarea id="pf-comment" value={comment} onChange={(event) => { setComment(event.target.value); setSubmitted(false); }} placeholder={t.placeholder} rows={4} maxLength={1000} required aria-describedby="pf-local" />
          <p className="pf-caption" id="pf-local">{t.local}</p>
          <button className="pf-primary" type="submit" disabled={!rating || !comment.trim()}>{t.submit}<Icon type="arrow" /></button>
          <p role="status">{submitted ? t.thanks : ""}</p>
        </form>
        <div className="pf-opinions" aria-label={t.opinions}>{reviews.length ? reviews.map((review) => <article key={review.id}><span aria-label={`${review.rating} / 5`} className="pf-review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span><p>{review.comment}</p></article>) : <p>{t.empty}</p>}</div>
      </section>
    </main>
    <footer className="pf-footer"><strong>MIDEC<span aria-hidden="true">↗</span></strong><span>Museo Interactivo De El Carmelo</span><button type="button" onClick={() => setVideoOpen(true)}>{t.replay}</button></footer>

    <Modal open={videoOpen} onClose={() => setVideoOpen(false)} title="VIDEO 30s" closeLabel={t.close}>
      <div className="pf-modal-copy"><p className="pf-kicker">{t.location}</p><h2>{t.welcome}</h2><p>{t.video}</p></div>
      <div className="pf-video"><iframe src={videoUrl} title={t.replay} allow="fullscreen; picture-in-picture; encrypted-media" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
      <div className="pf-modal-copy">{videoIsPlaceholder && <p className="pf-caption">{t.demoVideo}</p>}<button type="button" className="pf-primary" onClick={() => setVideoOpen(false)}>{t.start}<Icon type="arrow" /></button></div>
    </Modal>
    <Modal open={Boolean(panel)} onClose={() => setPanel(null)} title={active?.title || ""} closeLabel={t.close}>
      <div className="pf-modal-copy"><h2>{active?.title}</h2>
        {panel === "stories" && <p>{storyText}</p>}
        {panel === "photos" && (photos.length ? <div className="pf-gallery">{photos.map((photo, index) => <figure key={`${photo.src}-${index}`}><img src={photo.src} alt={photo.alt} loading="lazy" /><figcaption>{photo.alt}</figcaption></figure>)}</div> : <p>{t.galleryEmpty}</p>)}
        {(panel === "ar" || panel === "ai") && <><p>{active?.text}</p>{destination ? <a className="pf-primary" href={destination}>{t.visit}<Icon type="arrow" /></a> : <p>{t.unavailable}</p>}</>}
      </div>
    </Modal>
  </div>;
}
