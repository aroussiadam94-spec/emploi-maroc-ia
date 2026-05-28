import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Briefcase,
  CheckCircle2,
  FileText,
  Heart,
  LogOut,
  Pencil,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { useLocation } from "wouter";

const tabClass =
  "relative rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 text-sm font-semibold text-muted-foreground shadow-none transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none";

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const { data: profile } = trpc.candidate.getProfile.useQuery();
  const { data: savedJobs = [] } = trpc.jobs.getSavedJobs.useQuery(undefined, { enabled: isAuthenticated });
  const { data: applications = [] } = trpc.jobs.getApplications.useQuery(undefined, { enabled: isAuthenticated });
  const { data: alerts = [], refetch: refetchAlerts } = trpc.jobs.getAlerts.useQuery(undefined, { enabled: isAuthenticated });
  const deleteAlertMutation = trpc.jobs.deleteAlert.useMutation({ onSuccess: () => refetchAlerts() });
  const logoutMutation = trpc.auth.logout.useMutation();

  const completion = profile?.cvFileName ? 65 : 35;
  const profileItems = [
    { label: "Nom", value: user?.name || "Non défini" },
    { label: "Email", value: user?.email || "Non défini" },
    { label: "Téléphone", value: profile?.phone || "Non défini" },
    { label: "Localisation", value: profile?.location || "Non défini" },
  ];

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    await logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center p-4">
        <Card className="glass-panel max-w-md rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold">Connexion requise</h2>
          <p className="mt-3 text-muted-foreground">Veuillez vous connecter pour accéder à votre tableau de bord.</p>
          <Button onClick={() => (window.location.href = getLoginUrl())} className="mt-6 w-full">
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen">
      <header className="border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="container py-6">
          <div className="mb-7 flex items-center justify-between gap-4">
            <BrandLogo onClick={() => navigate("/")} />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button onClick={handleLogout} variant="ghost" className="gap-2">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_minmax(300px,420px)] lg:items-end">
            <div>
              <Badge className="mb-3 bg-blue-50 text-blue-700 hover:bg-blue-50">Espace candidat</Badge>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">Tableau de bord</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
                Bienvenue, {user?.name}. Gardez votre recherche organisée et prête à avancer.
              </p>
            </div>

            <button
              onClick={() => navigate("/search")}
              className="group flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-4 text-left text-sm text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_4px_20px_rgba(0,168,255,0.15)]"
            >
              <Search className="h-4 w-4 text-primary" />
              <span className="min-w-0 flex-1 truncate">Rechercher une offre, une compétence, une ville...</span>
              <span className="hidden rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition-transform group-hover:translate-x-0.5 sm:inline">
                Ouvrir
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard icon={Briefcase} label="Candidatures" value={applications.length.toString()} tone="blue" />
          <StatCard icon={Heart} label="Offres sauvegardées" value={savedJobs.length.toString()} tone="rose" />
          <StatCard icon={Bell} label="Alertes actives" value={alerts.length.toString()} tone="emerald" />
          <ProgressStatCard label="Profil complété" value={completion} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid h-auto w-full grid-cols-2 justify-start gap-0 rounded-none border-b border-slate-200 bg-transparent p-0 md:inline-grid md:w-auto md:grid-cols-4">
            <TabsTrigger value="profile" className={tabClass}>Profil</TabsTrigger>
            <TabsTrigger value="applications" className={tabClass}>Candidatures</TabsTrigger>
            <TabsTrigger value="saved" className={tabClass}>Sauvegardées</TabsTrigger>
            <TabsTrigger value="alerts" className={tabClass}>Alertes</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="pro-card rounded-xl p-7">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Informations personnelles</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Les détails utilisés pour personnaliser votre recherche.</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate("/profile/edit")} variant="outline" size="icon" className="rounded-xl bg-white/70">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                  {profileItems.map((item) => (
                    <div key={item.label} className="border-b border-slate-200/70 pb-4 last:border-b md:last:border-b">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-base font-semibold text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </div>

                <Button onClick={() => navigate("/profile/edit")} className="mt-8 shadow-[0_4px_20px_rgba(0,168,255,0.15)]">
                  Modifier le profil
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>

              <Card className="pro-card rounded-xl p-7">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Curriculum Vitae</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Votre CV et son analyse IA.</p>
                  </div>
                </div>

                {profile?.cvFileName ? (
                  <div className="rounded-xl border border-emerald-400/35 bg-slate-950/5 p-4 dark:bg-slate-900/60">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">CV actuellement téléversé</p>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{profile.cvFileName}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
                    <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="font-medium">Aucun CV téléversé</p>
                    <p className="mt-1 text-sm text-muted-foreground">Ajoutez un CV pour obtenir une analyse et de meilleurs matchs.</p>
                  </div>
                )}

                <div className="mt-6 grid gap-3">
                  <Button onClick={() => navigate("/cv/upload")} variant="outline" className="bg-white/70">
                    {profile?.cvFileName ? "Remplacer le CV" : "Téléverser un CV"}
                  </Button>
                  <Button onClick={() => navigate("/cv/upload")} className="shadow-[0_4px_20px_rgba(0,168,255,0.15)]">
                    Analyser avec l'IA
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="mt-0">
            {applications.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {applications.map((job: any) => (
                  <JobListItem key={job.id} job={job} onClick={() => navigate(`/job/${job.id}`)} />
                ))}
              </div>
            ) : (
              <EmptyState icon={Briefcase} title="Aucune candidature pour le moment" text="Explorez les offres et gardez vos opportunités prioritaires au même endroit." action="Découvrir les offres" onClick={() => navigate("/search")} />
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            {savedJobs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {savedJobs.map((job: any) => (
                  <JobListItem key={job.id} job={job} onClick={() => navigate(`/job/${job.id}`)} />
                ))}
              </div>
            ) : (
              <EmptyState icon={Heart} title="Aucune offre sauvegardée" text="Sauvegardez les offres intéressantes pour y revenir plus facilement." action="Parcourir les offres" onClick={() => navigate("/search")} />
            )}
          </TabsContent>

          <TabsContent value="alerts" className="mt-0">
            {alerts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {alerts.map((alert: any) => (
                  <Card key={alert.id} className="glass-panel p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950 leading-tight">{alert.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[alert.sectors, alert.locations, alert.contractTypes].filter(Boolean).join(" • ") || "Toutes catégories"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAlertMutation.mutate({ alertId: alert.id })}
                      className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Supprimer l'alerte"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState icon={Bell} title="Aucune alerte configurée" text="Utilisez les filtres sur la page de recherche et cliquez sur &lsquo;Créer une alerte&rsquo; pour ne rater aucune opportunité." action="Aller à la recherche" onClick={() => navigate("/search")} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "blue" | "rose" | "emerald" }) {
  const tones = {
    blue: "bg-blue-50/70 text-blue-700",
    rose: "bg-rose-50/70 text-rose-700",
    emerald: "bg-emerald-50/70 text-emerald-700",
  };
  const isZero = value === "0";

  return (
    <Card className="pro-card rounded-xl p-5 animate-rise">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-950">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]} ${isZero ? "opacity-45 grayscale" : ""}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function ProgressStatCard({ label, value }: { label: string; value: number }) {
  const circumference = 2 * Math.PI * 18;
  const dashOffset = circumference - (value / 100) * circumference;

  return (
    <Card className="pro-card rounded-xl p-5 animate-rise shadow-[0_4px_20px_rgba(0,168,255,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-950">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{value}%</p>
        </div>
        <div className="relative h-14 w-14">
          <svg viewBox="0 0 44 44" className="h-14 w-14 -rotate-90">
            <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200" />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="text-primary transition-all duration-700"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">{value}</span>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, text, action, onClick }: { icon: any; title: string; text: string; action: string; onClick: () => void }) {
  return (
    <Card className="glass-panel rounded-xl px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-muted-foreground">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">{text}</p>
      <Button onClick={onClick} className="mt-6">
        {action}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}

function JobListItem({ job, onClick }: { job: any; onClick: () => void }) {
  return (
    <Card 
      className="glass-panel p-5 cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_4px_20px_rgba(0,168,255,0.15)] flex flex-col h-full" 
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-lg leading-tight line-clamp-2">{job.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{job.company}</p>
      
      <div className="mt-auto pt-5 flex flex-wrap gap-2">
        {job.location && (
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-normal">
            {job.location}
          </Badge>
        )}
        {job.contractType && (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200 font-normal">
            {job.contractType}
          </Badge>
        )}
      </div>
    </Card>
  );
}
