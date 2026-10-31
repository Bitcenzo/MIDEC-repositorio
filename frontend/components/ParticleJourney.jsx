import { useEffect, useRef } from 'react';

const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);

function sampleLine(points, t) {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let distance = t * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i] || i === lengths.length - 1) {
      const f = distance / lengths[i];
      return [mix(points[i][0], points[i + 1][0], f), mix(points[i][1], points[i + 1][1], f)];
    }
    distance -= lengths[i];
  }
  return points[0];
}

// Silhouettes are sampled into persistent grains of light. Thin, intermittent
// connections support legibility only while the particles are assembled.
const outlines = [
  [
    // Reference: rounded phone, floating cube and scanning planes. No person.
    [[-.44,-.86],[.44,-.86],[.52,-.83],[.57,-.75],[.57,.75],[.52,.83],[.44,.86],[-.44,.86],[-.52,.83],[-.57,.75],[-.57,-.75],[-.52,-.83],[-.44,-.86]],
    [[0,-.44],[.27,-.29],[0,-.13],[-.27,-.29],[0,-.44]],
    [[-.27,-.29],[-.27,.13],[0,.29],[.27,.13],[.27,-.29]],
    [[0,-.13],[0,.29]],
    [[-.12,-.72],[.12,-.72]],
    Array.from({length:33},(_,i)=>[Math.cos(i/32*Math.PI*2)*.065,.68+Math.sin(i/32*Math.PI*2)*.065]),
    [[-.57,-.02],[-.82,.13],[-.57,.28]],
    [[-.43,.34],[0,.58],[.43,.34],[.82,.13],[.57,-.02]],
  ],
  [
    [[-.85,-.68],[.25,-.68],[.25,-.06],[-.3,-.06],[-.56,.16],[-.56,-.06],[-.85,-.06],[-.85,-.68]],
    [[-.18,.05],[.85,.05],[.85,.64],[.57,.64],[.57,.86],[.3,.64],[-.18,.64],[-.18,.05]],
    [[-.66,-.48],[.05,-.48]], [[-.66,-.29],[-.12,-.29]],
    [[.02,.25],[.64,.25]], [[.02,.43],[.43,.43]],
    [[-.66,-.48],[.05,-.48]], [[.02,.25],[.64,.25]],
  ],
  [
    [[0,-.48],[-.23,-.61],[-.52,-.65],[-.85,-.58],[-.85,.56],[-.52,.49],[-.23,.53],[0,.68]],
    [[0,-.48],[.23,-.61],[.52,-.65],[.85,-.58],[.85,.56],[.52,.49],[.23,.53],[0,.68]],
    [[0,-.48],[0,.68]],
    [[-.85,.63],[-.52,.57],[-.23,.61],[0,.76],[.23,.61],[.52,.57],[.85,.63]],
    [[-.67,-.32],[-.45,-.35],[-.21,-.29]],
    [[-.67,-.08],[-.45,-.11],[-.21,-.05]],
    [[.21,-.29],[.45,-.35],[.67,-.32]],
    [[.21,-.05],[.45,-.11],[.67,-.08]],
  ],
];
const POINTS_PER_STROKE = 80;
function particleTargets() {
  return Array.from({ length: outlines[0].length * POINTS_PER_STROKE }, (_, i) => {
    const group = Math.floor(i / POINTS_PER_STROKE);
    const t = (i % POINTS_PER_STROKE) / (POINTS_PER_STROKE - 1);
    return outlines.map((shape) => {
      const [x,y] = sampleLine(shape[group],t);
      return [x,y,0];
    });
  });
}

// Motion is time-driven even with a stationary scroll position. Transform both
// morph endpoints so their motion remains continuous while changing scenes.
function animatePoint(point, scene, group, phase, reduced) {
  let [x,y,z] = point;
  if (reduced) return [x,y,z];
  if (scene === 0 && group >= 1 && group <= 3) {
    const turn = Math.sin(phase * 2.2) * .5;
    z = -x * Math.sin(turn);
    x *= Math.cos(turn);
    y += Math.sin(phase * 2.2) * .055;
  }
  if (scene === 0 && group >= 6) y += Math.sin(phase * 2.5) * .13;
  if (scene === 1) {
    // Two voices take turns: the reply rises and expands gently.
    const beat = Math.sin(phase * 3 + (group % 2) * Math.PI);
    const anchorX = group % 2 ? .34 : -.3;
    const anchorY = group % 2 ? .4 : -.3;
    const size = 1 + beat * .045;
    x = anchorX + (x-anchorX)*size;
    y = anchorY + (y-anchorY)*size + beat*.025;
  }
  if (scene === 2 && (group === 1 || group >= 6)) {
    // A page turns around the spine, lifts in depth and settles on the left.
    const cycle = .5 - .5 * Math.cos(phase * 2.4);
    const turn = smooth(clamp((cycle-.1)/.8)) * Math.PI;
    z = x * Math.sin(turn) * .7;
    x *= Math.cos(turn);
    y -= Math.sin(turn) * .07;
  }
  return [x,y,z];
}

