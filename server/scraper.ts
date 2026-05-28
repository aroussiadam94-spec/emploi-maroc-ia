import { getDb, isSqliteMode } from "./db";

const MOROCCO_JOBS = [
  // IT / Tech
  { title: "Développeur Full Stack React/Node.js", company: "Ynov Maroc", location: "Casablanca", sector: "IT", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "12000", salaryMax: "18000", source: "rekrute.com", description: "Nous recherchons un développeur Full Stack passionné. Maîtrise de React, Node.js, et bases de données SQL/NoSQL requise.", requirements: "React, Node.js, TypeScript, MySQL, Git, 3+ ans d'expérience", skills: '["React","Node.js","TypeScript","MySQL"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Ingénieur DevOps / Cloud AWS", company: "Capgemini Maroc", location: "Casablanca", sector: "IT", contractType: "CDI", experienceLevel: "Senior", salaryMin: "20000", salaryMax: "30000", source: "emploi.ma", description: "Poste de DevOps Engineer pour piloter la migration cloud et l'automatisation CI/CD de nos clients grands comptes.", requirements: "AWS, Docker, Kubernetes, Terraform, Jenkins, 5+ ans", skills: '["AWS","Docker","Kubernetes","Terraform"]', sourceUrl: "https://www.emploi.ma" },
  { title: "Data Scientist / Machine Learning", company: "CIH Bank", location: "Rabat", sector: "IT", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "15000", salaryMax: "22000", source: "rekrute.com", description: "Rejoignez notre équipe Data pour développer des modèles prédictifs pour la détection de fraude et le scoring crédit.", requirements: "Python, TensorFlow, Scikit-learn, SQL, 3+ ans", skills: '["Python","Machine Learning","TensorFlow","SQL"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Développeur Mobile React Native", company: "Inwi", location: "Casablanca", sector: "IT", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "14000", salaryMax: "20000", source: "emploi.ma", description: "Développement et maintenance des applications mobiles Inwi Money et Inwi Box pour iOS et Android.", requirements: "React Native, JavaScript, REST APIs, 2+ ans", skills: '["React Native","JavaScript","iOS","Android"]', sourceUrl: "https://www.emploi.ma" },
  { title: "Analyste Cybersécurité SOC", company: "OCP Group", location: "Casablanca", sector: "IT", contractType: "CDI", experienceLevel: "Senior", salaryMin: "18000", salaryMax: "28000", source: "anapec.org", description: "Protection des systèmes d'information d'OCP Group contre les cybermenaces. Surveillance du SOC 24/7.", requirements: "SIEM, CEH, CISSP, 5+ ans sécurité informatique", skills: '["Cybersécurité","SIEM","SOC","CEH"]', sourceUrl: "https://www.anapec.org" },
  { title: "Chef de Projet IT / Scrum Master", company: "Maroc Telecom", location: "Rabat", sector: "IT", contractType: "CDI", experienceLevel: "Senior", salaryMin: "22000", salaryMax: "32000", source: "rekrute.com", description: "Pilotage de projets transformation digitale pour Maroc Telecom. Certification PMP ou PSM souhaitée.", requirements: "Agile, Scrum, JIRA, MS Project, PMP, 7+ ans", skills: '["Agile","Scrum","JIRA","PMP"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Administrateur Systèmes et Réseaux", company: "Groupe Banque Populaire", location: "Casablanca", sector: "IT", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "12000", salaryMax: "17000", source: "emploi.ma", description: "Administration des serveurs Windows/Linux, gestion du réseau LAN/WAN et support technique N2/N3.", requirements: "Windows Server, Linux, Cisco, VMware, 3+ ans", skills: '["Linux","Windows Server","Cisco","VMware"]', sourceUrl: "https://www.emploi.ma" },
  { title: "Développeur Java Backend / Spring Boot", company: "BMCE Bank of Africa", location: "Casablanca", sector: "IT", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "13000", salaryMax: "19000", source: "rekrute.com", description: "Développement de microservices bancaires avec Spring Boot, intégration API REST, sécurité JWT.", requirements: "Java, Spring Boot, Microservices, PostgreSQL, 3+ ans", skills: '["Java","Spring Boot","Microservices","PostgreSQL"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Designer UX/UI Senior", company: "Agence Webmaster Maroc", location: "Casablanca", sector: "IT", contractType: "Freelance", experienceLevel: "Confirmé", salaryMin: "8000", salaryMax: "15000", source: "rekrute.com", description: "Mission freelance pour refonte UX/UI d'une application mobile e-commerce. Figma requis.", requirements: "Figma, Adobe XD, UX research, 3+ ans", skills: '["UX","UI","Figma","Mobile Design"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Stage – Développeur Front-End React", company: "Webhelp Maroc", location: "Rabat", sector: "IT", contractType: "Stage", experienceLevel: "Junior", salaryMin: "3000", salaryMax: "5000", source: "rekrute.com", description: "Stage de fin d'études en développement front-end React.js dans notre équipe tech.", requirements: "React, JavaScript, CSS, bac+4/5 informatique", skills: '["React","JavaScript","CSS","HTML"]', sourceUrl: "https://www.rekrute.com" },
  // Finance
  { title: "Contrôleur de Gestion", company: "OCP Group", location: "Casablanca", sector: "Finance", contractType: "CDI", experienceLevel: "Senior", salaryMin: "18000", salaryMax: "25000", source: "rekrute.com", description: "Pilotage du controlling financier du groupe OCP, élaboration des budgets et tableaux de bord.", requirements: "Comptabilité analytique, SAP FI/CO, Excel avancé, 5+ ans", skills: '["Contrôle de gestion","SAP","Excel","Budget"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Auditeur Interne", company: "Attijariwafa Bank", location: "Casablanca", sector: "Finance", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "15000", salaryMax: "22000", source: "emploi.ma", description: "Réalisation des missions d'audit interne, évaluation des risques opérationnels et recommandations.", requirements: "Audit interne, COSO, CIA, normes IFRS, 4+ ans", skills: '["Audit","IFRS","Gestion des risques","CIA"]', sourceUrl: "https://www.emploi.ma" },
  { title: "Responsable Comptabilité et Fiscalité", company: "Marjane Group", location: "Rabat", sector: "Finance", contractType: "CDI", experienceLevel: "Senior", salaryMin: "16000", salaryMax: "24000", source: "anapec.org", description: "Gestion de la comptabilité générale et analytique, déclarations fiscales.", requirements: "DSCG ou CPA, fiscalité marocaine, 6+ ans", skills: '["Comptabilité","Fiscalité","SAP","Reporting"]', sourceUrl: "https://www.anapec.org" },
  { title: "Analyste Risque Crédit", company: "Société Générale Maroc", location: "Casablanca", sector: "Finance", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "14000", salaryMax: "20000", source: "rekrute.com", description: "Analyse des dossiers de crédit entreprises et particuliers, évaluation du risque de contrepartie.", requirements: "Finance d'entreprise, analyse financière, bac+5, 3+ ans", skills: '["Analyse crédit","Finance","Risque","Excel"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Stage – Analyste Data / Excel BI", company: "Crédit Agricole du Maroc", location: "Rabat", sector: "Finance", contractType: "Stage", experienceLevel: "Junior", salaryMin: "3000", salaryMax: "5000", source: "anapec.org", description: "Stage de 6 mois en analyse de données et reporting BI pour la Direction Financière.", requirements: "Excel avancé, Power BI, SQL, bac+4/5 finance/data", skills: '["Excel","Power BI","SQL","Data"]', sourceUrl: "https://www.anapec.org" },
  // Marketing
  { title: "Responsable Marketing Digital", company: "Inwi", location: "Casablanca", sector: "Marketing", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "13000", salaryMax: "20000", source: "rekrute.com", description: "Pilotage de la stratégie digitale Inwi : SEO/SEA, réseaux sociaux, CRM, email marketing.", requirements: "Marketing digital, Google Ads, Facebook Ads, Analytics, 4+ ans", skills: '["SEO","Google Ads","Social Media","Analytics"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Brand Manager / Chef de Produit", company: "Centrale Danone Maroc", location: "Casablanca", sector: "Marketing", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "15000", salaryMax: "22000", source: "emploi.ma", description: "Gestion de la marque Danone au Maroc, lancement de nouvelles références, campagnes de communication.", requirements: "Marketing FMCG, Nielsen, études de marché, 5+ ans", skills: '["Brand management","FMCG","Études marché","Campagnes"]', sourceUrl: "https://www.emploi.ma" },
  { title: "Content Manager / Responsable Contenu", company: "Jumia Maroc", location: "Casablanca", sector: "Marketing", contractType: "CDI", experienceLevel: "Junior", salaryMin: "8000", salaryMax: "13000", source: "rekrute.com", description: "Création et gestion de contenu pour les plateformes digitales de Jumia Maroc.", requirements: "Rédaction web, SEO, WordPress, créativité, 1+ an", skills: '["Rédaction","SEO","WordPress","Social Media"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Stage – Assistant Marketing Digital", company: "Jumia Maroc", location: "Casablanca", sector: "Marketing", contractType: "Stage", experienceLevel: "Junior", salaryMin: "2500", salaryMax: "4000", source: "emploi.ma", description: "Stage dans l'équipe marketing Jumia Maroc, support campagnes digitales et analyses de performance.", requirements: "Marketing, réseaux sociaux, Google Analytics, bac+3/4", skills: '["Marketing digital","Analytics","Réseaux sociaux"]', sourceUrl: "https://www.emploi.ma" },
  // RH
  { title: "Responsable Ressources Humaines", company: "LafargeHolcim Maroc", location: "Casablanca", sector: "RH", contractType: "CDI", experienceLevel: "Senior", salaryMin: "18000", salaryMax: "28000", source: "emploi.ma", description: "Pilotage de la politique RH du groupe, recrutement cadres, GPEC, relations sociales.", requirements: "GPEC, droit social, paie, bac+5 RH, 8+ ans", skills: '["GPEC","Recrutement","Droit social","Paie"]', sourceUrl: "https://www.emploi.ma" },
  { title: "Chargé de Recrutement", company: "Randstad Maroc", location: "Casablanca", sector: "RH", contractType: "CDI", experienceLevel: "Junior", salaryMin: "7000", salaryMax: "11000", source: "anapec.org", description: "Recrutement de profils tertiaires et techniques pour les clients de Randstad Maroc.", requirements: "Entretiens, ATS, sourcing LinkedIn, bac+3 RH, 1+ an", skills: '["Recrutement","LinkedIn","Entretiens","ATS"]', sourceUrl: "https://www.anapec.org" },
  { title: "Gestionnaire de Paie", company: "Addoha Group", location: "Casablanca", sector: "RH", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "10000", salaryMax: "15000", source: "rekrute.com", description: "Gestion de la paie de 500+ collaborateurs, déclarations CNSS/AMO, cotisations patronales.", requirements: "Sage Paie, législation sociale marocaine, 3+ ans", skills: '["Sage Paie","CNSS","AMO","Législation sociale"]', sourceUrl: "https://www.rekrute.com" },
  // Commerce / Ventes
  { title: "Commercial B2B Grands Comptes", company: "Maroc Telecom", location: "Casablanca", sector: "Ventes", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "10000", salaryMax: "22000", source: "rekrute.com", description: "Développement et fidélisation d'un portefeuille de clients entreprises pour les solutions télécoms B2B.", requirements: "Vente B2B, prospection, CRM Salesforce, 4+ ans", skills: '["Vente B2B","Salesforce","Négociation","Grands Comptes"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Responsable Zone Nord – Commercial", company: "Brasseries du Maroc", location: "Tanger", sector: "Ventes", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "12000", salaryMax: "18000", source: "emploi.ma", description: "Gestion de la force de vente sur la zone Nord (Tanger, Tétouan, Al Hoceima).", requirements: "FMCG, management équipe terrain, véhicule, 5+ ans", skills: '["FMCG","Management","Distribution","Négociation"]', sourceUrl: "https://www.emploi.ma" },
  { title: "Ingénieur Commercial IT", company: "Dell Technologies Maroc", location: "Casablanca", sector: "Ventes", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "15000", salaryMax: "30000", source: "anapec.org", description: "Vente de solutions matérielles et logicielles Dell à des clients Enterprise au Maroc.", requirements: "IT, vente solutions technologiques, anglais courant, 4+ ans", skills: '["Vente IT","Solutions Enterprise","Anglais","CRM"]', sourceUrl: "https://www.anapec.org" },
  // Logistique
  { title: "Responsable Supply Chain", company: "Cosumar", location: "Casablanca", sector: "Logistique", contractType: "CDI", experienceLevel: "Senior", salaryMin: "20000", salaryMax: "30000", source: "rekrute.com", description: "Pilotage de la chaîne logistique de Cosumar : approvisionnements, stocks, transport et distribution nationale.", requirements: "Supply chain, SAP MM, Lean, bac+5, 8+ ans", skills: '["Supply Chain","SAP","Lean","Gestion des stocks"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Chef de Quai / Responsable Entrepôt", company: "DHL Express Maroc", location: "Casablanca", sector: "Logistique", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "10000", salaryMax: "16000", source: "emploi.ma", description: "Management des opérations de quai, coordination réceptions/expéditions.", requirements: "Logistique, WMS, management, permis B, 4+ ans", skills: '["Logistique","WMS","Management","Entrepôt"]', sourceUrl: "https://www.emploi.ma" },
  // BTP / Ingénierie
  { title: "Ingénieur Génie Civil – Conducteur de Travaux", company: "Groupe Alliances", location: "Marrakech", sector: "BTP", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "12000", salaryMax: "20000", source: "rekrute.com", description: "Suivi et supervision de chantiers immobiliers résidentiels à Marrakech.", requirements: "Génie Civil, AutoCAD, MS Project, 4+ ans chantier", skills: '["Génie Civil","AutoCAD","Gestion de chantier","BTP"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Ingénieur Procédés / Process Engineer", company: "OCP Group – Jorf Lasfar", location: "El Jadida", sector: "BTP", contractType: "CDI", experienceLevel: "Senior", salaryMin: "22000", salaryMax: "35000", source: "anapec.org", description: "Optimisation des procédés de production d'acide phosphorique et engrais à l'usine de Jorf Lasfar.", requirements: "Génie chimique, procédés industriels, 5+ ans industrie", skills: '["Génie chimique","Procédés","OCP","Optimisation"]', sourceUrl: "https://www.anapec.org" },
  // Tourisme
  { title: "Directeur d'Hôtel", company: "Sofitel Marrakech", location: "Marrakech", sector: "Tourisme", contractType: "CDI", experienceLevel: "Senior", salaryMin: "25000", salaryMax: "45000", source: "rekrute.com", description: "Direction générale du Sofitel Marrakech, management de 300 collaborateurs, P&L hôtelier.", requirements: "Hôtellerie luxe, management, anglais courant, 10+ ans", skills: '["Hôtellerie","Management","Revenue Management","Luxe"]', sourceUrl: "https://www.rekrute.com" },
  { title: "Revenue Manager", company: "Mövenpick Hôtel Tanger", location: "Tanger", sector: "Tourisme", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "12000", salaryMax: "18000", source: "emploi.ma", description: "Optimisation du revenu de l'hôtel via les canaux OTA, tarification dynamique, yield management.", requirements: "Yield management, OTA, PMS, Excel avancé, 4+ ans", skills: '["Revenue Management","Yield","OTA","PMS"]', sourceUrl: "https://www.emploi.ma" },
  // Santé
  { title: "Médecin Généraliste", company: "Clinique Al Farabi", location: "Fès", sector: "Santé", contractType: "CDI", experienceLevel: "Confirmé", salaryMin: "15000", salaryMax: "25000", source: "emploi.ma", description: "Poste de médecin généraliste dans notre clinique moderne de Fès. Gardes incluses.", requirements: "Doctorat en médecine, Ordre des médecins du Maroc, 2+ ans", skills: '["Médecine générale","Consultations","Urgences"]', sourceUrl: "https://www.emploi.ma" },
  { title: "Infirmier(e) de Bloc Opératoire", company: "Hôpital Ibn Rochd", location: "Casablanca", sector: "Santé", contractType: "CDI", experienceLevel: "Junior", salaryMin: "6000", salaryMax: "10000", source: "anapec.org", description: "Assistance chirurgicale en bloc opératoire, préparation du matériel et soins post-opératoires.", requirements: "IBODE ou IADE, 1+ an bloc opératoire", skills: '["Bloc opératoire","Soins infirmiers","IBODE"]', sourceUrl: "https://www.anapec.org" },
  // Agadir
  { title: "Technicien Aquacole", company: "MAROST – Maroc Ostréiculture", location: "Agadir", sector: "Agriculture", contractType: "CDI", experienceLevel: "Junior", salaryMin: "6000", salaryMax: "9000", source: "anapec.org", description: "Élevage et suivi de la qualité des huîtres et moules en production aquacole.", requirements: "Aquaculture, biologie marine, permis B, 1+ an", skills: '["Aquaculture","Biologie marine","Contrôle qualité"]', sourceUrl: "https://www.anapec.org" },
  { title: "Traducteur Arabe-Français-Anglais", company: "Cabinet Translation Maroc", location: "Rabat", sector: "Autres", contractType: "Freelance", experienceLevel: "Junior", salaryMin: "5000", salaryMax: "10000", source: "emploi.ma", description: "Traductions de documents juridiques et techniques entre l'arabe, le français et l'anglais.", requirements: "Maîtrise trilingue, documentation technique, 1+ an", skills: '["Traduction","Arabe","Français","Anglais"]', sourceUrl: "https://www.emploi.ma" },
];

export async function seedMoroccoJobs(): Promise<{ inserted: number; skipped: number }> {
  const db = await getDb();
  if (!db) {
    console.warn("[Scraper] Database not available, skipping job seeding.");
    return { inserted: 0, skipped: 0 };
  }

  try {
    const sqlite = isSqliteMode();

    // Check current count via raw count
    let currentCount = 0;
    if (sqlite) {
      const { jobOffers } = await import("../drizzle/sqlite-schema");
      const { count } = await import("drizzle-orm");
      const result = await db.select({ value: count() }).from(jobOffers);
      currentCount = Number(result[0]?.value ?? 0);
    } else {
      const { jobOffers } = await import("../drizzle/schema");
      const { count } = await import("drizzle-orm");
      const result = await db.select({ value: count() }).from(jobOffers);
      currentCount = Number(result[0]?.value ?? 0);
    }

    if (currentCount >= 10) {
      console.log(`[Scraper] ${currentCount} jobs already seeded, skipping.`);
      return { inserted: 0, skipped: MOROCCO_JOBS.length };
    }

    console.log("[Scraper] Seeding Morocco job offers...");
    let inserted = 0;
    const now = new Date();

    for (let i = 0; i < MOROCCO_JOBS.length; i++) {
      const job = MOROCCO_JOBS[i];
      try {
        const daysAgo = Math.floor(Math.random() * 30);
        const publishedDate = new Date(now.getTime() - daysAgo * 86400000);
        const expiryDate = new Date(now.getTime() + 30 * 86400000);
        const externalId = `mock_${job.source}_${i}_${Date.now()}`;

        if (sqlite) {
          const { jobOffers } = await import("../drizzle/sqlite-schema");
          await db.insert(jobOffers).values({
            externalId,
            source: job.source,
            title: job.title,
            company: job.company,
            location: job.location,
            sector: job.sector,
            contractType: job.contractType,
            experienceLevel: job.experienceLevel,
            description: job.description,
            requirements: job.requirements,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            currency: "MAD",
            publishedDate: publishedDate.toISOString(),
            expiryDate: expiryDate.toISOString(),
            sourceUrl: job.sourceUrl,
            skills: job.skills,
          }).onConflictDoNothing();
        } else {
          const { jobOffers } = await import("../drizzle/schema");
          await db.insert(jobOffers).values({
            externalId,
            source: job.source,
            title: job.title,
            company: job.company,
            location: job.location,
            sector: job.sector,
            contractType: job.contractType,
            experienceLevel: job.experienceLevel,
            description: job.description,
            requirements: job.requirements,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            currency: "MAD",
            publishedDate,
            expiryDate,
            sourceUrl: job.sourceUrl,
            skills: JSON.parse(job.skills),
          }).onDuplicateKeyUpdate({ set: { updatedAt: now } });
        }
        inserted++;
      } catch (err: any) {
        console.warn(`[Scraper] Skipped "${job.title}":`, err?.message?.slice(0, 80));
      }
    }

    console.log(`[Scraper] ✅ Seeded ${inserted} jobs into DB.`);
    return { inserted, skipped: MOROCCO_JOBS.length - inserted };
  } catch (error) {
    console.error("[Scraper] Seed failed:", error);
    return { inserted: 0, skipped: 0 };
  }
}

export async function getJobStats() {
  const db = await getDb();
  if (!db) return { total: 0 };
  const { count } = await import("drizzle-orm");
  if (isSqliteMode()) {
    const { jobOffers } = await import("../drizzle/sqlite-schema");
    const result = await db.select({ value: count() }).from(jobOffers);
    return { total: Number(result[0]?.value ?? 0) };
  } else {
    const { jobOffers } = await import("../drizzle/schema");
    const result = await db.select({ value: count() }).from(jobOffers);
    return { total: Number(result[0]?.value ?? 0) };
  }
}

export async function runCronScraper(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Cron Scraper] Database not available, skipping job generation.");
    return;
  }

  try {
    const sqlite = isSqliteMode();
    const count = Math.floor(Math.random() * (150 - 100 + 1)) + 100; // Random between 100 and 150
    console.log(`[Cron Scraper] Generating ${count} mock jobs...`);

    let inserted = 0;
    const now = new Date();

    const titles = ["Développeur", "Ingénieur", "Chef de Projet", "Consultant", "Data Scientist", "Architecte", "Technicien", "Responsable", "Manager", "Analyste"];
    const keywords = ["React", "Java", "Python", "Cloud", "Réseaux", "Cybersécurité", "Finance", "Marketing", "RH", "Vente"];
    const companies = ["Ynov Maroc", "Capgemini", "OCP", "Inwi", "Maroc Telecom", "Attijariwafa Bank", "CIH Bank", "Jumia", "LafargeHolcim", "Société Générale"];
    const locations = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "Meknès", "Oujda", "Kénitra", "El Jadida"];
    const contractTypes = ["CDI", "CDD", "Freelance", "Stage", "Anapec"];
    const levels = ["Junior", "Confirmé", "Senior", "Expert"];

    for (let i = 0; i < count; i++) {
      const titlePrefix = titles[Math.floor(Math.random() * titles.length)];
      const titleSuffix = keywords[Math.floor(Math.random() * keywords.length)];
      const title = `${titlePrefix} ${titleSuffix}`;
      const company = companies[Math.floor(Math.random() * companies.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const sector = ["IT", "Finance", "Marketing", "RH", "Ventes", "Logistique", "BTP", "Santé"][Math.floor(Math.random() * 8)];
      const contractType = contractTypes[Math.floor(Math.random() * contractTypes.length)];
      const experienceLevel = levels[Math.floor(Math.random() * levels.length)];
      
      const salaryMin = Math.floor(Math.random() * 10) * 1000 + 5000;
      const salaryMax = salaryMin + Math.floor(Math.random() * 10) * 1000 + 2000;
      const skillsStr = JSON.stringify([titleSuffix, "Travail en équipe", "Communication"]);

      const daysAgo = Math.floor(Math.random() * 3);
      const publishedDate = new Date(now.getTime() - daysAgo * 86400000);
      const expiryDate = new Date(now.getTime() + 30 * 86400000);
      const externalId = `cron_${Date.now()}_${i}`;

      if (sqlite) {
        const { jobOffers } = await import("../drizzle/sqlite-schema");
        await db.insert(jobOffers).values({
          externalId,
          source: "cron_scraper",
          title,
          company,
          location,
          sector,
          contractType,
          experienceLevel,
          description: `Poste généré automatiquement. Recherche active d'un profil ${title} motivé.`,
          requirements: `Expérience souhaitée : ${experienceLevel}. Compétences : ${titleSuffix}.`,
          salaryMin: salaryMin.toString(),
          salaryMax: salaryMax.toString(),
          currency: "MAD",
          publishedDate: publishedDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          sourceUrl: "https://www.emploi.ma",
          skills: skillsStr,
        }).onConflictDoNothing();
      } else {
        const { jobOffers } = await import("../drizzle/schema");
        await db.insert(jobOffers).values({
          externalId,
          source: "cron_scraper",
          title,
          company,
          location,
          sector,
          contractType,
          experienceLevel,
          description: `Poste généré automatiquement. Recherche active d'un profil ${title} motivé.`,
          requirements: `Expérience souhaitée : ${experienceLevel}. Compétences : ${titleSuffix}.`,
          salaryMin: salaryMin.toString(),
          salaryMax: salaryMax.toString(),
          currency: "MAD",
          publishedDate,
          expiryDate,
          sourceUrl: "https://www.emploi.ma",
          skills: JSON.parse(skillsStr),
        }).onDuplicateKeyUpdate({ set: { updatedAt: now } });
      }
      inserted++;
    }

    console.log(`[Cron Scraper] ✅ Successfully generated and inserted ${inserted} mock jobs.`);
  } catch (error) {
    console.error("[Cron Scraper] Failed to run cron job:", error);
  }
}
