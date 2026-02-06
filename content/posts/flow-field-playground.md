---
title: "Flow Fields: An Interactive Playground"
date: 2026-02-05
description: "The particle animation that used to be this blog's background — now interactive with tweakable parameters."
tags: ["creative-coding", "javascript", "canvas"]
---

This was originally the background animation for this blog. I liked it too much to just delete it, so here it is as an interactive playground. Drag sliders to change the behavior in real time.

<div style="position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 0.75rem; overflow: hidden; background: #1e293b;">
  <canvas id="flow-canvas" style="display: block; width: 100%; height: 100%;"></canvas>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; font-size: 0.875rem;">
  <label style="display: flex; flex-direction: column; gap: 0.25rem;">
    Particle Count: <span id="val-particles">80</span>
    <input type="range" id="ctrl-particles" min="10" max="300" value="80" step="1">
  </label>
  <label style="display: flex; flex-direction: column; gap: 0.25rem;">
    Noise Scale: <span id="val-noise-scale">0.005</span>
    <input type="range" id="ctrl-noise-scale" min="0.001" max="0.02" value="0.005" step="0.001">
  </label>
  <label style="display: flex; flex-direction: column; gap: 0.25rem;">
    Noise Strength: <span id="val-noise-strength">0.3</span>
    <input type="range" id="ctrl-noise-strength" min="0.1" max="1.0" value="0.3" step="0.05">
  </label>
  <label style="display: flex; flex-direction: column; gap: 0.25rem;">
    Speed: <span id="val-speed">2.0</span>
    <input type="range" id="ctrl-speed" min="0.5" max="4.0" value="2.0" step="0.1">
  </label>
  <label style="display: flex; flex-direction: column; gap: 0.25rem;">
    Mouse Radius: <span id="val-mouse-radius">120</span>
    <input type="range" id="ctrl-mouse-radius" min="50" max="300" value="120" step="10">
  </label>
  <label style="display: flex; flex-direction: column; gap: 0.25rem;">
    <span>&nbsp;</span>
    <button id="ctrl-reset" style="padding: 0.375rem 1rem; border-radius: 0.375rem; background: #f59e0b; color: #1e293b; font-weight: 600; cursor: pointer; border: none;">Reset</button>
  </label>
</div>

<script src="/js/perlin.js"></script>

<script>
(function() {
  const canvas = document.getElementById('flow-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const defaults = {
    particleCount: 80,
    noiseScale: 0.005,
    noiseStrength: 0.3,
    maxSpeed: 2.0,
    mouseRadius: 120
  };

  const config = { ...defaults };

  let particles = [];
  let time = 0;
  let mouseX = -9999, mouseY = -9999;
  let lastTime = performance.now();
  let running = false;
  let rafId = null;
  let noiseGen = null;

  function resize() {
    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    initParticles();
  }

  function initParticles() {
    const rect = canvas.parentElement.getBoundingClientRect();
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        age: Math.random() * 500
      });
    }
  }

  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  function animate() {
    if (!running) return;
    rafId = requestAnimationFrame(animate);

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 16.67, 3);
    lastTime = now;
    time += 0.001 * dt;

    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.globalAlpha = 1;
    ctx.fillStyle = isDark() ? 'rgba(15, 23, 42, 0.15)' : 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 0, w, h);

    const particleColor = isDark() ? '#f59e0b' : '#6366f1';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.age += dt;

      if (p.age > 500) {
        p.x = Math.random() * w;
        p.y = Math.random() * h;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = (Math.random() - 0.5) * 0.5;
        p.age = 0;
        continue;
      }

      const angle = noiseGen.simplex3(p.x * config.noiseScale, p.y * config.noiseScale, time) * Math.PI * 2;
      p.vx += Math.cos(angle) * config.noiseStrength * dt;
      p.vy += Math.sin(angle) * config.noiseStrength * dt;

      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const distSq = dx * dx + dy * dy;
      const rSq = config.mouseRadius * config.mouseRadius;
      if (distSq < rSq && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / config.mouseRadius) * 3;
        p.vx += (dx / dist) * force * dt;
        p.vy += (dy / dist) * force * dt;
      }

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > config.maxSpeed) {
        p.vx = (p.vx / speed) * config.maxSpeed;
        p.vy = (p.vy / speed) * config.maxSpeed;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      const friction = Math.pow(0.98, dt);
      p.vx *= friction;
      p.vy *= friction;

      ctx.fillStyle = particleColor;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function start() {
    if (!running) {
      running = true;
      lastTime = performance.now();
      animate();
    }
  }

  function stop() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Slider bindings
  const sliders = [
    { id: 'ctrl-particles', val: 'val-particles', key: 'particleCount', parse: v => parseInt(v), onChange: initParticles },
    { id: 'ctrl-noise-scale', val: 'val-noise-scale', key: 'noiseScale', parse: v => parseFloat(v) },
    { id: 'ctrl-noise-strength', val: 'val-noise-strength', key: 'noiseStrength', parse: v => parseFloat(v) },
    { id: 'ctrl-speed', val: 'val-speed', key: 'maxSpeed', parse: v => parseFloat(v) },
    { id: 'ctrl-mouse-radius', val: 'val-mouse-radius', key: 'mouseRadius', parse: v => parseInt(v) }
  ];

  sliders.forEach(s => {
    const input = document.getElementById(s.id);
    const display = document.getElementById(s.val);
    if (!input || !display) return;
    input.addEventListener('input', () => {
      const v = s.parse(input.value);
      config[s.key] = v;
      display.textContent = input.value;
      if (s.onChange) s.onChange();
    });
  });

  const resetBtn = document.getElementById('ctrl-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      Object.assign(config, defaults);
      sliders.forEach(s => {
        const input = document.getElementById(s.id);
        const display = document.getElementById(s.val);
        if (!input || !display) return;
        input.value = defaults[s.key];
        display.textContent = defaults[s.key];
      });
      initParticles();
    });
  }

  // Mouse tracking relative to canvas
  canvas.style.pointerEvents = 'auto';
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  // Touch support
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
  }, { passive: false });
  canvas.addEventListener('touchend', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  // Pause when not visible
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) start();
      else stop();
    });
  }, { threshold: 0.1 });
  observer.observe(canvas);

  // Dark mode changes
  const htmlEl = document.documentElement;
  const darkObserver = new MutationObserver(() => {
    // colors update automatically via isDark() in the render loop
  });
  darkObserver.observe(htmlEl, { attributes: true, attributeFilter: ['class'] });

  // Init
  function init() {
    if (typeof window.noise === 'undefined') {
      console.error('perlin.js not loaded');
      return;
    }
    noiseGen = window.noise;
    noiseGen.seed(Math.random());
    resize();
    window.addEventListener('resize', () => {
      clearTimeout(init._resizeTimer);
      init._resizeTimer = setTimeout(resize, 100);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>

## How It Works

Flow fields use **simplex noise** to generate a smooth vector field across 2D space. Each point in the field has a direction, and particles follow that direction as they move.

The basic loop:
1. Sample noise at each particle's position to get an angle
2. Apply the angle as a force to the particle's velocity
3. Add mouse repulsion when the cursor is nearby
4. Move the particle, wrap around edges
5. Fade the background slightly each frame to create trails

The noise field evolves slowly over time (the third dimension of `simplex3`), so the flow pattern shifts gradually even without interaction.
