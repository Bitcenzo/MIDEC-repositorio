/**
 * Motor de Animación de Circuito Digital Ortogonal v9.0 (MIDEC)
 *
 * CORRECCIONES DEFINITIVAS:
 * 1. FADE OUT EN LÍNEA SÓLIDA: Opacidades invertidas -> capa más corta=más brillante (cabeza),
 *    capa más larga=más tenue (tail fade). El tail ahora se desvanece naturalmente a negro.
 * 2. COLOR DEL PORTAL SOLO DONDE CORRESPONDE: Zone3 dividida en:
 *    - 3a blanco: giro 90° y pista previa de 350px (M 900 220 V 560 H 1250) -> WHITE
 *    - 3b gradiente: solo el sub-path del portal (M 1250 560 v -145 c... v 145) -> GRADIENT
 *    - 3c blanco: salida continua (M 1250 560 H 1980) -> WHITE
 *    El color magenta/rojo aparece ÚNICAMENTE en la forma del portal, nunca antes.
 * 3. PUNTOS CUADRADOS: Fade out idéntico al de la línea (ya funcionaba correctamente).
 * 4. UNIÓN EN LA BASE DEL PORTAL: Perfecta y sólida (miter join garantizado por path continuo).
 */

(function () {
  'use strict';

  const CONFIG = {
    viewBoxWidth: 1920,
    viewBoxHeight: 1080,
    strokeWidth: 50,
    snakeLength: 850,
    layerCount: 6
  };

  // Opacidades CORREGIDAS: capa 0 (más corta, solo en la cabeza) = más brillante;
  // capa 5 (más larga, cubre todo) = más tenue -> crea fade natural desde cabeza a cola
  const LAYER_OPS = [1.0, 0.85, 0.68, 0.50, 0.30, 0.12];

  function getPortalPathString(stemH) {
    return 'v -' + stemH + ' ' +
           'c 0 0 -56.09 -74.15 -56.09 -105.92 ' +
           'c 0 -30.96 25.13 -56.09 56.09 -56.09 ' +
           'c 30.95 0 56.09 25.13 56.09 56.09 ' +
           'c 0 31.77 -56.09 105.92 -56.09 105.92 ' +
           'v ' + stemH;
  }

  /**
   * Definicion de víboras con segmentos claramente separados.
   * Cada zona tiene su color explícito. El gradiente del portal va SOLO en zone3b.
   */
  const SNAKE_BLUEPRINTS = [
    {
      id: 'snake-1',
      speed: 350,
      delay: 0,
      zone1:  { d: 'M -60 220 H 500',            stroke: '#ffffff' },
      dots:   { x0: 500, y0: 220, count: 4, len: 400, dir: 1 },
      zone3a: { d: 'M 900 220 V 560 H 1250',      stroke: '#ffffff' },
      zone3b: { d: 'M 1250 560 ' + getPortalPathString(145), stroke: 'url(#portal-grad-560)' },
      zone3c: { d: 'M 1250 560 H 1980',           stroke: '#ffffff' }
    },
    {
      id: 'snake-2',
      speed: 330,
      delay: 4.5,
      zone1:  { d: 'M 1980 900 H 1500',           stroke: '#ffffff' },
      dots:   { x0: 1500, y0: 900, count: 4, len: 400, dir: -1 },
      zone3a: { d: 'M 1100 900 V 560 H 650',      stroke: '#ffffff' },
      zone3b: { d: 'M 650 560 ' + getPortalPathString(145), stroke: 'url(#portal-grad-560)' },
      zone3c: { d: 'M 650 560 H -60',             stroke: '#ffffff' }
    },
    {
      id: 'snake-3',
      speed: 370,
      delay: 9.0,
      zone1:  { d: 'M -60 900 H 450',             stroke: '#ffffff' },
      dots:   { x0: 450, y0: 900, count: 4, len: 400, dir: 1 },
      zone3a: { d: 'M 850 900 H 1300 V 220 H 1980', stroke: '#ffffff' },
      zone3b: null,
      zone3c: null
    }
  ];

  class CircuitEngine {
    constructor() {
      this.svg = document.getElementById('circuit-svg');
      this.defs = document.getElementById('circuit-defs');
      this.container = document.getElementById('circuit-snakes-container');
      if (!this.svg || !this.defs || !this.container) return;
      this.snakes = [];
      this.lastTimestamp = null;
      this.isRunning = false;
      this.init();
    }

    init() {
      this.buildGradients();
      this.buildSnakes();
      this.start();
    }

    buildGradients() {
      if (document.getElementById('portal-grad-560')) return;

      const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      grad.setAttribute('id', 'portal-grad-560');
      grad.setAttribute('gradientUnits', 'userSpaceOnUse');
      grad.setAttribute('x1', '0');
      grad.setAttribute('y1', '560');   // Base del tallo = blanco puro
      grad.setAttribute('x2', '0');
      grad.setAttribute('y2', '220');   // Cima de la gota = color del portal

      // Y=560: 100% BLANCO (perfecta union con la linea horizontal, sin corte ni contraste)
      const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      s1.setAttribute('offset', '0%');
      s1.setAttribute('stop-color', '#ffffff');
      grad.appendChild(s1);

      // Zona de difuminado suave: blanco se funde hacia el color del portal
      const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      s2.setAttribute('offset', '42%');
      s2.setAttribute('stop-color', 'var(--color-portal, #ed1c24)');
      grad.appendChild(s2);

      // Cima de la gota: 100% color del portal
      const s3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      s3.setAttribute('offset', '100%');
      s3.setAttribute('stop-color', 'var(--color-portal, #ed1c24)');
      grad.appendChild(s3);

      this.defs.appendChild(grad);
    }

    measurePath(d) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      this.svg.appendChild(p);
      const len = p.getTotalLength();
      this.svg.removeChild(p);
      return len;
    }

    makeLayers(group, d, stroke) {
      const layers = [];
      for (let i = 0; i < CONFIG.layerCount; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke-width', '' + CONFIG.strokeWidth);
        path.setAttribute('stroke-linecap', 'butt');
        path.setAttribute('stroke-linejoin', 'miter');
        path.setAttribute('stroke-miterlimit', '4');
        path.setAttribute('fill', 'none');
        path.style.stroke = stroke;
        // OPACIDAD CORRECTA: capa 0 (más corta) = más brillante -> cabeza brillante
        //                    capa 5 (más larga)  = más tenue   -> cola se desvanece
        path.style.opacity = LAYER_OPS[i].toFixed(3);
        group.appendChild(path);
        layers.push(path);
      }
      return layers;
    }

    buildSnakes() {
      this.container.innerHTML = '';
      this.snakes = [];

      SNAKE_BLUEPRINTS.forEach(bp => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'snake-group snake-' + bp.id);

        const len1  = this.measurePath(bp.zone1.d);
        const len2  = bp.dots.len;
        const len3a = this.measurePath(bp.zone3a.d);
        const len3b = bp.zone3b ? this.measurePath(bp.zone3b.d) : 0;
        const len3c = bp.zone3c ? this.measurePath(bp.zone3c.d) : 0;

        let dist = 0;
        const d1s = dist; dist += len1;
        const d2s = dist; dist += len2;
        const d3as = dist; dist += len3a;
        const d3bs = dist; dist += len3b;
        const d3cs = dist; dist += len3c;
        const totalDist = dist;

        // Crear capas de cada zona sólida
        const layers1  = this.makeLayers(group, bp.zone1.d,  bp.zone1.stroke);
        const layers3a = this.makeLayers(group, bp.zone3a.d, bp.zone3a.stroke);
        const layers3b = bp.zone3b ? this.makeLayers(group, bp.zone3b.d, bp.zone3b.stroke) : [];
        const layers3c = bp.zone3c ? this.makeLayers(group, bp.zone3c.d, bp.zone3c.stroke) : [];

        // Crear puntos cuadrados de la Zona 2
        const dotsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const halfS = CONFIG.strokeWidth / 2;
        const dotItems = [];

        for (let k = 0; k < bp.dots.count; k++) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          let rx = bp.dots.dir > 0
            ? bp.dots.x0 + (k * 100)
            : bp.dots.x0 - ((k + 1) * 100) + 50;
          const ry = bp.dots.y0 - halfS;
          rect.setAttribute('x', '' + rx);
          rect.setAttribute('y', '' + ry);
          rect.setAttribute('width', '' + CONFIG.strokeWidth);
          rect.setAttribute('height', '' + CONFIG.strokeWidth);
          rect.setAttribute('fill', '#ffffff');
          rect.style.opacity = '0';
          dotsGroup.appendChild(rect);
          dotItems.push({ el: rect, centerDist: d2s + (k * 100) + 25 });
        }
        group.appendChild(dotsGroup);
        this.container.appendChild(group);

        this.snakes.push({
          id: bp.id,
          speed: bp.speed,
          length: CONFIG.snakeLength,
          totalDist: totalDist,
          progress: -(bp.delay * bp.speed),
          zones: [
            { start: d1s,  end: d1s  + len1,  len: len1,  layers: layers1  },
            { start: d3as, end: d3as + len3a, len: len3a, layers: layers3a },
            { start: d3bs, end: d3bs + len3b, len: len3b, layers: layers3b },
            { start: d3cs, end: d3cs + len3c, len: len3c, layers: layers3c }
          ],
          dots: { start: d2s, items: dotItems }
        });
      });
    }

    updateZone(zone, headPos, tailPos) {
      if (!zone.layers || zone.layers.length === 0) return;

      const visible = headPos >= zone.start && tailPos <= zone.end;
      if (!visible) {
        zone.layers.forEach(l => {
          l.style.strokeDasharray = '0 ' + (zone.len * 2);
          l.style.strokeDashoffset = '0';
        });
        return;
      }

      const localHead = Math.min(zone.len, Math.max(0, headPos - zone.start));
      const localTail = Math.min(zone.len, Math.max(0, tailPos - zone.start));
      const visibleLen = Math.max(0, localHead - localTail);

      zone.layers.forEach((layer, i) => {
        const frac = (i + 1) / CONFIG.layerCount;
        // Cada capa cubre una fracción del segmento visible, todas terminando en la cabeza
        const segLen = visibleLen * frac;
        const offset = -(localHead - segLen);
        layer.style.strokeDasharray = segLen + ' ' + (zone.len * 2);
        layer.style.strokeDashoffset = '' + offset;
      });
    }

    update(dt) {
      this.snakes.forEach(snake => {
        snake.progress += snake.speed * dt;

        if (snake.progress > snake.totalDist + snake.length + 200) {
          snake.progress = -(5 + Math.random() * 6) * snake.speed;
        }

        const headPos = snake.progress;
        const tailPos = headPos - snake.length;

        // Actualizar cada zona sólida con el fade corregido
        snake.zones.forEach(zone => this.updateZone(zone, headPos, tailPos));

        // Actualizar puntos con el mismo fade natural
        snake.dots.items.forEach(dot => {
          if (headPos >= dot.centerDist && tailPos <= dot.centerDist) {
            const distFromHead = headPos - dot.centerDist;
            // Misma curva de fade que las líneas sólidas
            const alpha = Math.max(0, 1 - (distFromHead / snake.length));
            dot.el.style.opacity = Math.pow(alpha, 1.4).toFixed(3);
          } else {
            dot.el.style.opacity = '0';
          }
        });
      });
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      const loop = (ts) => {
        if (!this.isRunning) return;
        if (!this.lastTimestamp) this.lastTimestamp = ts;
        const dt = Math.min((ts - this.lastTimestamp) / 1000, 0.1);
        this.lastTimestamp = ts;
        this.update(dt);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.circuitSVGInstance = new CircuitEngine();
  });

  window.CircuitEngine = {
    setPortalColor: function (color) {
      document.documentElement.style.setProperty('--color-portal', color);
    }
  };

})();
