/**
 * server/routers.ts
 * tRPC application router – the single source of truth for all API endpoints.
 *
 * The router is organised into the following sub-routers:
 *   system    – infrastructure procedures (health-check, version, etc.).
 *   auth      – session management (me, logout).
 *   candidate – candidate profile, experiences, educations, skills, preferences.
 *   cv        – CV upload, removal, and AI analysis.
 *   jobs      – job search, detail, applications, saved jobs, alerts, swipe feed.
 *
 * Access control:
 *   publicProcedure    – no authentication required.
 *   protectedProcedure – requires a valid session; throws UNAUTHED if missing.
 */

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
// Database query helpers for core entities.
import { getCandidateByUserId, createOrUpdateCandidate, getJobOfferById, getJobOffers, createApplication, checkApplication, toggleSavedJob, checkSavedJob, getSavedJobs, getApplications, createJobAlert, getJobAlerts, deleteJobAlert } from "./db";
// Profile sub-resource helpers (experiences, educations, skills, preferences).
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
// Job search engine and seed/stats helpers.
import { searchJobs, SearchFilters } from "./search";
import { seedMoroccoJobs, getJobStats } from "./scraper";
// Cloud file storage helper.
import { storagePut } from "./storage";
// LLM integration for CV analysis.
import { invokeLLM } from "./_core/llm";
// Zod for input validation schemas.
import { z } from "zod";

