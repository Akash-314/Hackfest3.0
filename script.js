// ==========================================================================
// Hackfest3.0 — Interactive Particle Canvas & Card Parallax
// ==========================================================================

(function () {
  'use strict';

  // --- Background Particle Network ---
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  });

  const mouse = {
    x: width / 2,
    y: height / 2,
    active: false,
    radius: 140
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 12000), 85);
  let particles = [];

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? 0 : width);
      this.y = initial ? Math.random() * height : Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.65;
      this.vy = (Math.random() - 0.5) * 0.65;
      this.radius = Math.random() * 1.8 + 0.8;
      this.alpha = Math.random() * 0.45 + 0.2;
      this.hue = Math.random() > 0.35 ? 185 : 275; // Cyan or violet
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse proximity interaction
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 90%, 65%, ${this.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, 0.8)`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((width * height) / 13000), 80);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  initParticles();

  function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.shadowBlur = 0;

    const maxDist = 120;
    const count = particles.length;

    // Draw connecting lines
    for (let i = 0; i < count; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < count; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const lineAlpha = (1 - dist / maxDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  // --- 3D Card Subtle Tilt on Mouse Move ---
  const cardWrapper = document.getElementById('card-wrapper');
  const card = cardWrapper ? cardWrapper.querySelector('.glass-card') : null;

  if (cardWrapper && card) {
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;

    window.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = (e.clientX - centerX) / (window.innerWidth / 2);
      const normY = (e.clientY - centerY) / (window.innerHeight / 2);

      targetRotateY = normX * 6; // Max 6 deg
      targetRotateX = -normY * 6;
    });

    function updateTilt() {
      currentRotateX += (targetRotateX - currentRotateX) * 0.08;
      currentRotateY += (targetRotateY - currentRotateY) * 0.08;

      card.style.transform = `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;
      requestAnimationFrame(updateTilt);
    }

    updateTilt();
  }

})();
