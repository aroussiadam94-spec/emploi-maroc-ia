import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Briefcase, MapPin, Building2, ExternalLink, RefreshCw, X, Heart, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";

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
  
  // Fetch jobs
  const { data: jobsResponse, isLoading, refetch } = trpc.jobs.getSwipeJobs.useQuery({ limit: 15 });
  const applyMutation = trpc.jobs.submitApplication.useMutation();

  const [jobs, setJobs] = useState<SwipeJob[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchScore, setMatchScore] = useState<{ score: number; reason: string } | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  // Framer motion values for the top card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-20, 20]);
  const opacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

  // Icons opacity based on drag direction
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [0, -150], [0, 1]);

  useEffect(() => {
    if (jobsResponse) {
      // Filter out previously swiped jobs from localStorage
      const swiped = JSON.parse(localStorage.getItem("swiped_jobs") || "[]");
      const filtered = jobsResponse.filter((j: any) => !swiped.includes(j.id));
      setJobs(filtered);
      setCurrentIndex(0);
    }
  }, [jobsResponse]);

  const currentJob = jobs[currentIndex];

  useEffect(() => {
    // Generate AI Match Score when current job changes
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

      // Mock user profile summary for the demo
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
      // Fallback
      setMatchScore({ score: Math.floor(Math.random() * 40) + 50, reason: "Analyse générée par le système par défaut." });
    } finally {
      setIsScoring(false);
    }
  };

  const handleSwipe = async (direction: "left" | "right", job: SwipeJob) => {
    // Save to local storage to prevent showing again
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
    x.set(0); // reset position
  };

  const onDragEnd = (e: any, info: any) => {
    if (!currentJob) return;
    if (info.offset.x > SWIPE_THRESHOLD) {
      handleSwipe("right", currentJob);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      handleSwipe("left", currentJob);
    } else {
      // Snap back
    }
  };

  const manualSwipe = (direction: "left" | "right") => {
    if (!currentJob) return;
    // Animate out
    x.set(direction === "right" ? 500 : -500);
    setTimeout(() => {
      handleSwipe(direction, currentJob);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center overflow-hidden">
      {/* Header */}
      <div className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-10">
        <BrandLogo onClick={() => navigate("/")} />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
            Mode Swipe
          </Badge>
        </div>
      </div>

      <div className="flex-1 w-full max-w-md relative flex items-center justify-center p-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-indigo-300">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Recherche des meilleures offres...</p>
          </div>
        ) : jobs.length === 0 || currentIndex >= jobs.length ? (
          <div className="text-center text-slate-400 space-y-4">
            <RefreshCw className="w-12 h-12 mx-auto text-slate-600 mb-4" />
            <h2 className="text-xl font-bold text-slate-200">Plus d'offres disponibles</h2>
            <p className="text-sm">Vous avez exploré toutes les offres suggérées.</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4 border-slate-700 hover:bg-slate-800">
              Rafraîchir les offres
            </Button>
            <Button onClick={() => navigate("/search")} className="mt-2 w-full">
              Retour à la recherche
            </Button>
          </div>
        ) : (
          <div className="relative w-full h-[600px] max-h-[75vh]">
            <AnimatePresence>
              {jobs.slice(currentIndex, currentIndex + 3).reverse().map((job, idx, arr) => {
                const isTop = idx === arr.length - 1;
                
                // Stack visual effect
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
                    className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale, opacity: 1, y: yOffset }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="w-full h-full overflow-hidden flex flex-col bg-slate-900 border-slate-800 shadow-2xl relative group">
                      
                      {/* Swipe Overlays */}
                      {isTop && (
                        <>
                          <motion.div 
                            style={{ opacity: likeOpacity }} 
                            className="absolute top-8 left-8 z-20 border-4 border-emerald-500 text-emerald-500 rounded-lg px-4 py-2 font-black text-4xl uppercase tracking-widest rotate-[-15deg] bg-emerald-500/10 backdrop-blur-sm"
                          >
                            POSTULER
                          </motion.div>
                          <motion.div 
                            style={{ opacity: nopeOpacity }} 
                            className="absolute top-8 right-8 z-20 border-4 border-rose-500 text-rose-500 rounded-lg px-4 py-2 font-black text-4xl uppercase tracking-widest rotate-[15deg] bg-rose-500/10 backdrop-blur-sm"
                          >
                            PASSER
                          </motion.div>
                        </>
                      )}

                      {/* Header Image Gradient */}
                      <div className="h-32 bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 relative">
                        <div className="absolute -bottom-10 left-6">
                          <div className="w-20 h-20 rounded-2xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-2xl font-bold text-slate-400 shadow-lg">
                            {job.company.charAt(0)}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 p-6 pt-12 flex flex-col">
                        <div className="mb-4">
                          <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{job.title}</h2>
                          <div className="flex items-center gap-2 text-indigo-300 font-medium">
                            <Building2 className="w-4 h-4" />
                            {job.company}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {job.location && (
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                              <MapPin className="w-3 h-3 mr-1" />
                              {job.location}
                            </Badge>
                          )}
                          {job.sector && (
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                              <Briefcase className="w-3 h-3 mr-1" />
                              {job.sector}
                            </Badge>
                          )}
                          {job.salaryMin && job.salaryMax && (
                            <Badge variant="secondary" className="bg-emerald-900/30 text-emerald-400 border-emerald-800/50">
                              {job.salaryMin} - {job.salaryMax} {job.currency}
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 bottom-0 h-20 top-auto"></div>
                          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                            {job.description}
                          </p>
                        </div>

                        {/* AI Match Score (Only on top card) */}
                        {isTop && (
                          <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-2 relative z-10">
                              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-end">
                                  <span className="text-sm font-medium text-slate-200">Match IA</span>
                                  {isScoring ? (
                                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                                  ) : matchScore ? (
                                    <span className={`text-lg font-bold ${matchScore.score >= 80 ? 'text-emerald-400' : matchScore.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                                      {matchScore.score}%
                                    </span>
                                  ) : null}
                                </div>
                                {!isScoring && matchScore && (
                                  <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                    <motion.div 
                                      className={`h-full ${matchScore.score >= 80 ? 'bg-emerald-500' : matchScore.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${matchScore.score}%` }}
                                      transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            {!isScoring && matchScore && (
                              <p className="text-xs text-slate-400 relative z-10 mt-3 leading-relaxed">
                                {matchScore.reason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {jobs.length > 0 && currentIndex < jobs.length && (
        <div className="flex items-center justify-center gap-6 pb-12 pt-4">
          <button 
            onClick={() => manualSwipe("left")}
            className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50 transition-colors shadow-xl"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button 
            onClick={() => {
              window.open(`/jobs/${currentJob?.id}`, "_blank");
            }}
            className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors shadow-xl"
          >
            <ExternalLink className="w-5 h-5" />
          </button>

          <button 
            onClick={() => manualSwipe("right")}
            className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-colors shadow-xl"
          >
            <Heart className="w-7 h-7 fill-emerald-500/20" />
          </button>
        </div>
      )}
    </div>
  );
}
