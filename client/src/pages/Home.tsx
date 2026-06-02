import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import BrandLogo from "@/components/BrandLogo";
import {
  ArrowRight, Search, MapPin, Briefcase, Code2, TrendingUp, Megaphone,
  Settings, Heart, BookOpen, Star, ChevronDown, Twitter, Linkedin,
  Instagram, Facebook, Zap, CheckCircle, Upload, Play,
} from "lucide-react";

/* ── Types ── */
declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

/* ── Data ── */
const CATEGORIES = [
  { icon: Code2,       label: "Technologie & IT",  count: "1,240+", color: "#7BA7BC" },
  { icon: TrendingUp,  label: "Finance & Banque",  count: "820+",   color: "#C9A84C" },
  { icon: Megaphone,   label: "Marketing",          count: "650+",   color: "#E07A5F" },
  { icon: Settings,    label: "Ingénierie",         count: "930+",   color: "#A78BFA" },
  { icon: Heart,       label: "Santé",              count: "470+",   color: "#34D399" },
  { icon: BookOpen,    label: "Éducation",          count: "380+",   color: "#F59E0B" },
];

const STATS = [
  { value: 12000, suffix: "+", label: "Offres d'emploi" },
  { value: 3400,  suffix: "+", label: "Entreprises partenaires" },
  { value: 89000, suffix: "+", label: "Candidats inscrits" },
];

const FEATURED_JOBS = [
  {
    title: "Développeur Full Stack React/Node",
    company: "OCP Group",
    location: "Casablanca",
    salary: "18 000 – 28 000 MAD",
    tag: "CDI",
    tagColor: "#34D399",
    initial: "O",
    color: "#1a4a3a",
  },
  {
    title: "Responsable Marketing Digital",
    company: "Marjane Holding",
    location: "Rabat",
    salary: "14 000 – 20 000 MAD",
    tag: "CDI",
    tagColor: "#C9A84C",
    initial: "M",
    color: "#4a3a1a",
  },
  {
    title: "Ingénieur Génie Civil",
    company: "CIH Bank",
    location: "Marrakech",
    salary: "16 000 – 24 000 MAD",
    tag: "CDD",
    tagColor: "#7BA7BC",
    initial: "C",
    color: "#1a2e4a",
  },
];

const STEPS = [
  {
    step: "01",
    icon: Upload,
    title: "Importez votre CV",
    text: "Notre IA analyse votre profil, extrait vos compétences et identifie vos points forts en quelques secondes.",
  },
  {
    step: "02",
    icon: Search,
    title: "Explorez les offres",
    text: "Accédez à des milliers d'offres agrégées depuis les meilleures plateformes marocaines, filtrées pour vous.",
  },
  {
    step: "03",
    icon: Zap,
    title: "Postulez avec l'IA",
    text: "Recevez un score de compatibilité et des conseils pour maximiser vos chances à chaque candidature.",
  },
];

const PLACEHOLDERS = [
  "Développeur React à Casablanca...",
  "Responsable RH à Rabat...",
  "Ingénieur en Finance à Marrakech...",
  "Chef de projet IT à Tanger...",
  "Consultant en stratégie à Agadir...",
];

