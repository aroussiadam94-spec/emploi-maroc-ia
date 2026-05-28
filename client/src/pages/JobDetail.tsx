import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertCircle, ArrowLeft, Briefcase, Calendar, DollarSign, ExternalLink, Heart, MapPin, Share2, Sparkles, Zap, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function JobDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const jobId = parseInt(id || "0");
  
  const utils = trpc.useUtils();
  const { data: job, isLoading } = trpc.jobs.getById.useQuery({ id: jobId });
  const { data: hasApplied } = trpc.jobs.hasApplied.useQuery({ jobId }, { enabled: !!jobId });
  const { data: isSaved } = trpc.jobs.isSaved.useQuery({ jobId }, { enabled: !!jobId });
  const applyMutation = trpc.jobs.submitApplication.useMutation();
  const toggleSaveMutation = trpc.jobs.toggleSave.useMutation();

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
    if (!cvFile) {
      toast.error("Veuillez sélectionner un CV.");
      return;
    }
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = (e.target?.result as string).split(",")[1];
          await applyMutation.mutateAsync({
            jobId,
            cvFileBase64: base64,
            cvFileName: cvFile.name,
            mimeType: cvFile.type,
          });
          toast.success("Candidature envoyée avec succès !");
          utils.jobs.hasApplied.invalidate({ jobId });
          setIsApplyModalOpen(false);
        } catch (err: any) {
          toast.error(err.message || "Une erreur est survenue");
        }
      };
      reader.readAsDataURL(cvFile);
    } catch (err: any) {
      toast.error("Impossible de lire le fichier.");
    }
  };

  if (isLoading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="glass-panel rounded-lg px-6 py-4 text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement de l'offre...
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center p-4">
        <Card className="glass-panel max-w-md rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="text-2xl font-bold">Offre non trouvée</h2>
          <p className="mt-3 text-muted-foreground">L'offre que vous recherchez n'existe pas ou a été supprimée.</p>
          <Button onClick={() => navigate("/search")} className="mt-6 w-full">Retour à la recherche</Button>
        </Card>
      </div>
    );
  }

  const matchingScore = (job as any).matchingScore ? Math.round(Number((job as any).matchingScore)) : null;
  const skills = Array.isArray(job.skills) ? job.skills : [];

  return (
    <div className="app-shell min-h-screen">
      <header className="border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between">
            <BrandLogo onClick={() => navigate("/")} />
            <ThemeToggle />
          </div>
          <Button onClick={() => navigate("/search")} variant="ghost" className="mb-5">
            <ArrowLeft className="h-4 w-4" />
            Retour à la recherche
          </Button>

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="animate-rise">
              <Badge className="mb-4 bg-blue-50 text-blue-700 hover:bg-blue-50">
                <Briefcase className="h-3.5 w-3.5" />
                {job.contractType || "Opportunité"}
              </Badge>
              <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-950 md:text-5xl">{job.title}</h1>
              <p className="mt-3 text-lg text-muted-foreground">{job.company}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {job.location && <Meta icon={MapPin} text={job.location} />}
                {job.publishedDate && <Meta icon={Calendar} text={new Date(job.publishedDate).toLocaleDateString("fr-FR")} />}
                {job.salaryMin && job.salaryMax && <Meta icon={DollarSign} text={`${Math.round(Number(job.salaryMin))} - ${Math.round(Number(job.salaryMax))} ${job.currency}`} />}
              </div>
            </div>

            {matchingScore !== null && (
               <Card className="glass-panel min-w-52 rounded-lg p-5 text-center animate-rise stagger-2">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Zap className="h-6 w-6" />
                </div>
                <p className="text-4xl font-bold text-slate-950">{matchingScore}%</p>
                <p className="mt-1 text-sm text-muted-foreground">Score de matching</p>
              </Card>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {hasApplied ? (
              <Button disabled className="h-11 bg-emerald-600 text-white opacity-100 cursor-not-allowed">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Candidature envoyée
              </Button>
            ) : (
              <Button onClick={() => setIsApplyModalOpen(true)} className="h-11">
                Postuler maintenant
              </Button>
            )}
            <Button 
              variant="outline" 
              className={`h-11 ${isSaved ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700" : "bg-white/70 hover:bg-slate-100"}`}
              onClick={handleToggleSave}
              disabled={toggleSaveMutation.isPending}
            >
              <Heart className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Sauvegardée" : "Sauvegarder"}
            </Button>
            <Button variant="outline" className="h-11 bg-white/70">
              <Share2 className="h-4 w-4" />
              Partager
            </Button>
          </div>
        </div>
      </header>

      <main className="container grid gap-8 py-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          {matchingScore !== null && (
            <Card className="pro-card rounded-lg p-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Pourquoi ce match ?</h2>
                  <p className="mt-1 text-muted-foreground">Cette offre correspond à {matchingScore}% avec votre profil et vos critères actuels.</p>
                </div>
              </div>
            </Card>
          )}

          <ContentCard title="Description du poste" text={job.description || "Aucune description disponible."} />
          <ContentCard title="Exigences" text={job.requirements || "Aucune exigence spécifiée."} />

          {skills.length > 0 && (
            <Card className="pro-card rounded-lg p-6">
              <h2 className="text-xl font-semibold">Compétences requises</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </section>

        <aside>
          <Card className="glass-panel sticky top-6 rounded-lg p-6">
            <h3 className="text-lg font-semibold">Informations</h3>
            <div className="mt-5 space-y-4">
              {job.location && <Info icon={MapPin} label="Localisation" value={job.location} />}
              {job.contractType && <Info icon={Briefcase} label="Type de contrat" value={job.contractType} />}
              {job.experienceLevel && <Info icon={Briefcase} label="Expérience" value={job.experienceLevel} />}
              {job.source && <Info icon={ExternalLink} label="Source" value={job.source} />}
            </div>
            
            {hasApplied ? (
              <Button disabled className="mt-6 w-full bg-emerald-600 text-white opacity-100 cursor-not-allowed">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Candidature envoyée
              </Button>
            ) : (
              <Button onClick={() => setIsApplyModalOpen(true)} className="mt-6 w-full">
                Postuler maintenant
              </Button>
            )}
            
            {job.sourceUrl && (
              <Button onClick={() => window.open(job.sourceUrl, "_blank")} variant="outline" className="mt-3 w-full">
                Voir l'offre originale
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            )}
          </Card>
        </aside>
      </main>

      {/* Application Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Postuler pour {job.title}</DialogTitle>
            <DialogDescription>
              Joignez votre CV pour envoyer votre candidature instantanément.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                cvFile ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setCvFile(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${cvFile ? "text-indigo-500" : "text-slate-400"}`} />
              {cvFile ? (
                <div>
                  <p className="text-sm font-semibold text-slate-900">{cvFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Cliquez pour modifier</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-900">Cliquez pour ajouter votre CV</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX jusqu'à 5MB</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>Annuler</Button>
            <Button onClick={handleApply} disabled={applyMutation.isPending || !cvFile}>
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Envoyer ma candidature"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Meta({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5">
      <Icon className="h-4 w-4" />
      {text}
    </span>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-950 capitalize">{value}</p>
      </div>
    </div>
  );
}

function ContentCard({ title, text }: { title: string; text: string }) {
  return (
    <Card className="pro-card rounded-lg p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-4 whitespace-pre-wrap leading-7 text-muted-foreground">{String(text)}</p>
    </Card>
  );
}
