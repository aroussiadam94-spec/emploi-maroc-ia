import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, UserRound, UploadCloud, FileText, X, Loader2, Trash2 } from "lucide-react";
import { useLocation } from "wouter"; 
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { useDropzone } from "react-dropzone";

export default function ProfileEdit() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ phone: "", location: "", bio: "" });

  const { data: profile } = trpc.candidate.getProfile.useQuery();
  const updateProfileMutation = trpc.candidate.updateProfile.useMutation();
  const uploadCvMutation = trpc.cv.upload.useMutation();
  const removeCvMutation = trpc.cv.remove.useMutation();
  const utils = trpc.useUtils();

  const [cvUploading, setCvUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || "",
        location: profile.location || "",
        bio: (profile as any).bio || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success("Profil mis à jour avec succès");
      utils.candidate.getProfile.invalidate();
      navigate("/dashboard");
    } catch {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const onDropCv = async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast.error("Le fichier a été rejeté. Assurez-vous qu'il s'agit d'un PDF ou Word de moins de 5 Mo.");
      return;
    }
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    // Simple extension check
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      toast.error("Format non supporté. Veuillez utiliser un PDF ou DOC.");
      return;
    }
    
    setCvUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        if (!base64Data) throw new Error("Erreur de lecture du fichier");
        
        await uploadCvMutation.mutateAsync({
          fileName: file.name,
          fileBase64: base64Data,
          mimeType: file.type || 'application/octet-stream',
        });
        
        toast.success("CV téléchargé avec succès !");
        await utils.candidate.getProfile.invalidate();
      } catch (e: any) {
        console.error("Upload error:", e);
        toast.error(e.message || "Erreur lors du téléchargement");
      } finally {
        setCvUploading(false);
      }
    };
    
    reader.onerror = () => {
      toast.error("Erreur de lecture du fichier");
      setCvUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCv,
    // On retire la contrainte stricte MIME type car elle bug souvent sous Windows.
    // On filtre manuellement l'extension dans onDropCv.
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const handleRemoveCv = async () => {
    if (!confirm("Voulez-vous vraiment supprimer votre CV ?")) return;
    try {
      await removeCvMutation.mutateAsync();
      toast.success("CV supprimé avec succès.");
      utils.candidate.getProfile.invalidate();
    } catch (e) {
      toast.error("Erreur lors de la suppression du CV");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center p-4">
        <Card className="glass-panel max-w-md rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold">Connexion requise</h2>
          <Button onClick={() => navigate("/")} className="mt-6 w-full">Retour à l'accueil</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen">
      <header className="border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between">
            <BrandLogo onClick={() => navigate("/")} />
            <ThemeToggle />
          </div>
          <Button onClick={() => navigate("/dashboard")} variant="ghost" className="mb-5">
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">Modifier mon profil</h1>
              <p className="mt-1 text-muted-foreground">Gardez vos informations candidat à jour pour améliorer le matching.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Card className="pro-card max-w-3xl rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nom complet" hint="Fourni par votre compte Manus">
                <Input type="text" value={user?.name || ""} disabled className="bg-muted" />
              </Field>
              <Field label="Email" hint="Fourni par votre compte Manus">
                <Input type="email" value={user?.email || ""} disabled className="bg-muted" />
              </Field>
              <Field label="Téléphone">
                <Input type="tel" placeholder="+212 6XX XXX XXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </Field>
              <Field label="Localisation">
                <Input type="text" placeholder="Casablanca, Maroc" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </Field>
            </div>

            <Field label="Biographie">
              <Textarea
                placeholder="Parlez de vos objectifs professionnels, expériences clés et secteurs ciblés..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={5}
              />
            </Field>

            {/* CV Section */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Mon CV (PDF, DOC)</h3>
              
              {(profile as any)?.cvUrl && (profile as any)?.cvFileName ? (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{(profile as any).cvFileName}</p>
                      <a 
                        href={(profile as any).cvUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        Afficher le document
                      </a>
                    </div>
                  </div>
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={handleRemoveCv}
                    disabled={removeCvMutation.isPending}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    {removeCvMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </Button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? "border-indigo-500 bg-indigo-50/50"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <input {...getInputProps()} />
                  {cvUploading || uploadCvMutation.isPending ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                      <p className="text-indigo-600 font-medium">Téléchargement en cours...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-indigo-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UploadCloud className="w-6 h-6 text-indigo-600" />
                      </div>
                      <p className="font-medium text-slate-900 mb-1">
                        Glissez-déposez votre CV ici
                      </p>
                      <p className="text-sm text-slate-500 mb-4">ou cliquez pour parcourir les fichiers</p>
                      <Button type="button" variant="outline" size="sm" className="rounded-full pointer-events-none">
                        Sélectionner un fichier
                      </Button>
                    </>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                Ce CV sera utilisé automatiquement lorsque vous postulez à une offre ou lors du matching IA.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4" />
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="bg-white/70">
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-950">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