export default function ParticleJourney({ containerRef, paused }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const targets = particleTargets();
    let width = 0, height = 0, frame = 0, visible = false, previous = 0, phase = 0;
    let pointerX = 0, pointerY = 0;
    let sections = [];
    function resize() {
      width = canvas.clientWidth; height = canvas.clientHeight;
      const ratio = Math.min(devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      sections = [...container.querySelectorAll('.pf-experience')];
      schedule();
    }
    function draw(now) {
      frame = 0;
      if (!visible || document.hidden || paused) { previous = 0; return; }
      const dt = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      if (!reduced.matches) phase += dt * .00035;
      const centers = sections.map(s => { const r=s.getBoundingClientRect(); return r.top+r.height/2; });
      const middle = height / 2;
      let progress = 0;
      if (centers.length === 3) {
        progress = middle < centers[1] ? clamp((middle-centers[0])/(centers[1]-centers[0])) : 1+clamp((middle-centers[1])/(centers[2]-centers[1]));
      }
      const index = Math.min(1, Math.floor(progress));
      const fraction = progress-index;
      const blend = reduced.matches ? (fraction < .5 ? 0 : 1) : smooth(clamp((fraction-.2)/.6));
      const burst = reduced.matches ? 0 : Math.sin(blend*Math.PI);
      const mobile = width < 768;
      const centerX = mobile ? width/2 : width * mix(index===1 ? .27 : .73, index===0 ? .27 : .73, blend);
      // After Relatos reaches its reading position, the scene is anchored to it
      // in document space instead of following the visitor into reviews.
      const stageTop = canvas.getBoundingClientRect().top;
      const endOffset = centers.length ? Math.min(0, centers[2] - middle) : 0;
      const centerY = (mobile ? height*.31 : height*.5) + endOffset - stageTop;
      const scale = Math.min(width*(mobile ? .43 : .24),height*(mobile ? .25 : .37));
      const angle = reduced.matches ? -.15 : Math.sin(phase)*.15 + pointerX*.12 + burst*.25;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      ctx.clearRect(0,0,width,height);
      const glow = ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,scale*1.5);
      glow.addColorStop(0,'rgba(255,0,0,.12)'); glow.addColorStop(1,'rgba(255,0,0,0)');
      ctx.fillStyle=glow; ctx.fillRect(0,0,width,height);
      let last = null;
      for (let i=0;i<targets.length;i++) {
        const group = Math.floor(i / POINTS_PER_STROKE);
        const from=animatePoint(targets[i][index],index,group,phase,reduced.matches);
        const to=animatePoint(targets[i][index+1],index+1,group,phase,reduced.matches);
        const seed=i*2.399963;
        const drift = reduced.matches ? 0 : Math.sin(phase*2+seed)*.009;
        const scatter = burst * (.38 + (Math.sin(seed*7)*.5+.5)*.48);
        let x=mix(from[0],to[0],blend)+Math.cos(seed+phase*.5)*scatter;
        let y=mix(from[1],to[1],blend)+Math.sin(seed+phase*.5)*scatter*.8+drift;
        let z=mix(from[2],to[2],blend)+Math.sin(seed)*burst*.65;
        const rx=x*cos-z*sin; z=x*sin+z*cos;
        const perspective=2.8/(2.8-z);
        const px=centerX+(rx+pointerX*.025)*scale*perspective;
        const py=centerY+(y+pointerY*.025)*scale*perspective;
        const red = index === 0 && blend < .5 ? true : group < 2;
        const assembled = Math.pow(1-burst, 4);
        // Fine, broken threads replace the thick drawn outlines. During the
        // explosion they disappear completely, leaving the same free particles.
        if (last && i % POINTS_PER_STROKE !== 0 && i % 9 < 7 && assembled > .1) {
          ctx.strokeStyle = red ? '#ff0000' : '#ffffff';
          ctx.globalAlpha = assembled * .48;
          ctx.lineWidth = 1.15;
          ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(px,py); ctx.stroke();
        }
        const shimmer = reduced.matches ? .95 : .87 + .1*Math.sin(seed+phase*2);
        const scan = index === 0 ? (1-blend) * Math.exp(-Math.pow((from[1] - Math.sin(phase)*.7)*9,2)) : 0;
        const radius = (1.15 + (Math.sin(seed*3)*.5+.5)*.55 + scan*.5) * perspective;
        ctx.fillStyle = red ? '#ff0000' : '#ffffff';
        ctx.globalAlpha = Math.min(1, shimmer + scan*.12);
        ctx.beginPath(); ctx.arc(px,py,radius,0,Math.PI*2); ctx.fill();
        // Sparse soft halos add luminosity without turning every point into a bead.
        if (i % 9 === 0) {
          ctx.globalAlpha = .09 * (1-burst*.5);
          ctx.beginPath(); ctx.arc(px,py,radius*3.5,0,Math.PI*2); ctx.fill();
        }
        last=[px,py];
      }
      ctx.globalAlpha=1;
      if (!reduced.matches) schedule();
    }
    function schedule() { if (!frame && visible && !paused && !document.hidden) frame=requestAnimationFrame(draw); }
    function pointer(event) { if (event.pointerType==='mouse') { pointerX=event.clientX/width-.5;pointerY=event.clientY/height-.5;schedule(); } }
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();});
    observer.observe(container);
    const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(canvas);
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('pointermove',pointer,{passive:true});
    document.addEventListener('visibilitychange',schedule);
    reduced.addEventListener('change',schedule);
    resize();
    return ()=>{cancelAnimationFrame(frame);observer.disconnect();sizeObserver.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('pointermove',pointer);document.removeEventListener('visibilitychange',schedule);reduced.removeEventListener('change',schedule);};
  }, [containerRef, paused]);
  return <div className="pf-particle-stage" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
