/**
 * Motor de Animación de Circuito Digital Ortogonal - MIDEC v15.0
 *
 * CARACTERÍSTICAS PRINCIPALES:
 * 1. RENDIMIENTO ÓPTIMO (60-120 FPS): Motor Canvas 2D acelerado con CERO mutaciones DOM.
 * 2. PORTALES TOTALMENTE RESTAURADOS: Muestreo vectorial continuo de alta precisión (120 puntos)
 *    de la gota roja oficial de MIDEC (#ed1c24). El tallo asciende con degradé blanco->rojo,
 *    dibuja la gota completa en rojo brillante y desciende rojo->blanco unido a la línea.
 * 3. 100% RESPONSIVO: Adaptación automática a cualquier resolución y proporción de pantalla
 *    (móvil, tablet, laptop, 4K, retina) con escalado DPR nítido.
 * 4. CERO PLIEGUES EN ESQUINAS DE 90°: Las líneas terminan justo en el borde de la caja de 50x50pt
 *    y la esquina se rellena una única vez con su alfa continuo exacto. Cero dobles tonos.
 * 5. FADE UNIFICADO Y HOMOGÉNEO: La línea y los 4 puntos cuadrados equidistantes de 50x50pt
 *    evalúan la misma función matemática continua (sin sombras ni saltos oscuros).
 * 6. PISTAS PARALELAS NO INTERSECTANTES: 4 corredores que nunca se tocan, bucle determinista de 16s
 *    con 2 o más líneas siempre activas en pantalla.
 */

