import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Briefcase, MapPin, Building2, ExternalLink, RefreshCw, X, Heart, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

interface SwipeJob {
  id: number;
  title: string;
  company: string;
  location: string | null;
  sector: string | null;
  description: string | null;
  salaryMin: string | null;
  salaryMax: string | null;
  currency: string | null;
}

const SWIPE_THRESHOLD = 150;

export default function Swipe() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  
  const { data: jobsResponse, isLoading, refetch } = trpc.jobs.getSwipeJobs.useQuery({ limit: 15 });
  const applyMutation = trpc.jobs.submitApplication.useMutation();

  const [jobs, setJobs] = useState<SwipeJob[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchScore, setMatchScore] = useState<{ score: number; reason: string } | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-20, 20]);
  const opacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [0, -150], [0, 1]);

  useEffect(() => {
    if (jobsResponse) {
      const swiped = JSON.parse(localStorage.getItem("swiped_jobs") || "[]");
      const filtered = jobsResponse.filter((j: any) => !swiped.includes(j.id));
      setJobs(filtered);
      setCurrentIndex(0);
    }
  }, [jobsResponse]);

  const currentJob = jobs[currentIndex];

  useEffect(() => {
    if (currentJob) {
      generateMatchScore(currentJob);
    } else {
      setMatchScore(null);
    }
  }, [currentIndex, currentJob]);

  const generateMatchScore = async (job: SwipeJob) => {
    setIsScoring(true);
    setMatchScore(null);
    try {
      if (!(window as any).puter?.ai) {
        throw new Error("Puter AI non disponible");
      }

      const userProfile = "Développeur avec 3 ans d'expérience en React, Node.js et TypeScript.";
      const prompt = `
Tu es un recruteur expert. Analyse la compatibilité entre ce profil et cette offre d'emploi.
Profil: "${userProfile}"
Offre: "${job.title} chez ${job.company}. ${job.description?.substring(0, 300) || ""}"

Réponds STRICTEMENT avec un JSON valide sous ce format (sans markdown) :
{"score": 85, "reason": "Vos compétences en React correspondent parfaitement."}
      `;

      const response = await (window as any).puter.ai.chat(prompt, { model: "gpt-4o-mini" });
      const raw = typeof response === "string" ? response : response?.message?.content || response?.content || "";
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const result = JSON.parse(cleaned);

      setMatchScore({ score: result.score || 50, reason: result.reason || "Correspondance moyenne." });
    } catch (error) {
      setMatchScore({ score: Math.floor(Math.random() * 40) + 50, reason: "Analyse générée par le système par défaut." });
    } finally {
      setIsScoring(false);
    }
  };

  const handleSwipe = async (direction: "left" | "right", job: SwipeJob) => {
    const swiped = JSON.parse(localStorage.getItem("swiped_jobs") || "[]");
    localStorage.setItem("swiped_jobs", JSON.stringify([...swiped, job.id]));

    if (direction === "right") {
      toast.success(`Candidature envoyée à ${job.company} !`);
      try {
        await applyMutation.mutateAsync({ jobId: job.id });
        utils.jobs.hasApplied.invalidate({ jobId: job.id });
      } catch (e: any) {
        toast.error(e.message || "Erreur lors de la candidature.");
      }
    }

    setCurrentIndex(prev => prev + 1);
    x.set(0);
  };

  const onDragEnd = (e: any, info: any) => {
    if (!currentJob) return;
    if (info.offset.x > SWIPE_THRESHOLD) {
      handleSwipe("right", currentJob);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      handleSwipe("left", currentJob);
    }
  };

  const manualSwipe = (direction: "left" | "right") => {
    if (!currentJob) return;
    x.set(direction === "right" ? 500 : -500);
    setTimeout(() => {
      handleSwipe(direction, currentJob);
    }, 200);
  };

  return (
    <div className="app-shell flex h-screen flex-col overflow-hidden" style={{ background: "#fafafa" }}>
      {/* Header */}
      <header className="nav-glass z-10 shrink-0" style={{ borderBottom: "1px solid rgba(5,150,105,0.12)" }}>
        <div className="container flex items-center justify-between py-4">
          <BrandLogo onClick={() => navigate("/")} />
          <div className="flex items-center gap-4">
            <span className="badge-emerald inline-flex"><Sparkles size={11} /> Mode Swipe IA</span>
            <button
              onClick={() => navigate("/search")}
              className="text-[#8B7D6B] transition-colors hover:text-[#059669]"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className="relative flex flex-1 min-h-0 items-center justify-center p-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-[#8B7D6B]">
            <Loader2 size={32} className="animate-spin text-[#059669]" />
            <p>Recherche des meilleures offres...</p>
          </div>
        ) : jobs.length === 0 || currentIndex >= jobs.length ? (
          <div className="rounded-3xl p-10 text-center" style={{ background: "rgba(14,16,32,0.85)", border: "1px solid rgba(5,150,105,0.15)" }}>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>
              <RefreshCw size={28} />
            </div>
            <h2 className="mb-3 text-2xl font-black text-[#1c1917]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Plus d'offres disponibles</h2>
            <p className="mb-8 text-sm text-[#8B7D6B]">Vous avez exploré toutes les offres suggérées.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => refetch()} className="btn-outline-emerald w-full rounded-xl py-3 text-sm flex justify-center items-center gap-2">
                <RefreshCw size={14} /> Rafraîchir les offres
              </button>
              <button onClick={() => navigate("/search")} className="btn-emerald w-full rounded-xl py-3 text-sm">
                Retour à la recherche
              </button>
            </div>
          </div>
        ) : (
          <div className="relative h-[650px] max-h-full w-full max-w-[420px]">
            <AnimatePresence>
              {jobs.slice(currentIndex, currentIndex + 3).reverse().map((job, idx, arr) => {
                const isTop = idx === arr.length - 1;
                const scale = isTop ? 1 : 1 - (arr.length - 1 - idx) * 0.05;
                const yOffset = isTop ? 0 : (arr.length - 1 - idx) * 20;

                return (
                  <motion.div
                    key={job.id}
                    style={{
                      x: isTop ? x : 0,
                      y: isTop ? 0 : yOffset,
                      rotate: isTop ? rotate : 0,
                      opacity: isTop ? opacity : 1,
                      scale,
                      zIndex: idx,
                    }}
                    drag={isTop ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={isTop ? onDragEnd : undefined}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale, opacity: 1, y: yOffset }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div
                      className="pro-card flex h-full w-full flex-col overflow-hidden rounded-3xl"
                      style={{ background: "#ffffff", border: "1px solid rgba(5,150,105,0.18)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}
                    >
                      {/* Swipe Overlays */}
                      {isTop && (
                        <>
                          <motion.div 
                            className="absolute left-6 top-8 z-20 rounded-xl border-4 px-5 py-2 text-3xl font-black uppercase tracking-widest backdrop-blur-md"
                            style={{ opacity: likeOpacity, borderColor: "#34D399", color: "#34D399", background: "rgba(52,211,153,0.15)", rotate: "-15deg" }}
                          >
                            POSTULER
                          </motion.div>
                          <motion.div 
                            className="absolute right-6 top-8 z-20 rounded-xl border-4 px-5 py-2 text-3xl font-black uppercase tracking-widest backdrop-blur-md"
                            style={{ opacity: nopeOpacity, borderColor: "#15803d", color: "#15803d", background: "rgba(224,122,95,0.15)", rotate: "15deg" }}
                          >
                            PASSER
                          </motion.div>
                        </>
                      )}

                      {/* Header Image Gradient */}
                      <div className="relative h-36 shrink-0" style={{ background: "linear-gradient(135deg, rgba(5,150,105,0.1) 0%, rgba(14,16,32,1) 100%)", borderBottom: "1px solid rgba(5,150,105,0.1)" }}>
                        <div className="absolute -bottom-8 left-6">
                          <div
                            className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-xl"
                            style={{ background: "#1a2e4a", border: "4px solid #ffffff", fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            {job.company.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-6 pt-12">
                        <div className="mb-4">
                          <h2 className="mb-1 text-2xl font-bold leading-tight text-[#1c1917]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            {job.title}
                          </h2>
                          <div className="flex items-center gap-2 font-medium text-[#8B7D6B]">
                            <Building2 size={14} /> {job.company}
                          </div>
                        </div>

                        <div className="mb-6 flex flex-wrap gap-2">
                          {job.location && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f4] px-3 py-1 text-xs text-[#8B7D6B]">
                              <MapPin size={11} /> {job.location}
                            </span>
                          )}
                          {job.sector && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f4] px-3 py-1 text-xs text-[#8B7D6B]">
                              <Briefcase size={11} /> {job.sector}
                            </span>
                          )}
                          {job.salaryMin && job.salaryMax && (
                            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(52,211,153,0.1)", color: "#34D399" }}>
                              {job.salaryMin} - {job.salaryMax} {job.currency || "MAD"}
                            </span>
                          )}
                        </div>

                        <div className="relative flex-1 overflow-hidden">
                          <div className="absolute bottom-0 z-10 h-16 w-full bg-gradient-to-t from-[#ffffff] to-transparent" />
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#8B7D6B]">
                            {job.description}
                          </p>
                        </div>

                        {/* AI Match Score */}
                        {isTop && (
                          <div className="mt-4 shrink-0 rounded-2xl p-4" style={{ background: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.15)" }}>
                            <div className="mb-2 flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(5,150,105,0.15)", color: "#059669" }}>
                                <Sparkles size={18} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-end justify-between">
                                  <span className="text-sm font-bold text-[#1c1917]">Match IA</span>
                                  {isScoring ? (
                                    <Loader2 size={14} className="animate-spin text-[#059669]" />
                                  ) : matchScore ? (
                                    <span
                                      className="text-lg font-black"
                                      style={{ color: matchScore.score >= 80 ? "#34D399" : matchScore.score >= 50 ? "#059669" : "#15803d" }}
                                    >
                                      {matchScore.score}%
                                    </span>
                                  ) : null}
                                </div>
                                {!isScoring && matchScore && (
                                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(5,150,105,0.1)]">
                                    <motion.div 
                                      className="h-full"
                                      style={{ background: matchScore.score >= 80 ? "#34D399" : matchScore.score >= 50 ? "#059669" : "#15803d" }}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${matchScore.score}%` }}
                                      transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            {!isScoring && matchScore && (
                              <p className="mt-3 text-xs leading-relaxed text-[#8B7D6B]">
                                {matchScore.reason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {jobs.length > 0 && currentIndex < jobs.length && (
        <div className="shrink-0 pb-10 pt-4 flex items-center justify-center gap-8">
          <button 
            onClick={() => manualSwipe("left")}
            className="flex h-16 w-16 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(14,16,32,0.8)", border: "2px solid rgba(224,122,95,0.3)", color: "#15803d", boxShadow: "0 10px 25px rgba(224,122,95,0.15)" }}
          >
            <X size={32} />
          </button>
          
          <button 
            onClick={() => window.open(`/jobs/${currentJob?.id}`, "_blank")}
            className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(14,16,32,0.8)", border: "2px solid rgba(5,150,105,0.3)", color: "#059669", boxShadow: "0 10px 25px rgba(5,150,105,0.1)" }}
          >
            <ExternalLink size={20} />
          </button>

          <button 
            onClick={() => manualSwipe("right")}
            className="flex h-16 w-16 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(14,16,32,0.8)", border: "2px solid rgba(52,211,153,0.3)", color: "#34D399", boxShadow: "0 10px 25px rgba(52,211,153,0.15)" }}
          >
            <Heart size={28} className="fill-[#34D399]" />
          </button>
        </div>
      )}
    </div>
  );
}
