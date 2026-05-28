import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Banknote,
  Bell,
  Briefcase,
  Building2,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  Search as SearchIcon,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Filters = {
  sector: string;
  contractType: string;
  location: string;
  experienceLevel: string;
};

const CONTRACT_COLORS: Record<string, string> = {
  CDI: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CDD: "bg-amber-50 text-amber-700 border-amber-200",
  Stage: "bg-blue-50 text-blue-700 border-blue-200",
  Freelance: "bg-violet-50 text-violet-700 border-violet-200",
  Alternance: "bg-orange-50 text-orange-700 border-orange-200",
};

const SECTORS = ["IT", "Finance", "Marketing", "RH", "Ventes", "Logistique", "BTP", "Tourisme", "Santé", "Agriculture", "Autres"];
const CONTRACT_TYPES = ["CDI", "CDD", "Stage", "Freelance", "Alternance"];
const LOCATIONS = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "El Jadida"];
const EXPERIENCE = ["Junior", "Confirmé", "Senior"];
const AVATAR_COLORS = ["bg-blue-600", "bg-emerald-600", "bg-cyan-600", "bg-violet-600", "bg-rose-600", "bg-amber-600"];

function getAvatarColor(company = "") {
  let hash = 0;
  for (const ch of company) hash = (hash * 31 + ch.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(hash)];
}

