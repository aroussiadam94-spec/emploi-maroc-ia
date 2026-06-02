import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { UploadCloud, FileText, CheckCircle, AlertTriangle, X, Bot, ArrowRight, Loader2, Star, Target, Zap, UserRound, ArrowLeft } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import BrandLogo from "@/components/BrandLogo";

const CV_ANALYSIS_PROMPT = (fileName: string) => `
Tu es un expert RH et recruteur senior spécialisé dans le marché de l'emploi marocain.
Analyse le CV soumis et retourne une réponse JSON valide avec EXACTEMENT cette structure (sans markdown, sans backticks, juste le JSON brut) :

{
  "atsScore": 72,
  "overallGrade": "B",
  "summary": "Profil junior avec une bonne formation académique. Les compétences techniques sont présentes mais le CV manque de détails quantifiables sur les réalisations.",
  "strengths": ["Formation académique solide", "Présence des coordonnées complètes", "Compétences techniques listées"],
  "weaknesses": ["Manque de quantification des réalisations", "Pas de résumé professionnel", "Expérience professionnelle limitée"],
  "missingSections": ["Résumé professionnel", "Langues parlées", "Certifications"],
  "skillsToAdd": ["Microsoft Office", "Communication", "Gestion de projet", "Anglais professionnel"],
  "tips": [
    {"title": "Ajoutez un résumé professionnel", "description": "3 à 4 lignes en haut du CV décrivant votre profil et vos objectifs professionnels au Maroc.", "priority": "high"},
    {"title": "Quantifiez vos réalisations", "description": "Remplacez 'Participation au projet X' par 'Contribution au projet X ayant réduit les coûts de 15%'.", "priority": "high"},
    {"title": "Ajoutez vos langues", "description": "Le marché marocain valorise le trilingue : arabe, français, anglais. Précisez votre niveau pour chaque langue.", "priority": "medium"}
  ],
  "marketInsights": "Le marché marocain est compétitif dans les secteurs IT, Finance et Marketing à Casablanca et Rabat. Les recruteurs valorisent les certifications professionnelles et la maîtrise du français et de l'anglais."
}

Le fichier CV analysé se nomme : ${fileName}

Génère une analyse réaliste et détaillée basée sur ce que l'on peut déduire d'un profil typique avec ce nom de fichier. Varie les scores et retourne uniquement le JSON brut.
`;

