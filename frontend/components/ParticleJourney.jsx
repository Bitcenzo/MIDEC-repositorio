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

// Stable particle identities: each point has one destination in each scene.
function particleTargets(count) {
  return Array.from({ length: count }, (_, i) => {
    const t = (i % 200) / 199;
    const layer = Math.floor(i / 200);
    const depth = layer * 0.13;
    const portal = sampleLine([[-.65,-.82],[.65,-.82],[.65,.82],[-.65,.82],[-.65,-.82]], t);
    const side = i % 2 ? 1 : -1;
    const talk = sampleLine([[-.45,-.3],[.45,-.3],[.45,.25],[.05,.25],[-.2,.48],[-.2,.25],[-.45,.25],[-.45,-.3]], (i % 500) / 499);
    const page = sampleLine([[0,-.48],[side * .7,-.7],[side * .7,.48],[0,.72],[0,-.48]], t);
    return [
      [portal[0] * (1-depth*.35), portal[1] * (1-depth*.35), depth-.3],
      [talk[0] + side*.38, talk[1] + side*.3, Math.sin(i * 2.399)*.07],
      [page[0],page[1] - layer*.055, Math.sin(t*Math.PI)*.18 + depth*.22],
    ];
  });
}

export default function ParticleJourney({ containerRef, paused }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const targets = particleTargets(1000);
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
      const centerY = mobile ? height*.31 : height*.5;
      const scale = Math.min(width*(mobile ? .43 : .24),height*(mobile ? .25 : .37));
      const angle = reduced.matches ? -.15 : Math.sin(phase)*.15 + pointerX*.12 + burst*.8;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      ctx.clearRect(0,0,width,height);
      const glow = ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,scale*1.5);
      glow.addColorStop(0,'rgba(255,0,0,.12)'); glow.addColorStop(1,'rgba(255,0,0,0)');
      ctx.fillStyle=glow; ctx.fillRect(0,0,width,height);
      let last = null;
      for (let i=0;i<targets.length;i++) {
        const from=targets[i][index], to=targets[i][index+1];
        const seed=i*2.399963;
        const drift = reduced.matches ? 0 : Math.sin(phase*2+seed)*.012;
        let x=mix(from[0],to[0],blend)+Math.cos(seed+phase)*burst*.7;
        let y=mix(from[1],to[1],blend)+Math.sin(seed+phase)*burst*.65+drift;
        let z=mix(from[2],to[2],blend)+Math.sin(seed)*burst*.65;
        const rx=x*cos-z*sin; z=x*sin+z*cos;
        const perspective=2.8/(2.8-z);
        const px=centerX+(rx+pointerX*.025)*scale*perspective;
        const py=centerY+(y+pointerY*.025)*scale*perspective;
        const red=i%5!==0;
        ctx.globalAlpha=clamp(.55+z*.3,.3,.95);
        ctx.fillStyle=red?'#ff0000':'#ffffff';
        const radius=(red?1.6:2.2)*perspective*(mobile?1:1.2);
        ctx.beginPath();ctx.arc(px,py,radius,0,Math.PI*2);ctx.fill();
        if (last && i%200!==0 && Math.hypot(px-last[0],py-last[1])<scale*.09) {
          ctx.strokeStyle=red?'rgba(255,0,0,.45)':'rgba(255,255,255,.5)';ctx.lineWidth=1.7;
          ctx.beginPath();ctx.moveTo(...last);ctx.lineTo(px,py);ctx.stroke();
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
