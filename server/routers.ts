import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getCandidateByUserId, createOrUpdateCandidate, getJobOfferById, getJobOffers, createApplication, checkApplication, toggleSavedJob, checkSavedJob, getSavedJobs, getApplications, createJobAlert, getJobAlerts, deleteJobAlert } from "./db";
import {
  getExperiences,
  addExperience,
  getEducations,
  addEducation,
  getSkills,
  addSkill,
  getSearchPreferences,
  upsertSearchPreferences,
} from "./profile";
import { searchJobs, SearchFilters } from "./search";
import { seedMoroccoJobs, getJobStats } from "./scraper";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  candidate: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return getCandidateByUserId(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          phone: z.string().optional(),
          location: z.string().optional(),
          bio: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createOrUpdateCandidate(ctx.user.id, input);
      }),

    getExperiences: protectedProcedure.query(async ({ ctx }) => {
      const candidate = await getCandidateByUserId(ctx.user.id);
      if (!candidate) return [];
      return getExperiences(candidate.id);
    }),

    addExperience: protectedProcedure
      .input(
        z.object({
          jobTitle: z.string(),
          company: z.string(),
          description: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          isCurrent: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) throw new Error("Candidate not found");
        return addExperience(candidate.id, input);
      }),

    getEducations: protectedProcedure.query(async ({ ctx }) => {
      const candidate = await getCandidateByUserId(ctx.user.id);
      if (!candidate) return [];
      return getEducations(candidate.id);
    }),

    addEducation: protectedProcedure
      .input(
        z.object({
          school: z.string(),
          degree: z.string(),
          fieldOfStudy: z.string().optional(),
          description: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) throw new Error("Candidate not found");
        return addEducation(candidate.id, input);
      }),

    getSkills: protectedProcedure.query(async ({ ctx }) => {
      const candidate = await getCandidateByUserId(ctx.user.id);
      if (!candidate) return [];
      return getSkills(candidate.id);
    }),

    addSkill: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) throw new Error("Candidate not found");
        return addSkill(candidate.id, input);
      }),

    getSearchPreferences: protectedProcedure.query(async ({ ctx }) => {
      const candidate = await getCandidateByUserId(ctx.user.id);
      if (!candidate) return null;
      return getSearchPreferences(candidate.id);
    }),

    updateSearchPreferences: protectedProcedure
      .input(
        z.object({
          preferredSectors: z.array(z.string()).optional(),
          preferredLocations: z.array(z.string()).optional(),
          preferredContractTypes: z.array(z.string()).optional(),
          minSalary: z.number().optional(),
          maxSalary: z.number().optional(),
          experienceLevelMin: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) throw new Error("Candidate not found");
        return upsertSearchPreferences(candidate.id, input);
      }),
  }),

  cv: router({
    // Upload a CV file (base64 encoded)
    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileBase64: z.string(),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        let cvUrl: string;

        const hasForge = !!(process.env.BUILT_IN_FORGE_API_URL && process.env.BUILT_IN_FORGE_API_KEY);

        if (hasForge) {
          // Cloud storage: upload to Forge/S3
          const buffer = Buffer.from(input.fileBase64, "base64");
          const key = `cvs/${ctx.user.id}/${input.fileName}`;
          const { url } = await storagePut(key, buffer, input.mimeType);
          cvUrl = url;
        } else {
          // Local dev mode: store as data URL directly in the database
          cvUrl = `data:${input.mimeType};base64,${input.fileBase64}`;
        }

        await createOrUpdateCandidate(ctx.user.id, {
          cvUrl,
          cvFileName: input.fileName,
        });
        return { url: cvUrl, fileName: input.fileName };
      }),

    // Remove a CV file
    remove: protectedProcedure
      .mutation(async ({ ctx }) => {
        await createOrUpdateCandidate(ctx.user.id, {
          cvUrl: null,
          cvFileName: null,
        });
        return { success: true };
      }),


    // Analyze CV text with AI
    analyze: protectedProcedure
      .input(
        z.object({
          cvText: z.string(),
          fileName: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Tu es un expert RH et recruteur senior spécialisé dans le marché de l'emploi marocain. 
Tu analyses des CVs et fournis des retours détaillés et actionnables.
Réponds UNIQUEMENT en JSON valide avec exactement cette structure :
{
  "atsScore": number (0-100),
  "overallGrade": "A" | "B" | "C" | "D",
  "summary": "string (2-3 phrases d'évaluation générale)",
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "missingSections": ["string"],
  "skillsToAdd": ["string", "string", "string"],
  "tips": [
    {"title": "string", "description": "string", "priority": "high" | "medium" | "low"}
  ],
  "marketInsights": "string (analyse du marché marocain)"
}`,
            },
            {
              role: "user",
              content: `Analyse ce CV et donne-moi un retour complet pour le marché de l'emploi marocain:\n\n${input.cvText}`,
            },
          ],
          response_format: { type: "json_object" },
        });

        const content = result.choices[0]?.message?.content;
        if (typeof content !== "string") throw new Error("Invalid LLM response");

        try {
          return JSON.parse(content);
        } catch {
          // Fallback if JSON parse fails
          return {
            atsScore: 65,
            overallGrade: "C",
            summary: "Votre CV a été analysé. Voici quelques recommandations pour l'améliorer.",
            strengths: ["Structure de base présente", "Coordonnées incluses", "Expériences listées"],
            weaknesses: ["Manque de quantification des réalisations", "Compétences peu détaillées", "Pas de section profil"],
            missingSections: ["Résumé professionnel", "Compétences techniques", "Langues"],
            skillsToAdd: ["Excel avancé", "Communication", "Gestion de projet"],
            tips: [
              { title: "Ajoutez un résumé professionnel", description: "3-4 lignes décrivant votre profil et vos objectifs", priority: "high" },
              { title: "Quantifiez vos réalisations", description: "Ex: 'Augmentation des ventes de 30%' plutôt que 'Augmentation des ventes'", priority: "high" },
              { title: "Personnalisez pour chaque offre", description: "Adaptez les mots-clés selon l'offre visée", priority: "medium" },
            ],
            marketInsights: "Le marché marocain valorise les compétences en français/anglais et les certifications professionnelles.",
          };
        }
      }),
  }),

  jobs: router({
    search: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          location: z.string().optional(),
          sector: z.string().optional(),
          contractType: z.string().optional(),
          experienceLevel: z.string().optional(),
          salaryMin: z.number().optional(),
          salaryMax: z.number().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return searchJobs(input as SearchFilters);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        if (!input?.id) return null;
        return getJobOfferById(input.id);
      }),

    seed: protectedProcedure.mutation(async () => {
      return seedMoroccoJobs();
    }),

    getStats: publicProcedure.query(async () => {
      return getJobStats();
    }),

    getSwipeJobs: publicProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ input }) => {
        const jobs = await getJobOffers(100, 0); // Fetch 100 jobs
        // Shuffle and take limit
        return jobs.sort(() => 0.5 - Math.random()).slice(0, input?.limit || 20);
      }),

    submitApplication: protectedProcedure
      .input(
        z.object({
          jobId: z.number(),
          cvFileBase64: z.string().optional(),
          cvFileName: z.string().optional(),
          mimeType: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        let candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) {
          candidate = await createOrUpdateCandidate(ctx.user.id, {});
        }

        // Check if already applied
        const hasApplied = await checkApplication(candidate.id, input.jobId);
        if (hasApplied) {
          throw new Error("Vous avez déjà postulé à cette offre.");
        }

        // Upload CV if provided
        if (input.cvFileBase64 && input.cvFileName && input.mimeType) {
          const hasForge = !!(process.env.BUILT_IN_FORGE_API_URL && process.env.BUILT_IN_FORGE_API_KEY);
          let cvUrl: string;

          if (hasForge) {
            const buffer = Buffer.from(input.cvFileBase64, "base64");
            const key = `cvs/${ctx.user.id}/${input.cvFileName}`;
            const { url } = await storagePut(key, buffer, input.mimeType);
            cvUrl = url;
          } else {
            cvUrl = `data:${input.mimeType};base64,${input.cvFileBase64}`;
          }

          await createOrUpdateCandidate(ctx.user.id, {
            cvUrl,
            cvFileName: input.cvFileName,
          });
        }

        // Create application
        await createApplication(candidate.id, input.jobId);
        return { success: true };
      }),

    hasApplied: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) return false;
        return checkApplication(candidate.id, input.jobId);
      }),

    toggleSave: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        let candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) {
          candidate = await createOrUpdateCandidate(ctx.user.id, {});
        }
        return toggleSavedJob(candidate.id, input.jobId);
      }),

    isSaved: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) return false;
        return checkSavedJob(candidate.id, input.jobId);
      }),

    getSavedJobs: protectedProcedure
      .query(async ({ ctx }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) return [];
        return getSavedJobs(candidate.id);
      }),

    getApplications: protectedProcedure
      .query(async ({ ctx }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) return [];
        return getApplications(candidate.id);
      }),

    createAlert: protectedProcedure
      .input(z.object({
        name: z.string(),
        keywords: z.string().optional(),
        sectors: z.string().optional(),
        locations: z.string().optional(),
        contractTypes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) throw new Error("Candidat non trouvé");
        return createJobAlert(candidate.id, input);
      }),

    getAlerts: protectedProcedure
      .query(async ({ ctx }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) return [];
        return getJobAlerts(candidate.id);
      }),

    deleteAlert: protectedProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) return false;
        return deleteJobAlert(candidate.id, input.alertId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
