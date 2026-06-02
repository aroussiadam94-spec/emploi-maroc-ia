import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertCircle, ArrowLeft, Briefcase, Calendar, ExternalLink,
  Heart, MapPin, Share2, Sparkles, Zap, UploadCloud, Loader2, CheckCircle2, DollarSign,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import BrandLogo from "@/components/BrandLogo";

export default function JobDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const jobId = parseInt(id || "0");

  const utils = trpc.useUtils();
  const { data: job, isLoading } = trpc.jobs.getById.useQuery({ id: jobId });
  const { data: hasApplied } = trpc.jobs.hasApplied.useQuery({ jobId }, { enabled: !!jobId });
  const { data: isSaved }    = trpc.jobs.isSaved.useQuery({ jobId }, { enabled: !!jobId });
  const applyMutation        = trpc.jobs.submitApplication.useMutation();
  const toggleSaveMutation   = trpc.jobs.toggleSave.useMutation();

  const handleToggleSave = async () => {
    try {
      await toggleSaveMutation.mutateAsync({ jobId });
      utils.jobs.isSaved.invalidate({ jobId });
      toast.success(isSaved ? "Offre retirée des favoris" : "Offre sauvegardée avec succès");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde");
    }
  };

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApply = async () => {
    if (!cvFile) { toast.error("Veuillez sélectionner un CV."); return; }
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = (e.target?.result as string).split(",")[1];
          await applyMutation.mutateAsync({ jobId, cvFileBase64: base64, cvFileName: cvFile.name, mimeType: cvFile.type });
          toast.success("Candidature envoyée avec succès !");
          utils.jobs.hasApplied.invalidate({ jobId });
          setIsApplyModalOpen(false);
        } catch (err: any) { toast.error(err.message || "Une erreur est survenue"); }
      };
      reader.readAsDataURL(cvFile);
    } catch { toast.error("Impossible de lire le fichier."); }
  };

  if (isLoading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center" style={{ background: "#07090F" }}>
        <div
          className="flex items-center gap-3 rounded-2xl px-7 py-5 text-[#8B7D6B]"
          style={{ background: "rgba(14,16,32,0.85)", border: "1px solid rgba(201,168,76,0.12)" }}
        >
          <Loader2 size={16} className="animate-spin text-[#C9A84C]" />
          Chargement de l'offre...
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center p-4" style={{ background: "#07090F" }}>
        <div
          className="max-w-md rounded-2xl p-8 text-center"
          style={{ background: "rgba(14,16,32,0.85)", border: "1px solid rgba(201,168,76,0.12)" }}
        >
          <AlertCircle size={40} className="mx-auto mb-4 text-[#E07A5F]" />
          <h2 className="text-2xl font-black text-[#F0EDE6]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Offre non trouvée
          </h2>
          <p className="mt-3 text-[#8B7D6B]">L'offre n'existe pas ou a été supprimée.</p>
          <button
            onClick={() => navigate("/search")}
            className="btn-gold mt-7 w-full rounded-xl py-3 text-sm"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  const matchingScore = (job as any).matchingScore ? Math.round(Number((job as any).matchingScore)) : null;
  const skills = Array.isArray(job.skills) ? job.skills : [];

  return (
    <div className="app-shell min-h-screen" style={{ background: "#07090F" }}>
      {/* Header */}
      <header className="nav-glass" style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
        <div className="container py-5">
          <div className="mb-5 flex items-center justify-between">
            <BrandLogo onClick={() => navigate("/")} />
          </div>
          <button
            onClick={() => navigate("/search")}
            className="mb-5 flex items-center gap-2 text-sm text-[#8B7D6B] transition-colors hover:text-[#C9A84C]"
          >
            <ArrowLeft size={15} /> Retour à la recherche
          </button>

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div style={{ animation: "rise-in 600ms cubic-bezier(0.22,1,0.36,1) both" }}>
              {job.contractType && (
                <span className="badge-gold mb-4 inline-flex">
                  <Briefcase size={11} /> {job.contractType}
                </span>
              )}
              <h1
                className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-[#F0EDE6] md:text-5xl"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {job.title}
              </h1>
              <p className="mt-3 text-lg text-[#8B7D6B]">{job.company}</p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                {job.location && (
                  <MetaTag icon={MapPin} text={job.location} />
                )}
                {job.publishedDate && (
                  <MetaTag icon={Calendar} text={new Date(job.publishedDate).toLocaleDateString("fr-FR")} />
                )}
                {job.salaryMin && job.salaryMax && (
                  <MetaTag
                    icon={DollarSign}
                    text={`${Math.round(Number(job.salaryMin)).toLocaleString("fr-MA")} – ${Math.round(Number(job.salaryMax)).toLocaleString("fr-MA")} ${job.currency || "MAD"}`}
                  />
                )}
              </div>
            </div>

            {/* Matching score */}
            {matchingScore !== null && (
              <div
                className="min-w-[180px] rounded-2xl p-6 text-center"
                style={{
                  background: "rgba(52,211,153,0.08)",
                  border: "1px solid rgba(52,211,153,0.20)",
                  animation: "rise-in 600ms cubic-bezier(0.22,1,0.36,1) 200ms both",
                }}
              >
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}
                >
                  <Zap size={22} />
                </div>
                <p
                  className="text-4xl font-black"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#34D399" }}
                >
                  {matchingScore}%
                </p>
                <p className="mt-1 text-sm text-[#8B7D6B]">Score de matching</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-7 flex flex-wrap gap-3">
            {hasApplied ? (
              <div
                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                style={{ background: "rgba(52,211,153,0.12)", color: "#34D399", border: "1px solid rgba(52,211,153,0.25)" }}
              >
                <CheckCircle2 size={16} /> Candidature envoyée
              </div>
            ) : (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="btn-gold rounded-xl px-7 py-3 text-sm"
              >
                Postuler maintenant <ArrowLeft size={15} className="rotate-180" />
              </button>
            )}
            <button
              onClick={handleToggleSave}
              disabled={toggleSaveMutation.isPending}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
              style={{
                background: isSaved ? "rgba(224,122,95,0.12)" : "rgba(14,16,32,0.8)",
                color: isSaved ? "#E07A5F" : "#8B7D6B",
                border: `1px solid ${isSaved ? "rgba(224,122,95,0.25)" : "rgba(201,168,76,0.15)"}`,
              }}
            >
              <Heart size={15} className={isSaved ? "fill-current" : ""} />
              {isSaved ? "Sauvegardée" : "Sauvegarder"}
            </button>
            <button
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-[#8B7D6B] transition-colors hover:text-[#F0EDE6]"
              style={{ background: "rgba(14,16,32,0.8)", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <Share2 size={15} /> Partager
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="container grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* AI match card */}
          {matchingScore !== null && (
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(14,16,32,0.80)", border: "1px solid rgba(201,168,76,0.12)" }}
            >
              <div className="flex gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C" }}
                >
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#F0EDE6]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Pourquoi ce match ?
                  </h2>
                  <p className="mt-1 text-sm text-[#8B7D6B]">
                    Cette offre correspond à {matchingScore}% avec votre profil et vos critères actuels.
                  </p>
                </div>
              </div>
            </div>
          )}

          <ContentSection title="Description du poste" text={job.description || "Aucune description disponible."} />
          <ContentSection title="Exigences"            text={job.requirements || "Aucune exigence spécifiée."} />

          {/* Skills */}
          {skills.length > 0 && (
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(14,16,32,0.80)", border: "1px solid rgba(201,168,76,0.12)" }}
            >
              <h2 className="mb-5 text-xl font-bold text-[#F0EDE6]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Compétences requises
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium"
                    style={{ background: "rgba(52,211,153,0.10)", color: "#34D399" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <div
            className="sticky top-6 rounded-2xl p-6"
            style={{ background: "rgba(14,16,32,0.85)", border: "1px solid rgba(201,168,76,0.14)" }}
          >
            <h3 className="mb-5 text-lg font-bold text-[#F0EDE6]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Informations
            </h3>
            <div className="space-y-4">
              {job.location     && <InfoRow icon={MapPin}     label="Localisation" value={job.location} />}
              {job.contractType && <InfoRow icon={Briefcase}  label="Type de contrat" value={job.contractType} />}
              {job.experienceLevel && <InfoRow icon={Briefcase} label="Expérience" value={job.experienceLevel} />}
              {job.source       && <InfoRow icon={ExternalLink} label="Source" value={job.source} />}
            </div>

            <div className="mt-7 space-y-3">
              {hasApplied ? (
                <div
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
                  style={{ background: "rgba(52,211,153,0.12)", color: "#34D399", border: "1px solid rgba(52,211,153,0.20)" }}
                >
                  <CheckCircle2 size={15} /> Candidature envoyée
                </div>
              ) : (
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="btn-gold w-full rounded-xl py-3 text-sm"
                >
                  Postuler maintenant
                </button>
              )}
              {job.sourceUrl && (
                <button
                  onClick={() => window.open(job.sourceUrl, "_blank")}
                  className="btn-outline-gold w-full rounded-xl py-3 text-sm"
                >
                  Voir l'offre originale <ExternalLink size={14} />
                </button>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* Apply Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent
          className="sm:max-w-[440px] rounded-2xl p-8"
          style={{
            background: "#0E1020",
            border: "1px solid rgba(201,168,76,0.20)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            color: "#F0EDE6",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-xl font-black text-[#F0EDE6]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Postuler pour ce poste
            </DialogTitle>
            <DialogDescription className="text-[#8B7D6B]">
              Joignez votre CV pour envoyer votre candidature instantanément.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div
              className="rounded-2xl p-8 text-center cursor-pointer transition-all"
              style={{
                border: cvFile
                  ? "2px solid rgba(201,168,76,0.50)"
                  : "2px dashed rgba(201,168,76,0.20)",
                background: cvFile
                  ? "rgba(201,168,76,0.06)"
                  : "rgba(14,16,32,0.5)",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => { if (e.target.files?.[0]) setCvFile(e.target.files[0]); }}
              />
              <UploadCloud
                size={36}
                className="mx-auto mb-3"
                style={{ color: cvFile ? "#C9A84C" : "#8B7D6B" }}
              />
              {cvFile ? (
                <>
                  <p className="text-sm font-semibold text-[#F0EDE6]">{cvFile.name}</p>
                  <p className="mt-1 text-xs text-[#8B7D6B]">Cliquez pour modifier</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-[#F0EDE6]">Cliquez pour ajouter votre CV</p>
                  <p className="mt-1 text-xs text-[#8B7D6B]">PDF, DOC, DOCX jusqu'à 5MB</p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="btn-outline-gold flex-1 rounded-xl py-3 text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleApply}
              disabled={applyMutation.isPending || !cvFile}
              className="btn-gold flex-1 rounded-xl py-3 text-sm disabled:opacity-50"
            >
              {applyMutation.isPending ? (
                <><Loader2 size={14} className="animate-spin" /> Envoi...</>
              ) : "Envoyer ma candidature"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetaTag({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm"
      style={{ background: "rgba(30,35,56,0.8)", color: "#8B7D6B", border: "1px solid rgba(201,168,76,0.12)" }}
    >
      <Icon size={14} className="text-[#C9A84C]" /> {text}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-[#C9A84C]" />
      <div>
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[#8B7D6B]">{label}</p>
        <p className="mt-0.5 text-sm font-semibold capitalize text-[#F0EDE6]">{value}</p>
      </div>
    </div>
  );
}

function ContentSection({ title, text }: { title: string; text: string }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "rgba(14,16,32,0.80)", border: "1px solid rgba(201,168,76,0.12)" }}
    >
      <h2 className="mb-4 text-xl font-bold text-[#F0EDE6]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {title}
      </h2>
      <p className="whitespace-pre-wrap text-sm leading-7 text-[#8B7D6B]">{String(text)}</p>
    </div>
  );
}