/* ── Hooks ── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((el) => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
}

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const GOLD = "201,168,76";
    const TERRA = "224,122,95";

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(70, Math.floor(window.innerWidth / 20));
    const particles: {
      x: number; y: number; vx: number; vy: number;
      r: number; color: string; opacity: number;
    }[] = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2 + 0.5,
      color: Math.random() > 0.65 ? TERRA : GOLD,
      opacity: Math.random() * 0.5 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${particles[i].color},${(1 - dist / 140) * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

function useAnimatedCounter(target: number, active: boolean, duration = 2000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setValue(Math.floor(start));
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, active, duration]);
  return value;
}

function useMagneticButton(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const onLeave = () => { el.style.transform = "translate(0,0)"; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref]);
}

function useCursor() {
  useEffect(() => {
    const cursor = document.getElementById("custom-cursor");
    if (!cursor) return;

    const move = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      cursor.classList.add("visible");
    };

    const enter = () => cursor.classList.add("hovering");
    const leave = () => cursor.classList.remove("hovering");

    window.addEventListener("mousemove", move);
    document.querySelectorAll("a, button, [role=button]").forEach((el) => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });
    return () => window.removeEventListener("mousemove", move);
  }, []);
}

function usePlaceholderCycle() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % PLACEHOLDERS.length), 2800);
    return () => clearInterval(id);
  }, []);
  return PLACEHOLDERS[idx];
}

function useHeroParallax(heroRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      const inner = el.querySelector<HTMLElement>(".hero-parallax-inner");
      if (inner) inner.style.transform = `translateY(${y * 0.35}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [heroRef]);
}

/* ── Sub-components ── */
function StatItem({ stat, active }: { stat: typeof STATS[0]; active: boolean }) {
  const val = useAnimatedCounter(stat.value, active);
  return (
    <div className="text-center reveal" style={{ transitionDelay: "100ms" }}>
      <p className="counter-value text-4xl md:text-5xl">
        {val.toLocaleString("fr-FR")}{stat.suffix}
      </p>
      <p className="mt-2 text-sm font-medium uppercase tracking-widest text-[#8B7D6B]">
        {stat.label}
      </p>
    </div>
  );
}

function CategoryCard({ cat, delay }: { cat: typeof CATEGORIES[0]; delay: number }) {
  const Icon = cat.icon;
  return (
    <div
      className="reveal group cursor-pointer"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:border-opacity-50"
        style={{
          borderColor: `${cat.color}22`,
          background: `rgba(14,16,32,0.75)`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            `0 20px 60px ${cat.color}25, inset 0 1px 0 ${cat.color}18`;
          (e.currentTarget as HTMLDivElement).style.borderColor = `${cat.color}44`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "";
          (e.currentTarget as HTMLDivElement).style.borderColor = `${cat.color}22`;
        }}
      >
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: `${cat.color}18`, color: cat.color }}
        >
          <Icon size={22} />
        </div>
        <p
          className="text-base font-semibold text-[#F0EDE6]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {cat.label}
        </p>
        <p className="mt-1 text-xs font-medium" style={{ color: cat.color }}>
          {cat.count} offres
        </p>
      </div>
    </div>
  );
}

