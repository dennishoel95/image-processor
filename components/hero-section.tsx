"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

interface CursorMote {
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * 8,
    drift: (Math.random() - 0.5) * 60,
    opacity: Math.random() * 0.4 + 0.1,
  }));
}

export function HeroSection({ onScrollToTool }: { onScrollToTool: () => void }) {
  const particlesRef = useRef<Particle[]>(generateParticles(24));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<CursorMote[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastEmitRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    particlesRef.current = generateParticles(24);
  }, []);

  const spawnMotes = useCallback((x: number, y: number) => {
    const now = performance.now();
    if (now - lastEmitRef.current < 30) return;
    lastEmitRef.current = now;

    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.8 + 0.3;
      const maxLife = Math.random() * 60 + 40;
      motesRef.current.push({
        x,
        y,
        size: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.3,
        life: 0,
        maxLife,
      });
    }

    // Cap at 80 motes
    if (motesRef.current.length > 80) {
      motesRef.current = motesRef.current.slice(-80);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = section.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        spawnMotes(x, y);
      }
    };

    section.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      const rect = section.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const motes = motesRef.current;
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.life++;
        m.x += m.vx;
        m.y += m.vy;
        m.vx *= 0.98;
        m.vy *= 0.98;

        const progress = m.life / m.maxLife;
        // Fade in quickly, fade out slowly
        const alpha = progress < 0.15
          ? (progress / 0.15) * m.opacity
          : m.opacity * (1 - (progress - 0.15) / 0.85);

        if (m.life >= m.maxLife || alpha <= 0) {
          motes.splice(i, 1);
          continue;
        }

        const shrink = 1 - progress * 0.5;

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * shrink, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(197, 163, 100, ${alpha})`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      section.removeEventListener("mousemove", handleMouseMove);
    };
  }, [spawnMotes]);

  const particles = particlesRef.current;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-deep"
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(197,163,100,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(148,145,139,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Floating particles (CSS) */}
      <div className="particle-field">
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: `rgba(197, 163, 100, ${p.opacity})`,
              animation: `${i % 2 === 0 ? "float-up" : "float-drift"} ${p.duration}s ${p.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Cursor motes (canvas) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-[5]"
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <p
          className="animate-fade-up text-fog tracking-[0.3em] uppercase text-xs font-body font-medium mb-8"
          style={{ animationDelay: "0.1s" }}
        >
          AI-Powered Image Processing
        </p>

        {/* H1 */}
        <h1
          className="animate-fade-up font-display font-light text-cream leading-[1.1] mb-6"
          style={{
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            animationDelay: "0.25s",
          }}
        >
          Transform your images
          <br />
          <span className="text-warm italic">with intelligence</span>
        </h1>

        {/* Preamble */}
        <p
          className="animate-fade-up text-fog text-lg leading-relaxed max-w-xl mx-auto mb-12 font-light"
          style={{ animationDelay: "0.45s" }}
        >
          Generate SEO-optimized filenames, alt text, titles, and rich metadata
          for your entire image library — powered by Claude vision AI.
        </p>

        {/* Shimmer divider */}
        <div
          className="animate-fade-up shimmer-line max-w-xs mx-auto mb-12"
          style={{ animationDelay: "0.6s" }}
        />

        {/* Feature cards */}
        <div
          className="animate-fade-up grid grid-cols-1 md:grid-cols-3 gap-px mb-14"
          style={{ animationDelay: "0.7s" }}
        >
          {[
            {
              title: "Upload",
              desc: "Drop up to 10 images at once. Supports JPEG, PNG, GIF, and WebP formats.",
            },
            {
              title: "Analyze",
              desc: "AI vision examines each image and generates descriptive names, alt text, and keywords.",
            },
            {
              title: "Export",
              desc: "Download a ZIP with renamed files and companion metadata markdown files.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="px-6 py-5 text-left border-l border-elevated first:border-l-0 md:first:border-l-0"
            >
              <h3 className="text-warm-dim tracking-[0.2em] uppercase text-[11px] font-body font-semibold mb-2">
                {card.title}
              </h3>
              <p className="text-fog text-sm leading-relaxed font-light">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="animate-fade-up" style={{ animationDelay: "0.85s" }}>
          <button
            onClick={onScrollToTool}
            className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-warm/40 text-cream font-body font-medium text-sm tracking-wide transition-all duration-300 hover:bg-warm/10 hover:border-warm/70 hover:shadow-[0_0_30px_rgba(197,163,100,0.12)]"
          >
            Start Processing
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-deep to-transparent pointer-events-none" />
    </section>
  );
}
