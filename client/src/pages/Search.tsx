import { type Dispatch, type SetStateAction, useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Banknote, Bell, Briefcase, Building2, ChevronRight, Clock,
  Loader2, MapPin, RefreshCw, Search as SearchIcon, SlidersHorizontal,
  Sparkles, X, ArrowLeft, Filter,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const CONTRACT_COLORS: Record<string, { bg: string; color: string }> = {
  CDI:        { bg: "rgba(52,211,153,0.12)",  color: "#34D399" },
  CDD:        { bg: "rgba(5,150,105,0.12)",  color: "#059669" },
  Stage:      { bg: "rgba(123,167,188,0.12)", color: "#7BA7BC" },
  Freelance:  { bg: "rgba(167,139,250,0.12)", color: "#A78BFA" },
  Alternance: { bg: "rgba(224,122,95,0.12)",  color: "#15803d" },
};

const SECTORS       = ["IT", "Finance", "Marketing", "RH", "Ventes", "Logistique", "BTP", "Tourisme", "Santé", "Agriculture", "Autres"];
const CONTRACT_TYPES = ["CDI", "CDD", "Stage", "Freelance", "Alternance"];
const LOCATIONS     = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "El Jadida"];
const EXPERIENCE    = ["Junior", "Confirmé", "Senior"];

const AVATAR_PALETTE = [
  "#1a4a3a", "#4a3a1a", "#1a2e4a", "#3a1a4a", "#4a1a2e", "#1a3a4a"
];