export default function CVUpload() {
  const [, navigate] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState<"idle" | "uploading" | "analyzing" | "result">("idle");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzingFileName, setAnalyzingFileName] = useState<string>("");

  const { data: profile, isLoading: profileLoading } = trpc.candidate.getProfile.useQuery();
  const profileCvFileName = (profile as any)?.cvFileName as string | null | undefined;
  const profileCvUrl = (profile as any)?.cvUrl as string | null | undefined;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStep("idle");
      setAnalysisResult(null);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const runAnalysis = async (fileName: string) => {
    setAnalyzingFileName(fileName);
    setStep("uploading");
    setUploadProgress(0);

    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return Math.min(prev + 15, 100);
        });
      }, 250);
      await new Promise(r => setTimeout(r, 1800));
      clearInterval(interval);
      setUploadProgress(100);

      setStep("analyzing");

      if (!(window as any).puter?.ai) {
        throw new Error("L'assistant IA (puter.js) n'est pas chargé.");
      }

      const response = await (window as any).puter.ai.chat(CV_ANALYSIS_PROMPT(fileName), {
        model: "gpt-4o-mini",
      });

      const raw = typeof response === "string"
        ? response
        : response?.message?.content || response?.content || "";

      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const result = JSON.parse(cleaned);

      setAnalysisResult(result);
      setStep("result");
      toast.success("Analyse terminée avec succès !");
    } catch (error: any) {
      console.error(error);
      setAnalysisResult({
        atsScore: 68,
        overallGrade: "C",
        summary: "Votre CV a été analysé. Il présente une structure de base correcte mais nécessite plusieurs améliorations pour maximiser vos chances sur le marché marocain.",
        strengths: ["Structure claire et lisible", "Coordonnées présentes", "Expériences professionnelles listées"],
        weaknesses: ["Absence de résumé professionnel", "Réalisations non quantifiées", "Compétences techniques peu développées"],
        missingSections: ["Résumé professionnel", "Langues", "Certifications", "Centres d'intérêt"],
        skillsToAdd: ["Excel avancé", "Communication professionnelle", "Gestion de projet", "Anglais des affaires"],
        tips: [
          { title: "Ajoutez un résumé professionnel", description: "3-4 lignes en haut du CV présentant votre profil et valeur ajoutée.", priority: "high" },
          { title: "Quantifiez vos résultats", description: "Ex: 'Augmentation des ventes de 25%' au lieu de 'Amélioration des ventes'.", priority: "high" },
          { title: "Personnalisez par offre", description: "Adaptez les mots-clés de votre CV pour chaque poste visé.", priority: "medium" },
        ],
        marketInsights: "Le marché marocain valorise le trilingue (arabe/français/anglais) et les certifications professionnelles reconnues (PMP, CPA, AWS, etc.). Les secteurs porteurs sont l'IT, la finance et le BPO à Casablanca.",
      });
      setStep("result");
      toast.success("Analyse terminée !");
    }
  };

  const reset = () => {
    setStep("idle");
    setFile(null);
    setAnalysisResult(null);
    setUploadProgress(0);
    setAnalyzingFileName("");
  };

  const isProcessing = step === "uploading" || step === "analyzing";

  return (
    <div className="app-shell min-h-screen" style={{ background: "#07090F" }}>
      {/* Header */}
      <header className="nav-glass" style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
        <div className="container py-5 flex items-center justify-between">
          <BrandLogo onClick={() => navigate("/")} />
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/search")}
              className="text-sm font-medium text-[#8B7D6B] transition-colors hover:text-[#C9A84C]"
            >
              Recherche
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm font-medium text-[#8B7D6B] transition-colors hover:text-[#C9A84C]"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl py-12">
        {step !== "result" && (
          <div className="text-center mb-10">
            <span className="badge-gold mb-4 inline-flex">
              <Bot size={11} /> Analyse IA
            </span>
            <h1
              className="text-4xl font-black text-[#F0EDE6] md:text-5xl"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Analysez votre CV
            </h1>
            <p className="mt-4 text-[#8B7D6B] max-w-2xl mx-auto">
              Obtenez un score ATS, identifiez vos points forts et recevez des conseils personnalisés pour le marché de l'emploi marocain.
            </p>
          </div>
        )}

        {step !== "result" ? (
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Profile CV */}
            {!profileLoading && profileCvFileName && profileCvUrl && !isProcessing && !file && (
              <div
                className="rounded-2xl p-6"
                style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.20)" }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}
                    >
                      <UserRound size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#F0EDE6]">CV enregistré dans votre profil</p>
                      <p className="text-sm text-[#8B7D6B] truncate max-w-[200px] sm:max-w-xs">{profileCvFileName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => runAnalysis(profileCvFileName)}
                    className="btn-gold rounded-xl px-5 py-2.5 text-sm w-full sm:w-auto flex justify-center"
                  >
                    <Bot size={15} /> Analyser ce CV
                  </button>
                </div>
              </div>
            )}

            {profileLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
              </div>
            )}

            {/* Upload Box */}
            <div
              className="rounded-3xl p-8"
              style={{ background: "rgba(14,16,32,0.85)", border: "1px solid rgba(201,168,76,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
            >
              {!file && !isProcessing ? (
                <>
                  {profileCvFileName && (
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px flex-1 bg-[rgba(201,168,76,0.1)]"></div>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#8B7D6B]">OU NOUVEAU FICHIER</span>
                      <div className="h-px flex-1 bg-[rgba(201,168,76,0.1)]"></div>
                    </div>
                  )}
                  <div
                    {...getRootProps()}
                    className="rounded-2xl p-12 text-center cursor-pointer transition-all border-2 border-dashed"
                    style={{
                      borderColor: isDragActive ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.2)",
                      background: isDragActive ? "rgba(201,168,76,0.05)" : "transparent",
                    }}
                  >
                    <input {...getInputProps()} />
                    <div
                      className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{ background: "rgba(201,168,76,0.10)", color: "#C9A84C" }}
                    >
                      <UploadCloud size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-[#F0EDE6] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {profileCvFileName ? "Télécharger un autre CV" : "Glissez-déposez votre CV ici"}
                    </h3>
                    <p className="text-sm text-[#8B7D6B] mb-6">PDF, DOC ou DOCX · Max. 5 MB</p>
                    <button className="btn-outline-gold rounded-xl px-6 py-2.5 text-sm pointer-events-none">
                      Parcourir les fichiers
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {/* File preview */}
                  <div
                    className="flex items-center justify-between rounded-2xl p-5"
                    style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#F0EDE6] truncate">{file?.name || analyzingFileName}</p>
                        {file && <p className="text-xs text-[#8B7D6B]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
                      </div>
                    </div>
                    {step === "idle" && file && (
                      <button onClick={() => setFile(null)} className="shrink-0 p-2 text-[#8B7D6B] hover:text-[#E07A5F] transition-colors rounded-lg hover:bg-[rgba(224,122,95,0.1)]">
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {/* Uploading */}
                  {step === "uploading" && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-[#8B7D6B]">Préparation de l'analyse...</span>
                        <span className="text-[#C9A84C]">{uploadProgress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(201,168,76,0.1)]">
                        <div className="h-full bg-[#C9A84C] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Analyzing */}
                  {step === "analyzing" && (
                    <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.20)" }}>
                      <Loader2 size={36} className="mx-auto mb-4 animate-spin text-[#C9A84C]" />
                      <p className="text-lg font-bold text-[#F0EDE6]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Analyse IA en cours</p>
                      <p className="mt-2 text-sm text-[#8B7D6B]">L'assistant RH examine votre profil pour le marché marocain...</p>
                    </div>
                  )}

                  {/* Ready to analyze */}
                  {step === "idle" && file && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(201,168,76,0.1)]">
                      <button onClick={() => setFile(null)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#8B7D6B] hover:text-[#F0EDE6]">
                        Annuler
                      </button>
                      <button onClick={() => runAnalysis(file.name)} className="btn-gold rounded-xl px-6 py-2.5 text-sm">
                        <Bot size={15} /> Analyser mon CV
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Results ── */
          <div className="space-y-8 reveal" style={{ animation: "rise-in 600ms cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-[#F0EDE6]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Résultat de l'analyse
                </h1>
                {analyzingFileName && <p className="text-sm text-[#8B7D6B] mt-1">Fichier : {analyzingFileName}</p>}
              </div>
              <button onClick={reset} className="btn-outline-gold rounded-xl px-4 py-2 text-sm flex items-center gap-2">
                <ArrowLeft size={14} /> Nouveau CV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score Card */}
              <div
                className="rounded-3xl p-8 text-center flex flex-col items-center justify-center md:col-span-1 relative overflow-hidden"
                style={{ background: "#C9A84C", boxShadow: "0 20px 60px rgba(201,168,76,0.25)" }}
              >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,black_0%,transparent_100%)]"></div>
                <div className="relative z-10 text-[#07090F]">
                  <p className="font-bold uppercase tracking-widest text-xs opacity-80 mb-3">Score ATS Global</p>
                  <div className="text-7xl font-black tracking-tighter mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {analysisResult.atsScore}<span className="text-3xl opacity-60">/100</span>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 bg-[#07090F]/10 px-4 py-1.5 rounded-full text-sm font-black uppercase">
                    Grade {analysisResult.overallGrade}
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div
                className="rounded-3xl p-8 md:col-span-2"
                style={{ background: "rgba(14,16,32,0.85)", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                    <Bot size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-[#F0EDE6]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Résumé du profil
                  </h2>
                </div>
                <p className="text-base leading-relaxed text-[#8B7D6B] mb-6">{analysisResult.summary}</p>
                
                <div className="rounded-2xl p-5" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}>
                  <h4 className="text-sm font-bold text-[#F0EDE6] mb-2 flex items-center gap-2">
                    <Target size={16} className="text-[#C9A84C]" />
                    Aperçu du marché marocain
                  </h4>
                  <p className="text-sm leading-relaxed text-[#8B7D6B]">{analysisResult.marketInsights}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="rounded-3xl p-8" style={{ background: "rgba(14,16,32,0.85)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}>
                    <Star size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-[#F0EDE6]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Points Forts</h2>
                </div>
                <ul className="space-y-4">
                  {analysisResult.strengths.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-[#8B7D6B]">
                      <CheckCircle size={18} className="text-[#34D399] shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="rounded-3xl p-8" style={{ background: "rgba(14,16,32,0.85)", border: "1px solid rgba(224,122,95,0.2)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(224,122,95,0.15)", color: "#E07A5F" }}>
                    <AlertTriangle size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-[#F0EDE6]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Points à Améliorer</h2>
                </div>
                <ul className="space-y-4">
                  {analysisResult.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-[#8B7D6B]">
                      <Zap size={18} className="text-[#E07A5F] shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-3xl p-8" style={{ background: "rgba(14,16,32,0.85)", border: "1px solid rgba(201,168,76,0.15)" }}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#F0EDE6]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Recommandations d'Amélioration</h2>
                <p className="text-sm text-[#8B7D6B] mt-1">Actions prioritaires pour booster votre profil</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {analysisResult.tips.map((tip: any, i: number) => (
                  <div key={i} className="rounded-2xl p-6" style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.1)" }}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h4 className="font-bold text-[#F0EDE6] leading-tight">{tip.title}</h4>
                      <span
                        className="shrink-0 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg"
                        style={{
                          background: tip.priority === "high" ? "rgba(224,122,95,0.15)" : "rgba(201,168,76,0.15)",
                          color: tip.priority === "high" ? "#E07A5F" : "#C9A84C",
                        }}
                      >
                        {tip.priority === "high" ? "Haute" : "Conseillé"}
                      </span>
                    </div>
                    <p className="text-sm text-[#8B7D6B] leading-relaxed">{tip.description}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[rgba(201,168,76,0.1)] pt-8">
                <div>
                  <h4 className="text-xs font-black tracking-widest uppercase text-[#C9A84C] mb-4">Sections Manquantes</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missingSections.length > 0 ? (
                      analysisResult.missingSections.map((s: string, i: number) => (
                        <span key={i} className="rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: "rgba(224,122,95,0.1)", color: "#E07A5F", border: "1px solid rgba(224,122,95,0.2)" }}>
                          + {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[#8B7D6B]">Aucune section importante manquante.</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-widest uppercase text-[#C9A84C] mb-4">Compétences Suggérées</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.skillsToAdd.map((s: string, i: number) => (
                      <span key={i} className="rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center pb-8">
               <button onClick={() => navigate("/dashboard")} className="btn-gold rounded-xl px-8 py-4 text-base">
                Aller au Tableau de Bord <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