export const appRouter = router({
  // ── System ────────────────────────────────────────────────────────────────
  // Health-check and platform info procedures (defined in _core/systemRouter).
  system: systemRouter,

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    /** Returns the currently authenticated user, or null for anonymous visitors. */
    me: publicProcedure.query(opts => opts.ctx.user),

    /** Clears the session cookie to log the user out. */
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      // maxAge: -1 instructs the browser to immediately expire the cookie.
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ── Candidate ─────────────────────────────────────────────────────────────
  candidate: router({
    /** Returns the candidate profile for the logged-in user. */
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return getCandidateByUserId(ctx.user.id);
    }),

    /** Updates top-level candidate fields: phone, location, bio. */
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

    /** Returns all work experiences for the logged-in candidate. */
    getExperiences: protectedProcedure.query(async ({ ctx }) => {
      const candidate = await getCandidateByUserId(ctx.user.id);
      if (!candidate) return [];
      return getExperiences(candidate.id);
    }),

    /** Adds a new work-experience entry to the candidate's profile. */
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

    /** Returns all education entries for the logged-in candidate. */
    getEducations: protectedProcedure.query(async ({ ctx }) => {
      const candidate = await getCandidateByUserId(ctx.user.id);
      if (!candidate) return [];
      return getEducations(candidate.id);
    }),

    /** Adds a new education entry to the candidate's profile. */
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

    /** Returns all skills for the logged-in candidate. */
    getSkills: protectedProcedure.query(async ({ ctx }) => {
      const candidate = await getCandidateByUserId(ctx.user.id);
      if (!candidate) return [];
      return getSkills(candidate.id);
    }),

    /** Adds a new skill entry to the candidate's profile. */
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

    /** Returns the job-search preferences for the logged-in candidate. */
    getSearchPreferences: protectedProcedure.query(async ({ ctx }) => {
      const candidate = await getCandidateByUserId(ctx.user.id);
      if (!candidate) return null;
      return getSearchPreferences(candidate.id);
    }),

    /** Creates or replaces the job-search preferences for the logged-in candidate. */
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

  // ── CV ────────────────────────────────────────────────────────────────────
  cv: router({
    // Upload a CV file (base64 encoded)
    /** Receives a base64-encoded CV file from the client and stores it.
     *  Uses Forge/S3 when cloud credentials are available; falls back to
     *  storing the data URI directly in the database for local development. */
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

        // Persist the CV URL and filename in the candidate's profile.
        await createOrUpdateCandidate(ctx.user.id, {
          cvUrl,
          cvFileName: input.fileName,
        });
        return { url: cvUrl, fileName: input.fileName };
      }),

    // Remove a CV file
    /** Clears the CV URL and filename from the candidate's profile. */
    remove: protectedProcedure
      .mutation(async ({ ctx }) => {
        await createOrUpdateCandidate(ctx.user.id, {
          cvUrl: null,
          cvFileName: null,
        });
        return { success: true };
      }),


    // Analyze CV text with AI
    /**
     * Sends the extracted CV text to the LLM and returns a structured
     * ATS analysis including score, strengths, weaknesses, and market insights
     * tailored to the Moroccan job market.
     * Falls back to hardcoded defaults if the LLM response is malformed JSON.
     */
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
          // Parse the JSON response from the LLM.
          return JSON.parse(content);
        } catch {
          // Fallback if JSON parse fails – return sensible defaults so the
          // UI doesn't break when the model produces unexpected output.
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

  // ── Jobs ──────────────────────────────────────────────────────────────────
  jobs: router({
    /**
     * Full-text and filtered job search. Public so unauthenticated visitors
     * can browse without logging in.
     */
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

    /** Returns a single job offer by its numeric ID. */
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        if (!input?.id) return null;
        return getJobOfferById(input.id);
      }),

    /** Seeds the database with the curated Moroccan job dataset.
     *  Protected so only authenticated users can trigger the seed. */
    seed: protectedProcedure.mutation(async () => {
      return seedMoroccoJobs();
    }),

    /** Returns basic statistics: total number of job offers in the database. */
    getStats: publicProcedure.query(async () => {
      return getJobStats();
    }),

    /** Returns a randomised subset of job offers for the swipe interface.
     *  Fetches 100 jobs and shuffles them so each session feels fresh. */
    getSwipeJobs: publicProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ input }) => {
        const jobs = await getJobOffers(100, 0); // Fetch 100 jobs
        // Shuffle and take limit
        return jobs.sort(() => 0.5 - Math.random()).slice(0, input?.limit || 20);
      }),

    /**
     * Submits a job application for the authenticated candidate.
     * Optionally uploads a new CV file alongside the application.
     * Throws if the candidate has already applied to the same job.
     */
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
        // Auto-create a candidate profile if the user doesn't have one yet.
        let candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) {
          candidate = await createOrUpdateCandidate(ctx.user.id, {});
        }

        // Check if already applied
        const hasApplied = await checkApplication(candidate.id, input.jobId);
        if (hasApplied) {
          throw new Error("Vous avez déjà postulé à cette offre.");
        }

        // Upload CV if provided alongside this application.
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

          // Update the candidate's CV with the newly uploaded file.
          await createOrUpdateCandidate(ctx.user.id, {
            cvUrl,
            cvFileName: input.cvFileName,
          });
        }

        // Create application
        await createApplication(candidate.id, input.jobId);
        return { success: true };
      }),

    /** Returns true if the authenticated candidate has already applied to a job. */
    hasApplied: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) return false;
        return checkApplication(candidate.id, input.jobId);
      }),

    /** Toggles the saved/unsaved state of a job for the authenticated candidate. */
    toggleSave: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Auto-create candidate profile if needed so anonymous-turned-users can save immediately.
        let candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) {
          candidate = await createOrUpdateCandidate(ctx.user.id, {});
        }
        return toggleSavedJob(candidate.id, input.jobId);
      }),

    /** Returns true if the authenticated candidate has saved a specific job. */
    isSaved: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) return false;
        return checkSavedJob(candidate.id, input.jobId);
      }),

    /** Returns all job offers the authenticated candidate has bookmarked. */
    getSavedJobs: protectedProcedure
      .query(async ({ ctx }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) return [];
        return getSavedJobs(candidate.id);
      }),

    /** Returns all job offers the authenticated candidate has applied to. */
    getApplications: protectedProcedure
      .query(async ({ ctx }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) return [];
        return getApplications(candidate.id);
      }),

    /** Creates a new job alert for the authenticated candidate. */
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

    /** Returns all job alerts belonging to the authenticated candidate. */
    getAlerts: protectedProcedure
      .query(async ({ ctx }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) return [];
        return getJobAlerts(candidate.id);
      }),

    /** Deletes a specific job alert owned by the authenticated candidate. */
    deleteAlert: protectedProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const candidate = await getCandidateByUserId(ctx.user.id);
        if (!candidate) return false;
        return deleteJobAlert(candidate.id, input.alertId);
      }),
  }),
});

// Export the router type so the tRPC client can be fully type-safe on the frontend.
export type AppRouter = typeof appRouter;
