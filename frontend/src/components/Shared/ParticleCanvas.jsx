import React from 'react';

export default function ParticleCanvas() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const particles = [];

    function init() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const count = Math.floor((w * h) / 14000); // density-based
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: 1 + Math.random() * 1.6
        });
      }
    }

    function draw(t) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        init();
      }
      ctx.clearRect(0,0,w,h);
      // draw connections first (thin lines)
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx*dx + dy*dy;
          if (d2 < 120*120) {
            const alpha = Math.max(0, 0.25 - d2 / (120*120) * 0.25);
            const hue = 200 + 60 * Math.sin(t/3000 + (i*0.13));
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        const hue = 190 + 80 * Math.sin((t/2000) + p.x * 0.002 + p.y * 0.002);
        ctx.fillStyle = `hsla(${hue}, 90%, 70%, 0.9)`;
        ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.6)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // move
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
      }
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    const onResize = () => { init(); };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen block pointer-events-none z-particles"
      style={{ opacity: 0.9 }}
      aria-hidden
    />
  );
}

