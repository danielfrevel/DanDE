const CONFIG = {
  particleCount: 80,
  mobileParticleCount: 40,
  particleSize: 2,
  mobileParticleSize: 3,
  particleColor: '#6366f1',
  particleAlpha: 0.5,
  noiseScale: 0.005,
  noiseStrength: 0.3,
  timeIncrement: 0.001,
  mouseRadius: 120,
  mouseStrength: 3,
  maxSpeed: 2,
  trailFade: 0.15,
  particleMaxAge: 500,
  bgLight: 'rgba(255, 255, 255, 0.15)',
  bgDark: 'rgba(15, 23, 42, 0.15)'
};

let canvas, ctx, particles, noise;
let time = 0;
let mouseX = -9999, mouseY = -9999;
let lastTime = performance.now();
let isAnimating = false;
let animationFrameId = null;
let isMobile = false;

function setupCanvas() {
  canvas = document.createElement('canvas');
  canvas.id = 'flow-field-canvas';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';

  document.body.insertBefore(canvas, document.body.firstChild);

  ctx = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', handleResize);
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);
  createParticles();
}

function createParticle() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    age: Math.random() * CONFIG.particleMaxAge
  };
}

function createParticles() {
  particles = [];
  const count = isMobile ? CONFIG.mobileParticleCount : CONFIG.particleCount;

  for (let i = 0; i < count; i++) {
    particles.push(createParticle());
  }
}

function getFlowAngle(x, y, t) {
  const noiseValue = noise.simplex3(
    x * CONFIG.noiseScale,
    y * CONFIG.noiseScale,
    t
  );
  return noiseValue * Math.PI * 2;
}

function updateParticle(particle, deltaTime) {
  particle.age += deltaTime;

  if (particle.age > CONFIG.particleMaxAge) {
    const newP = createParticle();
    particle.x = newP.x;
    particle.y = newP.y;
    particle.vx = newP.vx;
    particle.vy = newP.vy;
    particle.age = 0;
    return;
  }

  const angle = getFlowAngle(particle.x, particle.y, time);
  const fx = Math.cos(angle) * CONFIG.noiseStrength;
  const fy = Math.sin(angle) * CONFIG.noiseStrength;

  particle.vx += fx * deltaTime;
  particle.vy += fy * deltaTime;

  const dx = particle.x - mouseX;
  const dy = particle.y - mouseY;
  const distSq = dx * dx + dy * dy;
  const radiusSq = CONFIG.mouseRadius * CONFIG.mouseRadius;

  if (distSq < radiusSq && distSq > 0) {
    const dist = Math.sqrt(distSq);
    const force = (1 - dist / CONFIG.mouseRadius) * CONFIG.mouseStrength;
    particle.vx += (dx / dist) * force * deltaTime;
    particle.vy += (dy / dist) * force * deltaTime;
  }

  const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
  if (speed > CONFIG.maxSpeed) {
    particle.vx = (particle.vx / speed) * CONFIG.maxSpeed;
    particle.vy = (particle.vy / speed) * CONFIG.maxSpeed;
  }

  particle.x += particle.vx * deltaTime;
  particle.y += particle.vy * deltaTime;

  if (particle.x < 0) particle.x = window.innerWidth;
  if (particle.x > window.innerWidth) particle.x = 0;
  if (particle.y < 0) particle.y = window.innerHeight;
  if (particle.y > window.innerHeight) particle.y = 0;

  const friction = Math.pow(0.98, deltaTime);
  particle.vx *= friction;
  particle.vy *= friction;
}

function drawParticle(particle) {
  ctx.fillStyle = CONFIG.particleColor;
  ctx.globalAlpha = CONFIG.particleAlpha;
  ctx.beginPath();
  const size = isMobile ? CONFIG.mobileParticleSize : CONFIG.particleSize;
  ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
  ctx.fill();
}

function isDarkMode() {
  return document.documentElement.classList.contains('dark') ||
         document.body.classList.contains('dark');
}

function animate() {
  if (!isAnimating) return;

  animationFrameId = requestAnimationFrame(animate);

  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 16.67;
  lastTime = currentTime;

  time += CONFIG.timeIncrement * deltaTime;

  ctx.globalAlpha = 1;
  ctx.fillStyle = isDarkMode() ? CONFIG.bgDark : CONFIG.bgLight;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = 0; i < particles.length; i++) {
    updateParticle(particles[i], deltaTime);
    drawParticle(particles[i]);
  }
}

function trackMouse() {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });
}

function startAnimation() {
  if (!isAnimating) {
    isAnimating = true;
    lastTime = performance.now();
    animate();
  }
}

function stopAnimation() {
  isAnimating = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopAnimation();
  } else {
    startAnimation();
  }
}

let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    resizeCanvas();
  }, 100);
}

function init() {
  if (typeof window.noise === 'undefined') {
    console.error('noise.js not loaded');
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (prefersReducedMotion.matches) {
    document.body.classList.add('static-background');
    return;
  }

  prefersReducedMotion.addEventListener('change', (e) => {
    if (e.matches) {
      stopAnimation();
      if (canvas) canvas.remove();
      document.body.classList.add('static-background');
    } else {
      document.body.classList.remove('static-background');
      setupCanvas();
      createParticles();
      startAnimation();
    }
  });

  isMobile = window.matchMedia('(pointer: coarse)').matches;

  noise = window.noise;
  noise.seed(Math.random());

  setupCanvas();
  createParticles();
  trackMouse();
  startAnimation();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
