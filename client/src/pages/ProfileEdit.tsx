import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Save, UserRound, UploadCloud, FileText, Loader2, Trash2 } from "lucide-react";
import { useLocation } from "wouter"; 
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import BrandLogo from "@/components/BrandLogo";
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
      <div className="app-shell flex min-h-screen items-center justify-center p-4" style={{ background: "#07090F" }}>
        <div className="max-w-md rounded-2xl p-10 text-center" style={{ background: "rgba(14,16,32,0.85)", border: "1px solid rgba(201,168,76,0.15)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
          <h2 className="mb-4 text-2xl font-black text-[#F0EDE6]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Connexion requise</h2>
          <button onClick={() => navigate("/")} className="btn-gold w-full rounded-xl py-3 text-sm">Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen" style={{ background: "#07090F" }}>
      <header className="nav-glass" style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between">
            <BrandLogo onClick={() => navigate("/")} />
          </div>
          
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-5 flex items-center gap-2 text-sm text-[#8B7D6B] transition-colors hover:text-[#C9A84C]"
          >
            <ArrowLeft size={15} /> Retour au tableau de bord
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C" }}>
              <UserRound size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#F0EDE6]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Modifier mon profil
              </h1>
              <p className="mt-1 text-sm text-[#8B7D6B]">Gardez vos informations à jour pour améliorer le matching IA.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mx-auto max-w-3xl rounded-3xl p-8" style={{ background: "rgba(14,16,32,0.85)", border: "1px solid rgba(201,168,76,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Nom complet" hint="Fourni par votre compte">
                <input
                  type="text"
                  value={user?.name || ""}
                  disabled
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.08)", color: "#8B7D6B" }}
                />
              </Field>
              <Field label="Email" hint="Fourni par votre compte">
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.08)", color: "#8B7D6B" }}
                />
              </Field>
              <Field label="Téléphone">
                <input
                  type="tel"
                  placeholder="+212 6XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:border-[#C9A84C]/50"
                  style={{ background: "rgba(14,16,32,0.6)", border: "1px solid rgba(201,168,76,0.2)", color: "#F0EDE6" }}
                />
              </Field>
              <Field label="Localisation">
                <input
                  type="text"
                  placeholder="Casablanca, Maroc"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:border-[#C9A84C]/50"
                  style={{ background: "rgba(14,16,32,0.6)", border: "1px solid rgba(201,168,76,0.2)", color: "#F0EDE6" }}
                />
              </Field>
            </div>

            <Field label="Biographie">
              <textarea
                placeholder="Parlez de vos objectifs professionnels, expériences clés et secteurs ciblés..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:border-[#C9A84C]/50"
                style={{ background: "rgba(14,16,32,0.6)", border: "1px solid rgba(201,168,76,0.2)", color: "#F0EDE6" }}
              />
            </Field>

            {/* CV Section */}
            <div className="border-t border-[rgba(201,168,76,0.12)] pt-8">
              <h3 className="mb-4 text-lg font-bold text-[#F0EDE6]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Mon CV (PDF, DOC)</h3>
              
              {(profile as any)?.cvUrl && (profile as any)?.cvFileName ? (
                <div
                  className="flex items-center justify-between rounded-2xl p-5"
                  style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#F0EDE6]">{(profile as any).cvFileName}</p>
                      <a 
                        href={(profile as any).cvUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#C9A84C] hover:underline"
                      >
                        Afficher le document
                      </a>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleRemoveCv}
                    disabled={removeCvMutation.isPending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#E07A5F] transition-colors hover:bg-[rgba(224,122,95,0.1)]"
                  >
                    {removeCvMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className="cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all"
                  style={{
                    borderColor: isDragActive ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.15)",
                    background: isDragActive ? "rgba(201,168,76,0.05)" : "transparent"
                  }}
                >
                  <input {...getInputProps()} />
                  {cvUploading || uploadCvMutation.isPending ? (
                    <div className="flex flex-col items-center">
                      <Loader2 size={32} className="mb-4 animate-spin text-[#C9A84C]" />
                      <p className="font-semibold text-[#C9A84C]">Téléchargement en cours...</p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(201,168,76,0.10)", color: "#C9A84C" }}>
                        <UploadCloud size={24} />
                      </div>
                      <p className="mb-2 text-sm font-bold text-[#F0EDE6]">Glissez-déposez votre CV ici</p>
                      <p className="mb-6 text-xs text-[#8B7D6B]">ou cliquez pour parcourir (Max 5MB)</p>
                      <button type="button" className="btn-outline-gold rounded-xl px-5 py-2.5 text-sm pointer-events-none">
                        Sélectionner un fichier
                      </button>
                    </>
                  )}
                </div>
              )}
              <p className="mt-4 text-xs text-[#8B7D6B]">
                Ce CV sera utilisé automatiquement lors de vos candidatures et pour le matching IA.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-[rgba(201,168,76,0.12)] pt-6 sm:flex-row">
              <button type="submit" disabled={loading} className="btn-gold flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
              <button type="button" onClick={() => navigate("/dashboard")} className="btn-outline-gold rounded-xl px-7 py-3 text-sm">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#F0EDE6]">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs font-medium text-[#8B7D6B]">{hint}</span>}
    </label>
  );
}
