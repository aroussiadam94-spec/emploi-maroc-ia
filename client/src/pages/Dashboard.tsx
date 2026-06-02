import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import BrandLogo from "@/components/BrandLogo";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight, Bell, Briefcase, CheckCircle2, FileText,
  Heart, LogOut, Pencil, Search, Trash2, UserRound, AlertCircle,
} from "lucide-react";
import { useLocation } from "wouter";

const tabClass = (active: boolean) =>
  `relative px-4 py-3 text-sm font-semibold transition-all ${
    active
      ? "text-[#C9A84C] border-b-2 border-[#C9A84C]"
      : "text-[#8B7D6B] border-b-2 border-transparent hover:text-[#F0EDE6]"
  }`;

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const { data: profile } = trpc.candidate.getProfile.useQuery();
  const { data: savedJobs = [] }    = trpc.jobs.getSavedJobs.useQuery(undefined, { enabled: isAuthenticated });
  const { data: applications = [] } = trpc.jobs.getApplications.useQuery(undefined, { enabled: isAuthenticated });
  const { data: alerts = [], refetch: refetchAlerts } = trpc.jobs.getAlerts.useQuery(undefined, { enabled: isAuthenticated });
  const deleteAlertMutation = trpc.jobs.deleteAlert.useMutation({ onSuccess: () => refetchAlerts() });
  const logoutMutation = trpc.auth.logout.useMutation();

  const completion = profile?.cvFileName ? 65 : 35;
  const profileItems = [
    { label: "Nom",          value: user?.name || "Non défini" },
    { label: "Email",        value: user?.email || "Non défini" },
    { label: "Téléphone",   value: profile?.phone || "Non défini" },
    { label: "Localisation", value: profile?.location || "Non défini" },
  ];

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    await logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center p-4" style={{ background: "#07090F" }}>
        <div
          className="max-w-md rounded-2xl p-10 text-center"
          style={{
            background: "rgba(14,16,32,0.85)",
            border: "1px solid rgba(201,168,76,0.15)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "rgba(201,168,76,0.10)", color: "#C9A84C" }}
          >
            <UserRound size={28} />
          </div>
          <h2
            className="text-2xl font-black text-[#F0EDE6]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Connexion requise
          </h2>
          <p className="mt-3 text-[#8B7D6B]">
            Veuillez vous connecter pour accéder à votre tableau de bord.
          </p>
          <button
            onClick={() => (window.location.href = getLoginUrl())}
            className="btn-gold mt-7 w-full rounded-xl py-3"
          >
            Se connecter <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen" style={{ background: "#07090F" }}>
      {/* Header */}
      <header className="nav-glass" style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
        <div className="container py-5">
          <div className="mb-7 flex items-center justify-between gap-4">
            <BrandLogo onClick={() => navigate("/")} />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-[#8B7D6B] transition-colors hover:text-[#E07A5F]"
              style={{ background: "rgba(14,16,32,0.5)", border: "1px solid rgba(201,168,76,0.10)" }}
            >
              <LogOut size={14} /> Déconnexion
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_minmax(300px,400px)] lg:items-end">
            <div>
              <span className="badge-gold mb-3 inline-flex">Espace candidat</span>
              <h1
                className="text-3xl font-black text-[#F0EDE6]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Tableau de bord
              </h1>
              <p className="mt-2 text-[#8B7D6B]">
                Bienvenue,{" "}
                <span className="text-[#C9A84C]">{user?.name}</span>. Gardez votre recherche organisée.
              </p>
            </div>

            <button
              onClick={() => navigate("/search")}
              className="group flex h-12 items-center gap-3 rounded-xl px-4 text-left text-sm text-[#8B7D6B] transition-all hover:border-[rgba(201,168,76,0.35)] hover:text-[#F0EDE6]"
              style={{ background: "rgba(14,16,32,0.8)", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <Search size={15} className="text-[#C9A84C]" />
              <span className="min-w-0 flex-1 truncate">Rechercher une offre...</span>
              <span
                className="hidden rounded-lg px-2.5 py-1 text-xs font-bold transition-transform group-hover:translate-x-0.5 sm:inline"
                style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}
              >
                Ouvrir
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stat cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard icon={Briefcase} label="Candidatures"       value={applications.length.toString()} color="#7BA7BC" />
          <StatCard icon={Heart}     label="Offres sauvegardées" value={savedJobs.length.toString()}   color="#E07A5F" />
          <StatCard icon={Bell}      label="Alertes actives"     value={alerts.length.toString()}       color="#34D399" />
          <ProgressCard label="Profil complété" value={completion} />
        </div>

        {/* Tabs */}
        <div
          className="mb-6 flex overflow-x-auto border-b"
          style={{ borderColor: "rgba(201,168,76,0.12)" }}
        >
          {["profile", "applications", "saved", "alerts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={tabClass(activeTab === tab)}
            >
              {{ profile: "Profil", applications: "Candidatures", saved: "Sauvegardées", alerts: "Alertes" }[tab]}
            </button>
          ))}
        </div>

        {/* Tab: Profile */}
        {activeTab === "profile" && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Info card */}
            <div
              className="rounded-2xl p-7"
              style={{ background: "rgba(14,16,32,0.80)", border: "1px solid rgba(201,168,76,0.12)" }}
            >
              <div className="mb-7 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C" }}
                  >
                    <UserRound size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#F0EDE6]"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Informations personnelles
                    </h2>
                    <p className="mt-0.5 text-sm text-[#8B7D6B]">Personnalisez votre recherche.</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="rounded-xl p-2.5 text-[#8B7D6B] transition-colors hover:bg-[rgba(201,168,76,0.10)] hover:text-[#C9A84C]"
                  style={{ border: "1px solid rgba(201,168,76,0.12)" }}
                >
                  <Pencil size={15} />
                </button>
              </div>

              <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
                {profileItems.map((item) => (
                  <div
                    key={item.label}
                    className="pb-4"
                    style={{ borderBottom: "1px solid rgba(201,168,76,0.08)" }}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-[#C9A84C]">{item.label}</p>
                    <p className="mt-2 font-semibold text-[#F0EDE6]">{item.value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/profile/edit")}
                className="btn-gold mt-7 rounded-xl px-6 py-3 text-sm"
              >
                Modifier le profil <ArrowRight size={15} />
              </button>
            </div>

            {/* CV card */}
            <div
              className="rounded-2xl p-7"
              style={{ background: "rgba(14,16,32,0.80)", border: "1px solid rgba(201,168,76,0.12)" }}
            >
              <div className="mb-7 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C" }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#F0EDE6]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Curriculum Vitae
                  </h2>
                  <p className="mt-0.5 text-sm text-[#8B7D6B]">Votre CV et son analyse IA.</p>
                </div>
              </div>

              {profile?.cvFileName ? (
                <div
                  className="rounded-xl p-4"
                  style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.20)" }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color: "#34D399" }} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#F0EDE6]">CV actuellement téléversé</p>
                      <p className="mt-1 truncate text-sm text-[#8B7D6B]">{profile.cvFileName}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-xl p-8 text-center"
                  style={{ border: "1px dashed rgba(201,168,76,0.20)", background: "rgba(201,168,76,0.03)" }}
                >
                  <AlertCircle size={28} className="mx-auto mb-3 text-[#8B7D6B]" />
                  <p className="font-semibold text-[#F0EDE6]">Aucun CV téléversé</p>
                  <p className="mt-1 text-sm text-[#8B7D6B]">Ajoutez un CV pour obtenir de meilleurs matchs.</p>
                </div>
              )}

              <div className="mt-6 grid gap-3">
                <button
                  onClick={() => navigate("/cv/upload")}
                  className="btn-outline-gold w-full rounded-xl py-3 text-sm"
                >
                  {profile?.cvFileName ? "Remplacer le CV" : "Téléverser un CV"}
                </button>
                <button
                  onClick={() => navigate("/cv/upload")}
                  className="btn-gold w-full rounded-xl py-3 text-sm"
                >
                  Analyser avec l'IA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Applications */}
        {activeTab === "applications" && (
          applications.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((job: any) => (
                <JobListItem key={job.id} job={job} onClick={() => navigate(`/job/${job.id}`)} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="Aucune candidature pour le moment"
              text="Explorez les offres et gardez vos opportunités au même endroit."
              action="Découvrir les offres"
              onClick={() => navigate("/search")}
            />
          )
        )}

        {/* Tab: Saved */}
        {activeTab === "saved" && (
          savedJobs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedJobs.map((job: any) => (
                <JobListItem key={job.id} job={job} onClick={() => navigate(`/job/${job.id}`)} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Heart}
              title="Aucune offre sauvegardée"
              text="Sauvegardez les offres intéressantes pour y revenir facilement."
              action="Parcourir les offres"
              onClick={() => navigate("/search")}
            />
          )
        )}

        {/* Tab: Alerts */}
        {activeTab === "alerts" && (
          alerts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between gap-4 rounded-2xl p-5"
                  style={{ background: "rgba(14,16,32,0.80)", border: "1px solid rgba(201,168,76,0.12)" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "rgba(224,122,95,0.12)", color: "#E07A5F" }}
                    >
                      <Bell size={16} />
                    </div>
                    <div>
                      <p className="font-semibold leading-tight text-[#F0EDE6]">{alert.name}</p>
                      <p className="mt-1 text-xs text-[#8B7D6B]">
                        {[alert.sectors, alert.locations, alert.contractTypes].filter(Boolean).join(" • ") || "Toutes catégories"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAlertMutation.mutate({ alertId: alert.id })}
                    className="shrink-0 rounded-lg p-1.5 text-[#8B7D6B] transition-colors hover:bg-[rgba(224,122,95,0.10)] hover:text-[#E07A5F]"
                    title="Supprimer l'alerte"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="Aucune alerte configurée"
              text="Utilisez les filtres sur la recherche et cliquez sur 'Créer une alerte'."
              action="Aller à la recherche"
              onClick={() => navigate("/search")}
            />
          )
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const isZero = value === "0";
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(14,16,32,0.80)",
        border: "1px solid rgba(201,168,76,0.12)",
        animation: "rise-in 600ms cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8B7D6B]">{label}</p>
          <p
            className="mt-2 text-3xl font-black text-[#F0EDE6]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {value}
          </p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: `${color}18`,
            color,
            opacity: isZero ? 0.4 : 1,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ label, value }: { label: string; value: number }) {
  const circumference = 2 * Math.PI * 18;
  const dashOffset = circumference - (value / 100) * circumference;
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(14,16,32,0.80)",
        border: "1px solid rgba(201,168,76,0.18)",
        boxShadow: "0 0 30px rgba(201,168,76,0.08)",
        animation: "rise-in 600ms cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8B7D6B]">{label}</p>
          <p
            className="mt-2 text-3xl font-black text-[#C9A84C]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {value}%
          </p>
        </div>
        <div className="relative h-14 w-14">
          <svg viewBox="0 0 44 44" className="h-14 w-14 -rotate-90">
            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="4" />
            <circle
              cx="22" cy="22" r="18" fill="none"
              stroke="#C9A84C" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#C9A84C]">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text, action, onClick }: {
  icon: any; title: string; text: string; action: string; onClick: () => void;
}) {
  return (
    <div
      className="rounded-2xl px-6 py-16 text-center"
      style={{ background: "rgba(14,16,32,0.5)", border: "1px solid rgba(201,168,76,0.08)" }}
    >
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "rgba(201,168,76,0.10)", color: "#C9A84C" }}
      >
        <Icon size={28} />
      </div>
      <h2 className="text-xl font-bold text-[#F0EDE6]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#8B7D6B]">{text}</p>
      <button onClick={onClick} className="btn-gold mt-7 rounded-xl px-6 py-3 text-sm">
        {action} <ArrowRight size={15} />
      </button>
    </div>
  );
}

function JobListItem({ job, onClick }: { job: any; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-5 transition-all hover:-translate-y-1"
      style={{
        background: "rgba(14,16,32,0.80)",
        border: "1px solid rgba(201,168,76,0.12)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.30)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 40px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.12)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      <h3 className="font-semibold leading-tight text-[#F0EDE6] line-clamp-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {job.title}
      </h3>
      <p className="mt-2 text-sm text-[#8B7D6B]">{job.company}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {job.location && (
          <span className="rounded-full bg-[#1E2338] px-3 py-1 text-xs text-[#8B7D6B]">{job.location}</span>
        )}
        {job.contractType && (
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "rgba(123,167,188,0.12)", color: "#7BA7BC" }}
          >
            {job.contractType}
          </span>
        )}
      </div>
    </div>
  );
}