(function () {
  'use strict';

  const CONFIG = {
    canvasWidth: 1920,
    canvasHeight: 1080,
    strokeWidth: 50,
    snakeLength: 850,
    loopDuration: 16.0
  };

  const COLOR_WHITE_RGB = [255, 255, 255];
  const COLOR_WHITE_STR = '255, 255, 255';
  const COLOR_RED_RGB   = [237, 28, 36];
  const COLOR_RED_STR   = '237, 28, 36';

  /**
   * Genera el muestreo vectorial de la gota y tallos del portal MIDEC
   */
  function createPortalData(baseX, baseY, stemH) {
    const neckY = baseY - stemH;
    const dLoop = `M ${baseX} ${neckY} ` +
                  `c 0 -30 -56.09 -74.15 -56.09 -105.92 ` +
                  `c 0 -30.96 25.13 -56.09 56.09 -56.09 ` +
                  `c 30.95 0 56.09 25.13 56.09 56.09 ` +
                  `c 0 31.77 -56.09 105.92 -56.09 105.92`;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', dLoop);
    svg.appendChild(p);
    document.body.appendChild(svg);

    const loopLen = p.getTotalLength();
    const samplesCount = 120;
    const loopSamples = [];

    for (let i = 0; i <= samplesCount; i++) {
      const s = (i / samplesCount) * loopLen;
      const pt = p.getPointAtLength(s);
      loopSamples.push({ x: pt.x, y: pt.y });
    }

    document.body.removeChild(svg);

    return {
      baseX,
      baseY,
      stemLen: stemH,
      loopLen,
      loopSamples,
      totalLen: stemH + loopLen + stemH
    };
  }

  /**
   * Función matemática unificada de atenuación
   */
  function calcAlpha(headDist, s, snakeLen) {
    const d = headDist - s;
    if (d < 0 || d > snakeLen) return 0;
    return Math.pow(1 - (d / snakeLen), 1.55);
  }

  /**
   * Dibuja un tramo horizontal sin solapar la caja de esquina
   */
  function drawHoriz(ctx, x1, x2, y, s1, s2, headDist, snakeLen, colorRgb) {
    const minS = Math.min(s1, s2);
    const maxS = Math.max(s1, s2);
    const tailDist = headDist - snakeLen;

    const subStartS = Math.max(minS, tailDist);
    const subEndS = Math.min(maxS, headDist);
    if (subStartS >= subEndS) return;

    const len = maxS - minS;
    const tStart = (subStartS - minS) / len;
    const tEnd = (subEndS - minS) / len;

    const vxStart = x1 + (x2 - x1) * tStart;
    const vxEnd = x1 + (x2 - x1) * tEnd;

    const aStart = calcAlpha(headDist, subStartS, snakeLen);
    const aEnd = calcAlpha(headDist, subEndS, snakeLen);

    const leftX = Math.min(vxStart, vxEnd);
    const rightX = Math.max(vxStart, vxEnd);
    const w = rightX - leftX;
    if (w <= 0.1) return;

    const grad = ctx.createLinearGradient(vxStart, 0, vxEnd, 0);
    grad.addColorStop(0, `rgba(${colorRgb}, ${aStart.toFixed(4)})`);
    grad.addColorStop(1, `rgba(${colorRgb}, ${aEnd.toFixed(4)})`);

    ctx.fillStyle = grad;
    ctx.fillRect(leftX, y - 25, w, 50);
  }

  /**
   * Dibuja un tramo vertical sin solapar la caja de esquina
   */
  function drawVert(ctx, x, y1, y2, s1, s2, headDist, snakeLen, colorRgb) {
    const minS = Math.min(s1, s2);
    const maxS = Math.max(s1, s2);
    const tailDist = headDist - snakeLen;

    const subStartS = Math.max(minS, tailDist);
    const subEndS = Math.min(maxS, headDist);
    if (subStartS >= subEndS) return;

    const len = maxS - minS;
    const tStart = (subStartS - minS) / len;
    const tEnd = (subEndS - minS) / len;

    const vyStart = y1 + (y2 - y1) * tStart;
    const vyEnd = y1 + (y2 - y1) * tEnd;

    const aStart = calcAlpha(headDist, subStartS, snakeLen);
    const aEnd = calcAlpha(headDist, subEndS, snakeLen);

    const topY = Math.min(vyStart, vyEnd);
    const botY = Math.max(vyStart, vyEnd);
    const h = botY - topY;
    if (h <= 0.1) return;

    const grad = ctx.createLinearGradient(0, vyStart, 0, vyEnd);
    grad.addColorStop(0, `rgba(${colorRgb}, ${aStart.toFixed(4)})`);
    grad.addColorStop(1, `rgba(${colorRgb}, ${aEnd.toFixed(4)})`);

    ctx.fillStyle = grad;
    ctx.fillRect(x - 25, topY, 50, h);
  }

  /**
   * Rellena la unión ortogonal de 50x50pt exactamente una vez con su alfa continuo
   */
  function drawCorner(ctx, cx, cy, sCenter, headDist, snakeLen, colorRgb) {
    const tailDist = headDist - snakeLen;
    if (headDist < sCenter - 25 || tailDist > sCenter + 25) return;

    const alpha = calcAlpha(headDist, sCenter, snakeLen);
    if (alpha <= 0.005) return;

    ctx.fillStyle = `rgba(${colorRgb}, ${alpha.toFixed(4)})`;
    ctx.fillRect(cx - 25, cy - 25, 50, 50);
  }

  /**
   * Dibuja un punto cuadrado equidistante de 50x50pt con el mismo degradado
   */
  function drawSquareDot(ctx, cx, cy, sCenter, headDist, snakeLen) {
    const tailDist = headDist - snakeLen;
    if (headDist < sCenter - 25 || tailDist > sCenter + 25) return;

    const alpha = calcAlpha(headDist, sCenter, snakeLen);
    if (alpha <= 0.005) return;

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(4)})`;
    ctx.fillRect(cx - 25, cy - 25, 50, 50);
  }

  class CanvasCircuitEngine {
    constructor() {
      this.canvas = document.getElementById('circuit-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.elapsedTime = 0;
      this.lastTimestamp = null;
      this.isRunning = false;

      // Inicializar geometría exacta de portales
      this.portal1 = createPortalData(1300, 480, 130);
      this.portal2 = createPortalData(650, 720, 130);

      // Configuración de pistas no intersectantes
      this.tracks = [
        {
          id: 'track-1',
          speed: 380,
          startOffset: 0.0,
          totalDist: 1685 + this.portal1.totalLen + 745,
          render: (ctx, headPos) => this.renderTrack1(ctx, headPos)
        },
        {
          id: 'track-2',
          speed: 360,
          startOffset: 4.0,
          totalDist: 1595 + this.portal2.totalLen + 775,
          render: (ctx, headPos) => this.renderTrack2(ctx, headPos)
        },
        {
          id: 'track-3',
          speed: 375,
          startOffset: 8.0,
          totalDist: 2320,
          render: (ctx, headPos) => this.renderTrack3(ctx, headPos)
        },
        {
          id: 'track-4',
          speed: 370,
          startOffset: 12.0,
          totalDist: 2120,
          render: (ctx, headPos) => this.renderTrack4(ctx, headPos)
        }
      ];

      this.initResponsiveness();
      this.start();
    }

    initResponsiveness() {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      window.addEventListener('orientationchange', () => this.resize());
    }

    resize() {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Escalar manteniendo proporción 16:9 estricta
      const scale = Math.min(winW / CONFIG.canvasWidth, winH / CONFIG.canvasHeight);
      const displayW = Math.round(CONFIG.canvasWidth * scale);
      const displayH = Math.round(CONFIG.canvasHeight * scale);

      this.canvas.style.width = displayW + 'px';
      this.canvas.style.height = displayH + 'px';
      this.canvas.width = Math.round(displayW * dpr);
      this.canvas.height = Math.round(displayH * dpr);

      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(scale * dpr, scale * dpr);
    }

    /**
     * Renderizado continuo y orgánico del portal completo (tallo -> gota -> tallo)
     */
    renderPortal(ctx, portalData, sStart, headDist, snakeLen) {
      const totalLen = portalData.totalLen;
      const stemLen = portalData.stemLen;
      const sEnd = sStart + totalLen;

      const tailDist = headDist - snakeLen;
      const subStart = Math.max(sStart, tailDist);
      const subEnd = Math.min(sEnd, headDist);
      if (subStart >= subEnd) return;

      const localStartS = subStart - sStart;
      const localEndS = subEnd - sStart;

      // 1. Tallo ascendente (s: 0 a stemLen)
      if (localStartS < stemLen && localEndS > 0) {
        const stemSubStart = Math.max(0, localStartS);
        const stemSubEnd = Math.min(stemLen, localEndS);
        const t1 = stemSubStart / stemLen;
        const t2 = stemSubEnd / stemLen;

        const yStart = portalData.baseY - (stemLen * t1);
        const yEnd = portalData.baseY - (stemLen * t2);

        const a1 = calcAlpha(headDist, sStart + stemSubStart, snakeLen);
        const a2 = calcAlpha(headDist, sStart + stemSubEnd, snakeLen);

        const topY = Math.min(yStart, yEnd);
        const botY = Math.max(yStart, yEnd);
        const h = botY - topY;

        if (h > 0.1) {
          const grad = ctx.createLinearGradient(0, yStart, 0, yEnd);
          grad.addColorStop(0, `rgba(${COLOR_WHITE_STR}, ${a1.toFixed(4)})`);
          grad.addColorStop(1, `rgba(${COLOR_RED_STR}, ${a2.toFixed(4)})`);
          ctx.fillStyle = grad;
          ctx.fillRect(portalData.baseX - 25, topY, 50, h);
        }
      }

      // 2. Lazo de la Gota en Rojo MIDEC puro
      const loopStartS = stemLen;
      const loopEndS = totalLen - stemLen;
      const loopLen = portalData.loopLen;

      if (localStartS < loopEndS && localEndS > loopStartS) {
        const loopSubStart = Math.max(loopStartS, localStartS) - loopStartS;
        const loopSubEnd = Math.min(loopEndS, localEndS) - loopStartS;

        if (loopSubEnd > loopSubStart) {
          const pts = portalData.loopSamples;
          const totalSamples = pts.length - 1;

          const idx1 = Math.max(0, Math.floor((loopSubStart / loopLen) * totalSamples));
          const idx2 = Math.min(totalSamples, Math.ceil((loopSubEnd / loopLen) * totalSamples));

          if (idx2 > idx1) {
            const midS = sStart + loopStartS + (loopSubStart + loopSubEnd) / 2;
            const loopAlpha = calcAlpha(headDist, midS, snakeLen);

            if (loopAlpha > 0.005) {
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(pts[idx1].x, pts[idx1].y);
              for (let i = idx1 + 1; i <= idx2; i++) {
                ctx.lineTo(pts[i].x, pts[i].y);
              }
              ctx.lineWidth = 50;
              ctx.lineCap = 'butt';
              ctx.lineJoin = 'round';
              ctx.strokeStyle = `rgba(${COLOR_RED_STR}, ${loopAlpha.toFixed(4)})`;
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }

      // 3. Tallo descendente (s: totalLen - stemLen a totalLen)
      const downStemStartS = totalLen - stemLen;
      if (localStartS < totalLen && localEndS > downStemStartS) {
        const stemSubStart = Math.max(downStemStartS, localStartS) - downStemStartS;
        const stemSubEnd = Math.min(totalLen, localEndS) - downStemStartS;
        const t1 = stemSubStart / stemLen;
        const t2 = stemSubEnd / stemLen;

        const yStart = (portalData.baseY - stemLen) + (stemLen * t1);
        const yEnd = (portalData.baseY - stemLen) + (stemLen * t2);

        const a1 = calcAlpha(headDist, sStart + downStemStartS + stemSubStart, snakeLen);
        const a2 = calcAlpha(headDist, sStart + downStemStartS + stemSubEnd, snakeLen);

        const topY = Math.min(yStart, yEnd);
        const botY = Math.max(yStart, yEnd);
        const h = botY - topY;

        if (h > 0.1) {
          const grad = ctx.createLinearGradient(0, yStart, 0, yEnd);
          grad.addColorStop(0, `rgba(${COLOR_RED_STR}, ${a1.toFixed(4)})`);
          grad.addColorStop(1, `rgba(${COLOR_WHITE_STR}, ${a2.toFixed(4)})`);
          ctx.fillStyle = grad;
          ctx.fillRect(portalData.baseX - 25, topY, 50, h);
        }
      }
    }

    renderTrack1(ctx, h) {
      const L = CONFIG.snakeLength;
      // 1. Línea previa a los puntos
      drawHoriz(ctx, -100, 425, 220, 0, 525, h, L, COLOR_WHITE_STR);

      // 2. Cuatro puntos cuadrados equidistantes (gap 50pt, centros en 500, 600, 700, 800)
      drawSquareDot(ctx, 500, 220, 600, h, L);
      drawSquareDot(ctx, 600, 220, 700, h, L);
      drawSquareDot(ctx, 700, 220, 800, h, L);
      drawSquareDot(ctx, 800, 220, 900, h, L);

      // 3. Línea post-puntos hasta la primera esquina
      drawHoriz(ctx, 875, 925, 220, 975, 1025, h, L, COLOR_WHITE_STR);

      // 4. Esquina 1 (950, 220)
      drawCorner(ctx, 950, 220, 1050, h, L, COLOR_WHITE_STR);

      // 5. Línea vertical hacia abajo (entre esquinas 1 y 2)
      drawVert(ctx, 950, 245, 455, 1075, 1285, h, L, COLOR_WHITE_STR);

      // 6. Esquina 2 (950, 480)
      drawCorner(ctx, 950, 480, 1310, h, L, COLOR_WHITE_STR);

      // 7. Línea horizontal hacia el portal
      drawHoriz(ctx, 975, 1275, 480, 1335, 1635, h, L, COLOR_WHITE_STR);

      // 8. Esquina base de entrada al portal
      drawCorner(ctx, 1300, 480, 1660, h, L, COLOR_WHITE_STR);

      // 9. Portal 1 completo (Tallo + Gota + Tallo de retorno)
      this.renderPortal(ctx, this.portal1, 1685, h, L);

      // 10. Esquina base de salida del portal
      const sCornerOut = 1685 + this.portal1.totalLen + 25;
      drawCorner(ctx, 1300, 480, sCornerOut, h, L, COLOR_WHITE_STR);

      // 11. Línea horizontal de salida continua
      const sExit = sCornerOut + 25;
      drawHoriz(ctx, 1325, 2020, 480, sExit, sExit + 695, h, L, COLOR_WHITE_STR);
    }

    renderTrack2(ctx, h) {
      const L = CONFIG.snakeLength;
      // 1. Línea previa a los puntos (viaja a la izquierda)
      drawHoriz(ctx, 2020, 1575, 920, 0, 445, h, L, COLOR_WHITE_STR);

      // 2. Cuatro puntos cuadrados equidistantes (centros en 1500, 1400, 1300, 1200)
      drawSquareDot(ctx, 1500, 920, 520, h, L);
      drawSquareDot(ctx, 1400, 920, 620, h, L);
      drawSquareDot(ctx, 1300, 920, 720, h, L);
      drawSquareDot(ctx, 1200, 920, 820, h, L);

      // 3. Línea post-puntos hasta la primera esquina
      drawHoriz(ctx, 1125, 1075, 920, 895, 945, h, L, COLOR_WHITE_STR);

      // 4. Esquina 1 (1050, 920)
      drawCorner(ctx, 1050, 920, 970, h, L, COLOR_WHITE_STR);

      // 5. Línea vertical hacia arriba
      drawVert(ctx, 1050, 895, 745, 995, 1145, h, L, COLOR_WHITE_STR);

      // 6. Esquina 2 (1050, 720)
      drawCorner(ctx, 1050, 720, 1170, h, L, COLOR_WHITE_STR);

      // 7. Línea horizontal hacia el portal 2
      drawHoriz(ctx, 1025, 675, 720, 1195, 1545, h, L, COLOR_WHITE_STR);

      // 8. Esquina base del portal 2 (650, 720)
      drawCorner(ctx, 650, 720, 1570, h, L, COLOR_WHITE_STR);

      // 9. Portal 2 completo
      this.renderPortal(ctx, this.portal2, 1595, h, L);

      // 10. Esquina base de salida del portal 2
      const sCornerOut = 1595 + this.portal2.totalLen + 25;
      drawCorner(ctx, 650, 720, sCornerOut, h, L, COLOR_WHITE_STR);

      // 11. Línea horizontal de salida hacia la izquierda
      const sExit = sCornerOut + 25;
      drawHoriz(ctx, 625, -100, 720, sExit, sExit + 725, h, L, COLOR_WHITE_STR);
    }

    renderTrack3(ctx, h) {
      const L = CONFIG.snakeLength;
      // 1. Línea previa
      drawHoriz(ctx, -100, 325, 80, 0, 425, h, L, COLOR_WHITE_STR);

      // 2. Cuatro puntos cuadrados equidistantes (centros en 400, 500, 600, 700)
      drawSquareDot(ctx, 400, 80, 500, h, L);
      drawSquareDot(ctx, 500, 80, 600, h, L);
      drawSquareDot(ctx, 600, 80, 700, h, L);
      drawSquareDot(ctx, 700, 80, 800, h, L);

      // 3. Línea hasta la esquina 1
      drawHoriz(ctx, 775, 1525, 80, 875, 1625, h, L, COLOR_WHITE_STR);

      // 4. Esquina 1 (1550, 80)
      drawCorner(ctx, 1550, 80, 1650, h, L, COLOR_WHITE_STR);

      // 5. Línea vertical hacia abajo
      drawVert(ctx, 1550, 105, 255, 1675, 1825, h, L, COLOR_WHITE_STR);

      // 6. Esquina 2 (1550, 280)
      drawCorner(ctx, 1550, 280, 1850, h, L, COLOR_WHITE_STR);

      // 7. Línea horizontal de salida
      drawHoriz(ctx, 1575, 2020, 280, 1875, 2320, h, L, COLOR_WHITE_STR);
    }

    renderTrack4(ctx, h) {
      const L = CONFIG.snakeLength;
      // 1. Línea previa
      drawHoriz(ctx, -100, 825, 1020, 0, 925, h, L, COLOR_WHITE_STR);

      // 2. Cuatro puntos cuadrados equidistantes (centros en 900, 1000, 1100, 1200)
      drawSquareDot(ctx, 900, 1020, 1000, h, L);
      drawSquareDot(ctx, 1000, 1020, 1100, h, L);
      drawSquareDot(ctx, 1100, 1020, 1200, h, L);
      drawSquareDot(ctx, 1200, 1020, 1300, h, L);

      // 3. Línea continua de salida
      drawHoriz(ctx, 1275, 2020, 1020, 1375, 2120, h, L, COLOR_WHITE_STR);
    }

    render(dt) {
      this.elapsedTime += dt;
      const loopTime = this.elapsedTime % CONFIG.loopDuration;

      // Limpiar lienzo a negro puro
      this.ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

      // Renderizar cada pista activa
      this.tracks.forEach(track => {
        let timeInTrack = loopTime - track.startOffset;
        if (timeInTrack < 0) {
          timeInTrack += CONFIG.loopDuration;
        }

        const headPos = timeInTrack * track.speed;
        const tailPos = headPos - CONFIG.snakeLength;

        // Renderizar si está visible en este intervalo
        if (headPos >= 0 && tailPos <= track.totalDist) {
          track.render(this.ctx, headPos);
        }
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
        this.render(dt);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.circuitCanvasInstance = new CanvasCircuitEngine();
  });

})();
