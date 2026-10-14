import { useEffect, useRef } from 'react';

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  life: number;
  maxLife: number;
  phase: number;
  spark: boolean;
  px: number;
  py: number;
}

/** Glowing embers drifting up from below, plus the occasional fast spark with a short trail. */
export function Embers() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext('2d')!;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let embers: Ember[] = [];
    let frame = 0;

    const spawn = (spark: boolean, anywhere = false): Ember => {
      const x = Math.random() * width;
      const y = anywhere ? Math.random() * height : height + 10;
      const maxLife = spark ? 50 + Math.random() * 40 : 260 + Math.random() * 380;
      return {
        x,
        y,
        px: x,
        py: y,
        vx: spark ? (Math.random() - 0.5) * 5 : (Math.random() - 0.5) * 0.3,
        vy: spark ? -(5 + Math.random() * 6) : -(0.35 + Math.random() * 1.1),
        size: spark ? 1 + Math.random() : 0.6 + Math.random() * 2,
        hue: 4 + Math.random() * 30, // chili red to ember orange
        life: anywhere ? Math.random() * maxLife : 0,
        maxLife,
        phase: Math.random() * Math.PI * 2,
        spark,
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      el.width = width * dpr;
      el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(150, Math.round((width * height) / 11000));
      embers = Array.from({ length: target }, () => spawn(false, true));
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      const t = time / 1000;

      if (!reduceMotion && Math.random() < 0.035) embers.push(spawn(true));

      embers = embers.filter((e) => {
        e.life += 1;
        if (e.life > e.maxLife || e.y < -20) {
          if (!e.spark) Object.assign(e, spawn(false));
          else return false;
        }
        e.px = e.x;
        e.py = e.y;
        if (e.spark) {
          e.vy += 0.08; // sparks arc back under gravity
          e.vx *= 0.99;
        } else {
          e.vx += Math.sin(t * 0.8 + e.phase) * 0.006; // drift in the heat
        }
        e.x += e.vx;
        e.y += e.vy;

        const fade = Math.sin((e.life / e.maxLife) * Math.PI);
        const flicker = e.spark ? 1 : 0.65 + 0.35 * Math.sin(t * 9 + e.phase * 5);
        const alpha = Math.max(0, fade * flicker);
        const light = e.spark ? 66 : 50 + e.size * 4;

        if (e.spark) {
          ctx.strokeStyle = `hsla(${e.hue + 15}, 100%, ${light}%, ${alpha})`;
          ctx.lineWidth = e.size;
          ctx.beginPath();
          ctx.moveTo(e.px - e.vx * 2, e.py - e.vy * 2);
          ctx.lineTo(e.x, e.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = `hsla(${e.hue - 4}, 100%, 45%, ${alpha * 0.16})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size * 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `hsla(${e.hue + 12}, 100%, ${light + 6}%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
          ctx.fill();
        }
        return true;
      });

      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 -z-10 size-full" />;
}
