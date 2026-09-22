import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface SignalPulse {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  color: string;
}

export const MovingNeuralNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color palette inspired directly by MediFlow AI neural synaptic image:
    // Cyan electric circuits + Pink/Magenta brain synapses + Soft Emerald bio-signals
    const nodePalette = [
      { color: 'rgba(56, 189, 248, ', glow: '#38bdf8' }, // Cyan
      { color: 'rgba(14, 165, 233, ', glow: '#0ea5e9' }, // Deep Blue-Cyan
      { color: 'rgba(236, 72, 153, ', glow: '#ec4899' }, // Neural Magenta
      { color: 'rgba(244, 114, 182, ', glow: '#f472b6' }, // Soft Pink Synapse
      { color: 'rgba(52, 211, 153, ', glow: '#34d399' }  // Bio-Emerald
    ];

    // Responsive node count: 50-70 on desktop, 30 on mobile
    const nodeCount = Math.min(Math.floor((width * height) / 18000), 65);
    const maxConnectionDistance = 160;

    const particles: Particle[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const pTheme = nodePalette[Math.floor(Math.random() * nodePalette.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        radius: Math.random() * 2.2 + 1.8,
        color: pTheme.color,
        glowColor: pTheme.glow,
        baseAlpha: Math.random() * 0.4 + 0.6,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.015
      });
    }

    // Moving signal pulses travelling across synaptic connections
    const signalPulses: SignalPulse[] = [];
    const maxPulses = 16;

    // Mouse tracking for interactive neural reactivity
    const mouse = {
      x: -9999,
      y: -9999,
      radius: 170
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('resize', handleResize);

    // Central Cybernetic Brain Hologram Pulse
    let centralPulseRadius = 0;
    let centralPulseAlpha = 0.5;

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Expanding Central Cybernetic Neural Wave (matches AI Robot Brain Center)
      centralPulseRadius += 0.8;
      centralPulseAlpha -= 0.0025;
      if (centralPulseRadius > Math.min(width, height) * 0.55 || centralPulseAlpha <= 0) {
        centralPulseRadius = 40;
        centralPulseAlpha = 0.45;
      }
      ctx.save();
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.42, centralPulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${centralPulseAlpha * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 12]);
      ctx.stroke();
      ctx.restore();

      // 2. Update & Draw Particles (Synaptic Nodes)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off screen boundaries gently
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }

        // Mouse avoidance/attraction
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < mouse.radius) {
          const force = (mouse.radius - distMouse) / mouse.radius;
          p.x += (dxMouse / distMouse) * force * 1.5;
          p.y += (dyMouse / distMouse) * force * 1.5;
        }

        // Pulse size & glow
        p.pulsePhase += p.pulseSpeed;
        const currentAlpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.25;

        // Draw particle node
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.2, currentAlpha)})`;
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();

        // 3. Connect neighboring nodes (Synaptic Axons)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectionDistance) {
            const lineAlpha = (1 - dist / maxConnectionDistance) * 0.55;

            // Gradient line matching node colors
            const grad = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
            grad.addColorStop(0, `${p.color}${lineAlpha})`);
            grad.addColorStop(1, `${p2.color}${lineAlpha})`);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = Math.max(0.8, 1.8 * (1 - dist / maxConnectionDistance));
            ctx.stroke();
            ctx.restore();

            // Randomly spawn traveling signal pulse on close links
            if (signalPulses.length < maxPulses && Math.random() < 0.003) {
              signalPulses.push({
                fromNode: i,
                toNode: j,
                progress: 0,
                speed: Math.random() * 0.02 + 0.012,
                color: Math.random() > 0.4 ? '#38bdf8' : '#ec4899'
              });
            }
          }
        }

        // Connect node to mouse if nearby
        if (distMouse < mouse.radius) {
          const mouseLineAlpha = (1 - distMouse / mouse.radius) * 0.7;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${mouseLineAlpha})`;
          ctx.lineWidth = 1.4;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 4. Update & Draw Moving Signal Pulses (Traveling action potentials)
      for (let k = signalPulses.length - 1; k >= 0; k--) {
        const pulse = signalPulses[k];
        const n1 = particles[pulse.fromNode];
        const n2 = particles[pulse.toNode];

        if (!n1 || !n2) {
          signalPulses.splice(k, 1);
          continue;
        }

        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          signalPulses.splice(k, 1);
          continue;
        }

        const pulseX = n1.x + (n2.x - n1.x) * pulse.progress;
        const pulseY = n1.y + (n2.y - n1.y) * pulse.progress;

        ctx.save();
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color;
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 12;
        ctx.fill();

        // Trail effect
        ctx.beginPath();
        const trailX = n1.x + (n2.x - n1.x) * Math.max(0, pulse.progress - 0.08);
        const trailY = n1.y + (n2.y - n1.y) * Math.max(0, pulse.progress - 0.08);
        ctx.moveTo(pulseX, pulseY);
        ctx.lineTo(trailX, trailY);
        ctx.strokeStyle = pulse.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.92
      }}
    />
  );
};