function timeAgo(dateStr: string | null | undefined) {
  if (!dateStr) return "Récemment";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

function parseSkills(skills: unknown): string[] {
  if (Array.isArray(skills)) return skills.map(String);
  if (typeof skills !== "string") return [];
  try {
    const parsed = JSON.parse(skills);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function JobCard({ job, onClick, index, matchingAlertName }: { job: any; onClick: () => void; index: number; matchingAlertName?: string }) {
  const skills = parseSkills(job.skills);
  const contractClass = CONTRACT_COLORS[job.contractType] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const avatarColor = getAvatarColor(job.company);

  return (
    <Card
      onClick={onClick}
      className="pro-card group cursor-pointer rounded-lg p-5 animate-rise"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${avatarColor} text-lg font-bold text-white shadow-lg shadow-slate-900/10`}>
          {String(job.company || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-950 transition-colors group-hover:text-primary">
            {job.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.company}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {job.location && (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2.5 py-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        )}
        {job.salaryMin && job.salaryMax && (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2.5 py-1">
            <Banknote className="h-3.5 w-3.5" />
            {Number(job.salaryMin).toLocaleString("fr-MA")} - {Number(job.salaryMax).toLocaleString("fr-MA")} MAD
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.contractType && <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${contractClass}`}>{job.contractType}</span>}
        {job.sector && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{job.sector}</span>}
        {job.experienceLevel && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{job.experienceLevel}</span>}
      </div>

      {skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {skills.slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              {skill}
            </span>
          ))}
          {skills.length > 3 && <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-muted-foreground">+{skills.length - 3}</span>}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {timeAgo(job.publishedDate)}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-all group-hover:gap-2">
          Voir l'offre
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>

      {matchingAlertName && (
        <div className="mt-3 flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 border border-rose-100">
          <Bell className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Alerte : {matchingAlertName}</span>
        </div>
      )}
    </Card>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
        <div className="h-8 rounded bg-slate-100" />
        <div className="h-12 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function Search() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const seedMutation = trpc.jobs.seed.useMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({ sector: "", contractType: "", location: "", experienceLevel: "" });

  const { data: jobs, isLoading } = trpc.jobs.search.useQuery({ limit: 100, offset: 0 });
  const { isAuthenticated } = trpc.auth ? { isAuthenticated: true } : { isAuthenticated: false };
  const { data: userAlerts = [] } = trpc.jobs.getAlerts.useQuery(undefined, { retry: false });
  const createAlertMutation = trpc.jobs.createAlert.useMutation();

  // Returns the first alert name that matches this job
  const getMatchingAlert = (job: any): string | undefined => {
    for (const alert of userAlerts as any[]) {
      const haystack = `${job.title} ${job.company} ${job.description ?? ""}`.toLowerCase();
      if (alert.keywords && !haystack.includes((alert.keywords as string).toLowerCase())) continue;
      if (alert.sectors && job.sector !== alert.sectors) continue;
      if (alert.locations && !job.location?.toLowerCase().includes((alert.locations as string).toLowerCase())) continue;
      if (alert.contractTypes && job.contractType !== alert.contractTypes) continue;
      return alert.name as string;
    }
    return undefined;
  };

  const handleCreateAlert = async () => {
    const parts: string[] = [];
    if (searchQuery) parts.push(searchQuery);
    if (filters.sector) parts.push(filters.sector);
    if (filters.location) parts.push(filters.location);
    const name = parts.length > 0 ? parts.join(" • ") : "Toutes les offres";

    try {
      await createAlertMutation.mutateAsync({
        name,
        keywords: searchQuery || undefined,
        sectors: filters.sector || undefined,
        locations: filters.location || undefined,
        contractTypes: filters.contractType || undefined,
      });
      toast.success(`Alerte « ${name} » créée !`, {
        description: "Retrouvez-la dans votre tableau de bord.",
      });
    } catch {
      toast.error("Connexion requise", { description: "Veuillez vous connecter pour créer une alerte." });
    }
  };

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((job: any) => {
      const q = searchQuery.toLowerCase();
      const haystack = `${job.title} ${job.company} ${job.description ?? ""}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (filters.sector && job.sector !== filters.sector) return false;
      if (filters.contractType && job.contractType !== filters.contractType) return false;
      if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.experienceLevel && job.experienceLevel !== filters.experienceLevel) return false;
      return true;
    });
  }, [jobs, searchQuery, filters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const clearFilters = () => setFilters({ sector: "", contractType: "", location: "", experienceLevel: "" });

  const refreshJobs = async () => {
    const res = await seedMutation.mutateAsync();
    toast.success(`${res.inserted} nouvelles offres chargées`);
    utils.jobs.search.invalidate();
  };

  return (
    <div className="app-shell min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="container flex flex-col gap-4 py-4 lg:flex-row lg:items-center">
          <BrandLogo onClick={() => navigate("/")} />

          <div className="relative min-w-0 flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Poste, compétence, entreprise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <FilterDropdown filters={filters} activeFilterCount={activeFilterCount} clearFilters={clearFilters} setFilters={setFilters} />
            <Button onClick={refreshJobs} disabled={seedMutation.isPending} variant="outline" className="gap-2 bg-white/70">
              {seedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Actualiser
            </Button>
            <Button
              onClick={handleCreateAlert}
              disabled={createAlertMutation.isPending}
              variant="outline"
              className="gap-2 bg-white/70 border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
            >
              {createAlertMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
              Créer une alerte
            </Button>
            <Button onClick={() => navigate("/swipe")} variant="ghost">Swipe IA</Button>
            <Button onClick={() => navigate("/dashboard")} variant="ghost">Dashboard</Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge className="mb-3 bg-blue-50 text-blue-700 hover:bg-blue-50">
              <Sparkles className="h-3.5 w-3.5" />
              Matching intelligent
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Recherche d'offres</h1>
            <p className="mt-2 text-muted-foreground">Filtrez les opportunités et ouvrez les fiches qui correspondent à votre trajectoire.</p>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong className="text-slate-950">{filteredJobs.length}</strong> offre{filteredJobs.length !== 1 ? "s" : ""} trouvée{filteredJobs.length !== 1 ? "s" : ""}
          </p>
        </div>

        {activeFilterCount > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) =>
              value ? (
                <Badge key={key} variant="secondary" className="gap-1">
                  {value}
                  <button onClick={() => setFilters((f) => ({ ...f, [key]: "" }))} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="glass-panel rounded-lg py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Aucune offre trouvée</h3>
            <p className="mt-2 text-muted-foreground">Essayez d'élargir vos critères ou chargez de nouvelles offres.</p>
            <Button onClick={refreshJobs} disabled={seedMutation.isPending} className="mt-6 gap-2">
              {seedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Charger les offres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job: any, index: number) => (
              <JobCard key={job.id} job={job} index={index} onClick={() => navigate(`/job/${job.id}`)} matchingAlertName={getMatchingAlert(job)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterDropdown({
  filters,
  activeFilterCount,
  clearFilters,
  setFilters,
}: {
  filters: Filters;
  activeFilterCount: number;
  clearFilters: () => void;
  setFilters: Dispatch<SetStateAction<Filters>>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={activeFilterCount > 0 ? "default" : "outline"} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {activeFilterCount > 0 && <span className="rounded-full bg-white/20 px-1.5 text-xs">{activeFilterCount}</span>}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-[min(92vw,560px)] rounded-lg border-border bg-card p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">Filtres</p>
            <p className="text-xs text-muted-foreground">Affinez les offres sans quitter la grille.</p>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-xs font-semibold text-primary hover:underline">
              Réinitialiser
            </button>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FilterBlock title="Secteur" values={SECTORS} selected={filters.sector} onSelect={(sector) => setFilters((f) => ({ ...f, sector: f.sector === sector ? "" : sector }))} />
          <FilterBlock title="Ville" values={LOCATIONS} selected={filters.location} onSelect={(location) => setFilters((f) => ({ ...f, location: f.location === location ? "" : location }))} />
          <FilterBlock title="Contrat" values={CONTRACT_TYPES} selected={filters.contractType} onSelect={(contractType) => setFilters((f) => ({ ...f, contractType: f.contractType === contractType ? "" : contractType }))} compact />
          <FilterBlock title="Expérience" values={EXPERIENCE} selected={filters.experienceLevel} onSelect={(experienceLevel) => setFilters((f) => ({ ...f, experienceLevel: f.experienceLevel === experienceLevel ? "" : experienceLevel }))} compact />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterBlock({
  title,
  values,
  selected,
  onSelect,
  compact = false,
}: {
  title: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className={compact ? "flex flex-wrap gap-2" : "grid gap-1"}>
        {values.map((value) => (
          <button
            key={value}
            onClick={(event) => {
              event.preventDefault();
              onSelect(value);
            }}
            className={
              compact
                ? `rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selected === value ? "border-primary bg-primary text-primary-foreground" : "border-slate-200 bg-white text-slate-700 hover:border-primary/40"}`
                : `w-full rounded-md px-3 py-2 text-left text-sm transition-all ${selected === value ? "bg-primary text-primary-foreground" : "text-slate-700 hover:bg-slate-100"}`
            }
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