function JobCard({ job, delay }: { job: typeof FEATURED_JOBS[0]; delay: number }) {
  return (
    <div className="reveal group" style={{ transitionDelay: `${delay}ms` }}>
      <div className="pro-card cursor-pointer rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
            style={{ background: job.color, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {job.initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-semibold leading-snug text-[#F0EDE6] transition-colors group-hover:text-[#C9A84C]"
               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {job.title}
            </p>
            <p className="mt-1 text-sm text-[#8B7D6B]">{job.company}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1 rounded-full bg-[#1E2338] px-3 py-1 text-[#8B7D6B]">
            <MapPin size={11} /> {job.location}
          </span>
          <span className="rounded-full bg-[#1E2338] px-3 py-1 text-[#8B7D6B]">
            {job.salary}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: `${job.tagColor}18`, color: job.tagColor }}
          >
            {job.tag}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-[#C9A84C] transition-all group-hover:gap-2">
            Voir l'offre <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const heroRef = useRef<HTMLDivElement>(null!);
  const ctaRef1 = useRef<HTMLButtonElement>(null!);
  const ctaRef2 = useRef<HTMLButtonElement>(null!);
  const [statsVisible, setStatsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const placeholder = usePlaceholderCycle();
  const statsRef = useRef<HTMLDivElement>(null!);
  const [searchVal, setSearchVal] = useState("");

  const requireAuth = useCallback(
    (path: string) => {
      if (isAuthenticated) navigate(path);
      else window.location.href = getLoginUrl();
    },
    [isAuthenticated, navigate]
  );

  /* Hooks */
  useScrollReveal();
  useParticles(canvasRef);
  useHeroParallax(heroRef);
  useCursor();
  useMagneticButton(ctaRef1);
  useMagneticButton(ctaRef2);

  /* Stats counter trigger */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.4 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  /* GSAP hero headline letter animation */
  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap) return;
    const chars = document.querySelectorAll(".hero-char");
    if (!chars.length) return;
    gsap.fromTo(
      chars,
      { opacity: 0, y: 60, rotateX: -40 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.028,
        duration: 0.9,
        ease: "back.out(1.4)",
        delay: 0.3,
      }
    );
  }, []);

  /* Hero subtitle / badge animation */
  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap) return;
    gsap.fromTo(
      ".hero-sub",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.14, duration: 0.85, ease: "power3.out", delay: 1.1 }
    );
  }, []);

  const headline = "Trouvez Votre Prochaine Opportunité au Maroc";

  return (
    <div className="app-shell" style={{ background: "#07090F" }}>
      {/* ── Custom Cursor ── */}
      <div id="custom-cursor" />

      {/* ── Particle Canvas ── */}
      <canvas ref={canvasRef} id="particle-canvas" aria-hidden="true" />

      {/* ═══════════════════════════ NAV ═══════════════════════════ */}
      <nav className="nav-glass sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <BrandLogo onClick={() => navigate("/")} />

          {/* Desktop nav */}
          <div className="hidden items-center gap-7 text-sm font-medium md:flex">
            {[
              { label: "Offres",          action: () => navigate("/search") },
              { label: "Swipe IA",        action: () => requireAuth("/swipe") },
              { label: "Analyser mon CV", action: () => requireAuth("/cv/upload") },
              { label: "Tableau de bord", action: () => requireAuth("/dashboard") },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className="text-[#8B7D6B] transition-colors hover:text-[#C9A84C]"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-[#8B7D6B] sm:inline">
                  Bonjour, <span className="text-[#C9A84C]">{user?.name?.split(" ")[0]}</span>
                </span>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn-gold rounded-lg px-5 py-2.5 text-sm"
                >
                  Ouvrir
                </button>
              </>
            ) : (
              <button
                onClick={() => (window.location.href = getLoginUrl())}
                className="btn-gold rounded-lg px-5 py-2.5 text-sm"
              >
                Connexion
              </button>
            )}
            {/* Mobile burger */}
            <button
              className="flex flex-col gap-1.5 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-0.5 w-5 rounded bg-[#C9A84C] transition-all"
                />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-[#C9A84C]/10 bg-[#0C0E18] px-6 pb-4 md:hidden">
            {[
              { label: "Offres",          action: () => navigate("/search") },
              { label: "Swipe IA",        action: () => requireAuth("/swipe") },
              { label: "Analyser mon CV", action: () => requireAuth("/cv/upload") },
              { label: "Tableau de bord", action: () => requireAuth("/dashboard") },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={() => { action(); setMenuOpen(false); }}
                className="block w-full py-3 text-left text-sm text-[#8B7D6B] hover:text-[#C9A84C]"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main>
        {/* ═══════════════════════════ HERO ═══════════════════════════ */}
        <section
          ref={heroRef}
          className="relative flex min-h-screen items-center overflow-hidden"
          aria-label="Section principale"
        >
          {/* Video background — direct Pexels MP4, always available */}
          <div className="hero-parallax-inner absolute inset-0 z-0 overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-110 object-cover"
              style={{ pointerEvents: "none" }}
              aria-hidden="true"
            >
              {/* Office professionals — Pexels free video */}
              <source
                src="https://videos.pexels.com/video-files/3252136/3252136-hd_1920_1080_30fps.mp4"
                type="video/mp4"
              />
              {/* Fallback: modern Casablanca city timelapse */}
              <source
                src="https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4"
                type="video/mp4"
              />
            </video>
          </div>

          {/* Overlay */}
          <div className="hero-overlay absolute inset-0 z-10" />

          {/* Moroccan pattern overlay */}
          <div className="moroccan-pattern z-10" style={{ opacity: 0.04 }} />

          {/* Content */}
          <div className="container relative z-20 pb-24 pt-32 md:pb-32 md:pt-40">
            <div className="max-w-5xl">
              {/* Badge */}
              <div className="hero-sub mb-6 opacity-0">
                <span className="badge-gold">
                  <Star size={11} />
                  Plateforme N°1 Emploi au Maroc
                </span>
              </div>

              {/* Animated Headline */}
              <h1
                className="mb-8 text-5xl font-black leading-[1.08] tracking-tight md:text-7xl lg:text-[5.5rem]"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  perspective: "800px",
                }}
                aria-label={headline}
              >
                {headline.split("").map((char, i) => (
                  <span
                    key={i}
                    className="hero-char inline-block"
                    style={{
                      opacity: 0,
                      color: char === " " ? "transparent" : "#F0EDE6",
                      display: char === " " ? "inline" : "inline-block",
                      whiteSpace: char === " " ? "pre" : undefined,
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h1>

              {/* Subtitle */}
              <p
                className="hero-sub mb-10 max-w-2xl text-lg leading-relaxed text-[#A89880] opacity-0 md:text-xl"
              >
                Des milliers d'opportunités au Maroc, analysées par IA. Matching intelligent,
                conseils CV personnalisés et alertes en temps réel.
              </p>

              {/* Search bar */}
              <div
                className="hero-sub mb-8 opacity-0"
              >
                <div
                  className="glass-panel flex max-w-3xl flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center"
                >
                  <label className="flex flex-1 items-center gap-3 rounded-xl border border-[#C9A84C]/15 bg-[#0C0E18]/80 px-4 py-3.5 focus-within:border-[#C9A84C]/40 transition-colors">
                    <Search size={18} className="shrink-0 text-[#C9A84C]" />
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-transparent text-sm text-[#F0EDE6] outline-none placeholder:text-[#8B7D6B]/60"
                      onKeyDown={(e) => e.key === "Enter" && requireAuth("/search")}
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-[#C9A84C]/15 bg-[#0C0E18]/80 px-4 py-3.5 focus-within:border-[#C9A84C]/40 transition-colors sm:w-44">
                    <MapPin size={16} className="shrink-0 text-[#E07A5F]" />
                    <input
                      type="text"
                      placeholder="Ville"
                      className="w-full bg-transparent text-sm text-[#F0EDE6] outline-none placeholder:text-[#8B7D6B]/60"
                    />
                  </label>
                  <button
                    ref={ctaRef1}
                    onClick={() => requireAuth("/search")}
                    className="btn-gold rounded-xl px-7 py-3.5 text-sm"
                    style={{ transition: "transform 200ms ease, box-shadow 200ms ease, background-position 400ms ease" }}
                  >
                    Rechercher
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* CTA row */}
              <div className="hero-sub flex flex-wrap gap-4 opacity-0">
                <button
                  ref={ctaRef2}
                  onClick={() => requireAuth("/search")}
                  className="btn-gold rounded-xl px-7 py-3.5 text-base"
                  style={{ transition: "transform 200ms ease, box-shadow 200ms ease, background-position 400ms ease" }}
                >
                  Commencer ma recherche
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => requireAuth("/cv/upload")}
                  className="btn-outline-gold rounded-xl px-7 py-3.5 text-base"
                >
                  Analyser mon CV
                </button>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 animate-bounce opacity-50">
            <ChevronDown size={24} className="text-[#C9A84C]" />
          </div>
        </section>

        {/* ═══════════════════════ STATS BAR ═══════════════════════ */}
        <section
          ref={statsRef}
          aria-label="Statistiques"
          style={{ background: "rgba(10,11,18,0.95)", borderTop: "1px solid rgba(201,168,76,0.12)", borderBottom: "1px solid rgba(201,168,76,0.12)" }}
        >
          <div className="container py-14">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {STATS.map((s) => (
                <StatItem key={s.label} stat={s} active={statsVisible} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════ CATEGORIES ═══════════════════════ */}
        <section className="py-24 md:py-32" aria-label="Catégories d'emploi">
          <div className="container">
            <div className="mb-14 text-center">
              <div className="reveal mb-5 flex justify-center">
                <span className="badge-gold">
                  <Briefcase size={11} />
                  Explorez par secteur
                </span>
              </div>
              <h2 className="reveal text-4xl font-black text-[#F0EDE6] md:text-5xl" style={{ transitionDelay: "100ms" }}>
                Tous les secteurs du marché
              </h2>
              <p className="reveal mx-auto mt-4 max-w-xl text-[#8B7D6B]" style={{ transitionDelay: "200ms" }}>
                De la tech à la santé — trouvez le domaine qui correspond à votre ambition.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((cat, i) => (
                <CategoryCard key={cat.label} cat={cat} delay={i * 80} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ FEATURED JOBS ═══════════════════════ */}
        <section
          className="py-24 md:py-32"
          aria-label="Offres vedettes"
          style={{ background: "rgba(10,11,18,0.7)" }}
        >
          <div className="container">
            <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="reveal mb-5">
                  <span className="badge-terracotta">
                    <Star size={11} />
                    Offres en vedette
                  </span>
                </div>
                <h2 className="reveal text-4xl font-black text-[#F0EDE6] md:text-5xl" style={{ transitionDelay: "100ms" }}>
                  Opportunités du moment
                </h2>
              </div>
              <button
                onClick={() => requireAuth("/search")}
                className="reveal btn-outline-gold self-start rounded-xl px-5 py-2.5 text-sm sm:self-auto"
                style={{ transitionDelay: "200ms" }}
              >
                Voir toutes les offres <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {FEATURED_JOBS.map((job, i) => (
                <JobCard key={job.title} job={job} delay={i * 100} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ HOW IT WORKS ═══════════════════════ */}
        <section className="py-24 md:py-32" aria-label="Comment ça marche">
          <div className="container">
            <div className="mb-16 text-center">
              <div className="reveal mb-5 flex justify-center">
                <span className="badge-gold">
                  <CheckCircle size={11} />
                  Simple & Rapide
                </span>
              </div>
              <h2 className="reveal text-4xl font-black text-[#F0EDE6] md:text-5xl" style={{ transitionDelay: "100ms" }}>
                Comment ça marche
              </h2>
              <p className="reveal mx-auto mt-4 max-w-lg text-[#8B7D6B]" style={{ transitionDelay: "200ms" }}>
                En 3 étapes simples, accédez aux meilleures opportunités du Maroc.
              </p>
            </div>

            <div className="relative grid gap-8 md:grid-cols-3">
              {/* Connecting line */}
              <div
                className="absolute left-1/2 top-10 hidden h-0.5 w-2/3 -translate-x-1/2 md:block"
                style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }}
              />

              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.step}
                    className="reveal relative"
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    <div className="glass-panel rounded-2xl p-8 text-center">
                      {/* Step number */}
                      <div
                        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                        style={{
                          background: "rgba(201,168,76,0.10)",
                          border: "1px solid rgba(201,168,76,0.25)",
                          boxShadow: "0 0 30px rgba(201,168,76,0.12)",
                        }}
                      >
                        <Icon size={26} className="text-[#C9A84C]" />
                      </div>
                      <span
                        className="mb-2 block text-xs font-black tracking-[0.2em] uppercase text-[#C9A84C]"
                      >
                        Étape {step.step}
                      </span>
                      <h3
                        className="mb-3 text-xl font-bold text-[#F0EDE6]"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[#8B7D6B]">{step.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════ CTA SECTION ═══════════════════════ */}
        <section className="py-24 md:py-32" aria-label="Appel à l'action">
          <div className="container">
            <div
              className="cta-bg reveal relative overflow-hidden rounded-3xl px-8 py-16 text-center md:px-16 md:py-24"
              style={{
                border: "1px solid rgba(201,168,76,0.20)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.10)",
              }}
            >
              {/* Decorative orbs */}
              <div
                className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full opacity-20 blur-3xl"
                style={{ background: "#C9A84C" }}
              />
              <div
                className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full opacity-15 blur-3xl"
                style={{ background: "#E07A5F" }}
              />

              <div className="relative z-10">
                <span className="badge-gold mb-6 inline-flex">
                  <Play size={11} />
                  Prêt à démarrer ?
                </span>
                <h2
                  className="mb-5 text-4xl font-black text-[#F0EDE6] md:text-6xl"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Construisez une carrière{" "}
                  <span className="text-gold-gradient">
                    brillante au Maroc
                  </span>
                </h2>
                <p className="mx-auto mb-10 max-w-xl text-lg text-[#A89880]">
                  Rejoignez 89 000+ candidats qui font confiance à Emploi Maroc
                  pour trouver leur prochaine opportunité.
                </p>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => requireAuth("/search")}
                    className="btn-gold rounded-xl px-9 py-4 text-base"
                  >
                    Voir les offres <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => requireAuth("/cv/upload")}
                    className="btn-outline-gold rounded-xl px-9 py-4 text-base"
                  >
                    Analyser mon CV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════ FOOTER ═══════════════════════════ */}
      <footer
        style={{
          background: "#07090F",
          borderTop: "1px solid rgba(201,168,76,0.12)",
        }}
      >
        <div className="container py-14">
          <div className="mb-12 flex flex-col gap-10 md:flex-row md:justify-between">
            {/* Brand */}
            <div className="max-w-xs">
              <BrandLogo />
              <p className="mt-4 text-sm leading-relaxed text-[#8B7D6B]">
                La plateforme d'emploi premium du Maroc, propulsée par l'intelligence artificielle.
              </p>
              {/* Social icons */}
              <div className="mt-5 flex gap-3">
                {[Linkedin, Twitter, Instagram, Facebook].map((Icon, i) => (
                  <button
                    key={i}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C9A84C]/15 text-[#8B7D6B] transition-all hover:border-[#C9A84C]/40 hover:text-[#C9A84C]"
                    aria-label={["LinkedIn", "Twitter", "Instagram", "Facebook"][i]}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              {[
                {
                  title: "Candidats",
                  links: ["Rechercher une offre", "Swipe IA", "Analyser mon CV", "Tableau de bord"],
                },
                {
                  title: "Entreprises",
                  links: ["Publier une offre", "Trouver des talents", "Solutions RH", "Contact"],
                },
                {
                  title: "Villes",
                  links: ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir"],
                },
              ].map((col) => (
                <div key={col.title}>
                  <p className="mb-4 text-xs font-black uppercase tracking-[0.15em] text-[#C9A84C]">
                    {col.title}
                  </p>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button className="text-sm text-[#8B7D6B] transition-colors hover:text-[#F0EDE6]">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="divider-gold mb-7" />

          <div className="flex flex-col items-center justify-between gap-4 text-xs text-[#8B7D6B] sm:flex-row">
            <p>© 2026 Emploi Maroc. Tous droits réservés.</p>
            <div className="flex gap-6">
              <button className="hover:text-[#C9A84C] transition-colors">Confidentialité</button>
              <button className="hover:text-[#C9A84C] transition-colors">Conditions</button>
              <button className="hover:text-[#C9A84C] transition-colors">Cookies</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
