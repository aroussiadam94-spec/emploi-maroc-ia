import { useAuth } from "@/_core/hooks/useAuth";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

const stats = [
  { value: "100+", label: "offres centralisées" },
  { value: "5", label: "sources d'emploi" },
  { value: "24/7", label: "assistant IA" },
];

const features = [
  {
    icon: Zap,
    title: "Matching IA avancé",
    text: "Votre profil, vos compétences et vos objectifs sont comparés aux offres pour prioriser les meilleures opportunités.",
  },
  {
    icon: Target,
    title: "Recherche multi-sources",
    text: "Emploi.ma, ReKrute, Anapec, Indeed et LinkedIn réunis dans une expérience claire et rapide.",
  },
  {
    icon: Bell,
    title: "Alertes intelligentes",
    text: "Des recommandations personnalisées pour rester proche des postes qui bougent vraiment au Maroc.",
  },
];

const steps = [
  { icon: UploadCloud, title: "Importez votre CV", text: "L'IA analyse la structure, les mots-clés et les points à renforcer." },
  { icon: Search, title: "Explorez les offres", text: "Filtrez par ville, contrat, secteur et niveau d'expérience." },
  { icon: CheckCircle2, title: "Postulez mieux", text: "Concentrez votre énergie sur les offres les plus alignées." },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const requireAuth = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="app-shell text-foreground">
      <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl transition-colors duration-300">
        <div className="container flex items-center justify-between py-4">
          <BrandLogo onClick={() => navigate("/")} />

          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <button onClick={() => navigate("/search")} className="transition-colors hover:text-foreground">
              Offres
            </button>
            <button onClick={() => requireAuth("/swipe")} className="transition-colors hover:text-foreground">
              Swipe IA
            </button>
            <button onClick={() => requireAuth("/cv/upload")} className="transition-colors hover:text-foreground">
              CV IA
            </button>
            <button onClick={() => requireAuth("/dashboard")} className="transition-colors hover:text-foreground">
              Tableau de bord
            </button>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline">Bonjour, {user?.name}</span>
                <Button onClick={() => navigate("/dashboard")}>Ouvrir</Button>
              </>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())}>Connexion</Button>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden">
          <div className="soft-grid pointer-events-none absolute inset-0" />
          <div className="container relative grid min-h-[calc(100vh-74px)] items-center gap-10 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
            <div className="animate-rise">
              <Badge className="mb-5 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50">
                <Sparkles className="h-3.5 w-3.5" />
                Plateforme emploi augmentée par IA
              </Badge>

              <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">
                Trouvez les offres qui correspondent vraiment à votre profil.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Emploi Maroc IA réunit les opportunités du marché marocain, analyse votre CV et vous aide à prioriser les postes avec un matching clair, rapide et professionnel.
              </p>

              <div className="glass-panel mt-8 max-w-3xl rounded-lg p-3">
                <div className="grid gap-3 md:grid-cols-[1fr_0.8fr_auto]">
                  <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 transition-all duration-300 focus-within:-translate-y-0.5 focus-within:border-primary focus-within:shadow-lg">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Poste, compétence, entreprise"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      onKeyDown={(e) => e.key === "Enter" && requireAuth("/search")}
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 transition-all duration-300 focus-within:-translate-y-0.5 focus-within:border-primary focus-within:shadow-lg">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <input type="text" placeholder="Ville" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                  </label>
                  <Button onClick={() => requireAuth("/search")} className="h-12 px-6">
                    Rechercher
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => requireAuth("/search")} className="h-12">
                  Commencer la recherche
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => requireAuth("/cv/upload")} className="h-12 bg-white/70">
                  Analyser mon CV
                </Button>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
                {stats.map((item) => (
                  <div key={item.label}>
                    <p className="text-2xl font-bold text-slate-950">{item.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-rise stagger-2">
              <div className="absolute -inset-4 rounded-lg bg-gradient-to-br from-blue-500/15 via-emerald-400/10 to-amber-300/10 blur-2xl" />
              <div className="glass-panel relative overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
                  alt="Professionnels collaborant dans un bureau moderne"
                  className="h-[320px] w-full object-cover transition-transform duration-700 hover:scale-105 md:h-[420px]"
                />
                <div className="grid gap-3 p-4 md:grid-cols-2">
                  <Card className="pro-card rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Score IA</p>
                        <p className="text-xs text-muted-foreground">92% de compatibilité</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="pro-card rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">CV prêt ATS</p>
                        <p className="text-xs text-muted-foreground">Conseils actionnables</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mb-10 max-w-2xl animate-rise">
              <Badge variant="secondary" className="mb-4">
                Une recherche plus nette
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Tout ce qu'il faut pour chercher sérieusement.</h2>
              <p className="mt-4 text-muted-foreground">
                Une interface calme, rapide et centrée sur les décisions importantes: où postuler, pourquoi, et comment améliorer vos chances.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className={`pro-card animate-rise rounded-lg p-6 stagger-${index + 1}`}>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.text}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200/70 bg-white/65 py-16 md:py-20">
          <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Badge className="mb-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Processus</Badge>
              <h2 className="text-3xl font-bold tracking-tight">Passez du CV à l'entretien avec moins de friction.</h2>
              <p className="mt-4 text-muted-foreground">
                La plateforme garde le parcours simple: améliorer votre profil, repérer les bonnes offres et avancer avec confiance.
              </p>
            </div>
            <div className="grid gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="pro-card flex items-start gap-4 rounded-lg p-5 animate-rise" style={{ animationDelay: `${index * 120}ms` }}>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <div className="overflow-hidden rounded-lg bg-slate-950 text-white shadow-2xl shadow-slate-950/20">
              <div className="grid items-center gap-8 p-8 md:grid-cols-[1fr_auto] md:p-10">
                <div>
                  <Badge className="mb-4 border-white/20 bg-white/10 text-white hover:bg-white/10">Prêt à démarrer ?</Badge>
                  <h2 className="text-3xl font-bold tracking-tight">Construisez une recherche d'emploi plus intelligente.</h2>
                  <p className="mt-3 max-w-2xl text-white/70">
                    Lancez la recherche, analysez votre CV et gardez vos opportunités organisées dans un tableau de bord moderne.
                  </p>
                </div>
                <Button onClick={() => requireAuth("/search")} size="lg" className="h-12 bg-white text-slate-950 hover:bg-white/90">
                  Voir les offres
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/70 py-8 transition-colors duration-300">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <BrandLogo compact />
          <p>© 2026 Emploi Maroc IA. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