function getAvatarColor(company = "") {
  let hash = 0;
  for (const ch of company) hash = (hash * 31 + ch.charCodeAt(0)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[Math.abs(hash)];
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

function JobCard({
  job, onClick, index, matchingAlertName,
}: {
  job: any; onClick: () => void; index: number; matchingAlertName?: string;
}) {
  const skills       = parseSkills(job.skills);
  const contractStyle = CONTRACT_COLORS[job.contractType] ?? { bg: "rgba(139,125,107,0.12)", color: "#8B7D6B" };
  const avatarColor  = getAvatarColor(job.company);
  const initial      = String(job.company || "?").charAt(0).toUpperCase();

  return (
    <div
      onClick={onClick}
      className="pro-card group cursor-pointer rounded-2xl p-5"
      style={{
        animationDelay: `${Math.min(index, 8) * 55}ms`,
        animation: "rise-in 500ms cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
          style={{
            background: avatarColor,
            fontFamily: "'Playfair Display', Georgia, serif",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="line-clamp-2 text-base font-semibold leading-snug text-[#1c1917] transition-colors group-hover:text-[#059669]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {job.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-[#8B7D6B]">
            <Building2 size={13} className="shrink-0" />
            <span className="truncate">{job.company}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#8B7D6B]">
        {job.location && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f4] px-3 py-1">
            <MapPin size={11} /> {job.location}
          </span>
        )}
        {job.salaryMin && job.salaryMax && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f4] px-3 py-1">
            <Banknote size={11} />
            {Number(job.salaryMin).toLocaleString("fr-MA")} – {Number(job.salaryMax).toLocaleString("fr-MA")} MAD
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {job.contractType && (
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: contractStyle.bg, color: contractStyle.color }}
          >
            {job.contractType}
          </span>
        )}
        {job.sector && (
          <span className="rounded-full bg-[#f5f5f4] px-3 py-1 text-xs font-medium text-[#8B7D6B]">
            {job.sector}
          </span>
        )}
        {job.experienceLevel && (
          <span className="rounded-full bg-[rgba(123,167,188,0.12)] px-3 py-1 text-xs font-medium text-[#7BA7BC]">
            {job.experienceLevel}
          </span>
        )}
      </div>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded-lg px-2.5 py-1 text-xs font-medium"
              style={{ background: "rgba(52,211,153,0.10)", color: "#34D399" }}
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="rounded-lg bg-[#f5f5f4] px-2.5 py-1 text-xs text-[#8B7D6B]">
              +{skills.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-[#8B7D6B]">
        <span className="inline-flex items-center gap-1">
          <Clock size={11} /> {timeAgo(job.publishedDate)}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#059669] transition-all group-hover:gap-2">
          Voir l'offre <ChevronRight size={12} />
        </span>
      </div>

      {matchingAlertName && (
        <div
          className="mt-3 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium"
          style={{ background: "rgba(224,122,95,0.10)", color: "#15803d", border: "1px solid rgba(224,122,95,0.20)" }}
        >
          <Bell size={11} className="shrink-0" />
          <span className="truncate">Alerte : {matchingAlertName}</span>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(14,16,32,0.80)", border: "1px solid rgba(5,150,105,0.08)" }}
    >
      <div className="animate-pulse space-y-4">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#f5f5f4]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded-lg bg-[#f5f5f4]" />
            <div className="h-3 w-1/2 rounded-lg bg-[#f5f5f4]/60" />
          </div>
        </div>
        <div className="h-8 rounded-lg bg-[#f5f5f4]/60" />
        <div className="h-12 rounded-lg bg-[#f5f5f4]/40" />
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
  const { data: userAlerts = [] } = trpc.jobs.getAlerts.useQuery(undefined, { retry: false });
  const createAlertMutation = trpc.jobs.createAlert.useMutation();

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
      toast.success(`Alerte « ${name} » créée !`, { description: "Retrouvez-la dans votre tableau de bord." });
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
    <div className="app-shell min-h-screen" style={{ background: "#fafafa" }}>
      {/* Header */}
      <header className="nav-glass sticky top-0 z-40">
        <div className="container flex flex-col gap-4 py-4 lg:flex-row lg:items-center">
          <BrandLogo onClick={() => navigate("/")} />

          {/* Search input */}
          <div className="relative min-w-0 flex-1">
            <SearchIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#059669]"
            />
            <input
              type="text"
              placeholder="Poste, compétence, entreprise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl pl-10 pr-10 text-sm outline-none"
              style={{
                background: "rgba(14,16,32,0.85)",
                border: "1px solid rgba(5,150,105,0.18)",
                color: "#1c1917",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7D6B] hover:text-[#1c1917]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              filters={filters}
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
              setFilters={setFilters}
            />
            <button
              onClick={refreshJobs}
              disabled={seedMutation.isPending}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[#8B7D6B] transition-colors hover:text-[#1c1917]"
              style={{ background: "rgba(14,16,32,0.8)", border: "1px solid rgba(5,150,105,0.15)" }}
            >
              {seedMutation.isPending
                ? <Loader2 size={14} className="animate-spin" />
                : <RefreshCw size={14} />}
              Actualiser
            </button>
            <button
              onClick={handleCreateAlert}
              disabled={createAlertMutation.isPending}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: "rgba(224,122,95,0.10)",
                border: "1px solid rgba(224,122,95,0.20)",
                color: "#15803d",
              }}
            >
              {createAlertMutation.isPending
                ? <Loader2 size={14} className="animate-spin" />
                : <Bell size={14} />}
              Créer une alerte
            </button>
            <button
              onClick={() => navigate("/swipe")}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#8B7D6B] transition-colors hover:text-[#059669]"
            >
              Swipe IA
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#8B7D6B] transition-colors hover:text-[#059669]"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Page title */}
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="badge-emerald mb-3 inline-flex">
              <Sparkles size={11} />
              Matching intelligent
            </span>
            <h1
              className="text-3xl font-black text-[#1c1917]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Recherche d'offres
            </h1>
            <p className="mt-2 text-[#8B7D6B]">
              Filtrez les opportunités et postulez aux meilleures offres du Maroc.
            </p>
          </div>
          <p className="text-sm text-[#8B7D6B]">
            <span className="text-[#059669] font-bold">{filteredJobs.length}</span>{" "}
            offre{filteredJobs.length !== 1 ? "s" : ""} trouvée{filteredJobs.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Active filters */}
        {activeFilterCount > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) =>
              value ? (
                <span
                  key={key}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{
                    background: "rgba(5,150,105,0.12)",
                    color: "#059669",
                    border: "1px solid rgba(5,150,105,0.25)",
                  }}
                >
                  {value}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, [key]: "" }))}
                    className="hover:text-white"
                  >
                    <X size={11} />
                  </button>
                </span>
              ) : null
            )}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div
            className="rounded-2xl py-20 text-center"
            style={{ background: "rgba(14,16,32,0.7)", border: "1px solid rgba(5,150,105,0.10)" }}
          >
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "rgba(5,150,105,0.10)", color: "#059669" }}
            >
              <Briefcase size={28} />
            </div>
            <h3
              className="text-xl font-bold text-[#1c1917]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Aucune offre trouvée
            </h3>
            <p className="mt-2 text-[#8B7D6B]">Essayez d'élargir vos critères ou chargez de nouvelles offres.</p>
            <button
              onClick={refreshJobs}
              disabled={seedMutation.isPending}
              className="btn-emerald mt-7 rounded-xl px-6 py-3 text-sm"
            >
              {seedMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Charger les offres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job: any, index: number) => (
              <JobCard
                key={job.id}
                job={job}
                index={index}
                onClick={() => navigate(`/job/${job.id}`)}
                matchingAlertName={getMatchingAlert(job)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterDropdown({ filters, activeFilterCount, clearFilters, setFilters }: {
  filters: Filters;
  activeFilterCount: number;
  clearFilters: () => void;
  setFilters: Dispatch<SetStateAction<Filters>>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
          style={{
            background: activeFilterCount > 0 ? "rgba(5,150,105,0.15)" : "rgba(14,16,32,0.8)",
            border: `1px solid ${activeFilterCount > 0 ? "rgba(5,150,105,0.35)" : "rgba(5,150,105,0.15)"}`,
            color: activeFilterCount > 0 ? "#059669" : "#8B7D6B",
          }}
        >
          <Filter size={14} />
          Filtres
          {activeFilterCount > 0 && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: "#059669", color: "#fafafa" }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(92vw,560px)] rounded-2xl p-6 shadow-2xl"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(5,150,105,0.15)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="font-bold text-[#1c1917]"
               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Filtres
            </p>
            <p className="text-xs text-[#8B7D6B]">Affinez sans quitter la grille.</p>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-[#059669] hover:underline"
            >
              Réinitialiser
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FilterBlock title="Secteur" values={SECTORS} selected={filters.sector}
            onSelect={(sector) => setFilters((f) => ({ ...f, sector: f.sector === sector ? "" : sector }))} />
          <FilterBlock title="Ville" values={LOCATIONS} selected={filters.location}
            onSelect={(location) => setFilters((f) => ({ ...f, location: f.location === location ? "" : location }))} />
          <FilterBlock title="Contrat" values={CONTRACT_TYPES} selected={filters.contractType}
            onSelect={(contractType) => setFilters((f) => ({ ...f, contractType: f.contractType === contractType ? "" : contractType }))} compact />
          <FilterBlock title="Expérience" values={EXPERIENCE} selected={filters.experienceLevel}
            onSelect={(experienceLevel) => setFilters((f) => ({ ...f, experienceLevel: f.experienceLevel === experienceLevel ? "" : experienceLevel }))} compact />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterBlock({ title, values, selected, onSelect, compact = false }: {
  title: string; values: string[]; selected: string; onSelect: (value: string) => void; compact?: boolean;
}) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-black uppercase tracking-[0.15em] text-[#059669]">{title}</p>
      <div className={compact ? "flex flex-wrap gap-2" : "grid gap-1"}>
        {values.map((value) => {
          const active = selected === value;
          return (
            <button
              key={value}
              onClick={(e) => { e.preventDefault(); onSelect(value); }}
              className={
                compact
                  ? "rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                  : "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-all"
              }
              style={{
                background: active ? "rgba(5,150,105,0.18)" : "transparent",
                color: active ? "#059669" : "#8B7D6B",
                border: compact ? `1px solid ${active ? "rgba(5,150,105,0.4)" : "rgba(5,150,105,0.12)"}` : "none",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#1c1917";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#8B7D6B";
              }}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
