// Single source of truth for every piece of copy on the site.
// Any unfilled field keeps its placeholder token and renders as a visible
// TODO block; content must never be silently invented or dropped.

export type Experience = {
  slug: string;
  role: string;
  org: string;
  dates: string;
  summary: string;
  impact: string[];
  stack: string[];
  problem: string;
  build: string;
  myRole: string;
  metrics: string[];
  liveUrl?: string;
  repoUrl?: string;
};

export type Project = Omit<Experience, "org"> & { org?: string };

export const isTodo = (v: string | undefined): v is string =>
  !!v && /\{\{FILL/.test(v);

export const todoHint = (v: string) =>
  v.replace(/^\{\{FILL:?\s*/, "").replace(/\s*\}\}$/, "");

export const site = {
  name: "Aqeel Jameel",
  tagline: "Forward Deployed Engineer",
  oneLiner:
    "I ship production systems end-to-end: backend, cloud, frontend, and the AI in between.",
  email: "aqeellarif32@gmail.com",
  location: "Colombo, Sri Lanka",
  linkedinUrl: "https://www.linkedin.com/in/aqeeljameel",
  githubUrl: "https://github.com/AqeelDEV",
  cvUrl: "/cv.pdf",
  photo: "/me.png",
  availability:
    "Open to Forward Deployed Engineer / applied-AI internships. Based in Colombo, open to relocation.",
};

export const experience: Experience[] = [
  {
    slug: "experience-1",
    role: "Co-Founder & Founding Engineer",
    org: "Total Tech Solutions (Pvt) Ltd",
    dates: "2025 - Present",
    summary:
      "Sole engineer on a pre-launch IT-hardware e-commerce platform in Sri Lanka. I've taken it from first commit toward launch on my own, owning payments, cloud, and the full stack in roughly seven months alongside my degree.",
    impact: [
      "Built the full HNB/CyberSource card integration (Visa, Mastercard, Google Pay, Click to Pay), validated end-to-end in sandbox; merchant approval secured, production cutover pending.",
      "Provisioned the entire AWS stack (EC2, RDS, S3, CloudFront, SES, EventBridge, SSM) with OIDC-based GitHub Actions CI/CD, and no long-lived keys.",
    ],
    stack: [
      "Next.js 16",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Auth0",
      "AWS",
      "GitHub Actions",
      "Python",
    ],
    problem:
      "A hardware retailer needed a real online storefront that could take card payments, manage stock safely, and run on infrastructure it fully owns, all with no in-house engineering team.",
    build:
      "The whole platform end-to-end: a Next.js storefront and admin dashboard backed by PostgreSQL via Prisma. A product-variants system with concurrency-safe stock handling, a discount-and-coupon engine with correct price stacking (both covered by their own test suites), CSV bulk import/export, and an SSRF-guarded image pipeline that fetches remote images, converts them to WebP with sharp, and serves them from S3 behind CloudFront. Payment reconciliation, card-order and bank-transfer expiry, reminders, and low-stock alerts run as scheduled EventBridge rules hitting cron API routes, with SNS alerts and CloudWatch dead-man alarms guarding the money-critical jobs. A custom Python scraper bulk-imports supplier catalogues (around 200 products) with automated category correction.",
    myRole:
      "Sole technical founder across every layer: architecture, backend, frontend, cloud, payments, and security. I ran a pre-launch robustness pass (rate limiting, session expiry, money-precision invariants, external-call timeouts) and a security review (SSRF protection, RBAC, credential rotation across S3, EC2 security groups and third-party keys, secrets in SSM Parameter Store). I also handled the HNB merchant approval paperwork and reconciled B2B invoices against bank statements.",
    metrics: [
      "Full CyberSource/HNB card flow sandbox-validated across Visa, Mastercard, Google Pay, and Click to Pay.",
      "Money-critical cron jobs guarded by CloudWatch dead-man alarms and SNS alerts.",
      "~200 supplier products onboarded through a custom Python import pipeline.",
      "Dedicated test suites for payments, discounts, SSRF, and money-precision invariants.",
    ],
  },
  {
    slug: "experience-2",
    role: "IT & Systems Support (Part-time)",
    org: "Promolanka Marketing (Pvt) Ltd",
    dates: "2024 - 2025",
    summary:
      "Part-time IT and systems support. I kept the company's servers, network, and internal systems running reliably with no downtime, and was the first point of contact for day-to-day IT.",
    impact: [
      "Maintained the servers, network, and internal systems the business ran on, with no downtime.",
      "Provided hands-on IT support across the company day to day.",
    ],
    stack: ["Systems Administration", "Networking", "Servers", "IT Support"],
    problem:
      "A marketing business depends on its servers, network, and internal systems being up every working day, without a dedicated on-site IT team.",
    build:
      "As the part-time IT owner, I kept the company's servers, network, and internal systems running, handled maintenance and troubleshooting, and gave staff hands-on support whenever something broke.",
    myRole:
      "Sole part-time IT support, responsible for keeping systems, network, and servers up, and for general IT support across the team.",
    metrics: [
      "No downtime across the systems I maintained.",
      "First point of contact for all internal IT issues.",
    ],
  },
];

export const projects: Project[] = [
  {
    slug: "project-1",
    role: "SafeLanka",
    dates: "2025",
    summary:
      "A multilingual public-safety mobile app (emergency SOS, crime reporting, and traffic-fine payments) shipped to Google Play. A team project where I owned the traffic-fines system, the payment flow, and Lost & Found end-to-end.",
    impact: [
      "Built the traffic-fines system full-stack: the NestJS fines module, the SQL schema and migration, and the Flutter payment flow with PayHere and saved cards.",
      "Owned Lost & Found / Items front-to-back, and authored the CI/CD pipeline (GitHub Actions to Railway, Dockerised backend).",
    ],
    stack: [
      "Flutter",
      "Dart",
      "NestJS",
      "TypeScript",
      "MySQL",
      "TypeORM",
      "Google Gemini",
      "PayHere",
      "JWT",
    ],
    problem:
      "Sri Lankans had no single app to raise emergencies, report crime with evidence, and settle traffic fines across three languages.",
    build:
      "SafeLanka is a full-stack, role-based mobile app (Flutter + NestJS) built by a six-person team. My part: I designed and built the traffic-fines system end-to-end, covering the NestJS fines module and DTOs, the traffic-fine / payment-transaction / offense-schedule entities and the SQL migration behind them, and the Flutter payment screens with PayHere and a saved-cards flow. I also owned the Lost & Found / Items module across frontend and backend, and authored the CI/CD (deploy-production, deploy-staging and backend-CI workflows, plus the backend Dockerfile).",
    myRole:
      "Full-stack developer and top committer (190 commits). Owned: the traffic-fines system (schema, backend, and payment UI), the PayHere payment flow with saved cards, and Lost & Found / Items. Contributed to: crime reporting, auth and users, the location module, and the multilingual Google Gemini chatbot (English, Sinhala, Tamil).",
    metrics: [
      "Traffic-fines schema and payment flow designed and shipped end-to-end.",
      "Secured with JWT, role-based access control, and OTP verification.",
      "Shipped to Google Play internal testing via GitHub Actions to Railway.",
    ],
  },
  {
    slug: "project-2",
    role: "Website Audit Tool",
    dates: "2026",
    summary:
      "An AI-powered tool that scrapes any URL and returns structured SEO, content, and UX insights, with every finding grounded in a real page metric. Live on Vercel.",
    impact: [
      "Clean layered design: Cheerio scraping, Gemini-via-OpenRouter orchestration, and logging kept separate, with thin API routes.",
      "Constrained JSON output schema plus metric-grounded prompting, so the model cites concrete page data and can't invent findings.",
    ],
    stack: [
      "Next.js 14",
      "TypeScript",
      "Cheerio",
      "Google Gemini",
      "OpenRouter",
      "Tailwind CSS",
      "Vercel",
    ],
    problem:
      "Most SEO tools hand you vague advice with no evidence. I wanted audits where every recommendation points back to a concrete metric on the page.",
    build:
      "An AI audit pipeline that scrapes a URL with Cheerio, extracts page metrics, and orchestrates Google Gemini (via OpenRouter) against a constrained JSON schema so results are structured and grounded, a responsible-AI pattern where the model can't fabricate findings. Added exponential-backoff retries on rate limits and a GitHub Actions CI pipeline; deployed live on Vercel.",
    myRole:
      "Sole developer: architecture, scraping, AI orchestration, prompt design, and deployment.",
    metrics: [
      "Deployed live on Vercel.",
      "Every insight cites concrete page data (metric-grounded prompting).",
      "Exponential-backoff retry handling on LLM rate limits.",
    ],
    liveUrl: "https://website-audit-tool-theta.vercel.app/",
    repoUrl: "https://github.com/AqeelDEV/website-audit-tool",
  },
  {
    slug: "project-3",
    role: "aqeeljameel.com",
    dates: "2026",
    summary:
      "This site. A WebGL portfolio with a real-time starfield hero, an animated logo-reveal loader, and smooth-scroll motion throughout. The proof, not just the description.",
    impact: [
      "React Three Fiber WebGL hero (starfield + fluid + glass aperture) with a scroll-scrubbed torus-to-portrait morph.",
      "Cohesive motion layer on GSAP, Lenis smooth-scroll, and Framer Motion, with reduced-motion and no-WebGL fallbacks.",
    ],
    stack: [
      "Next.js",
      "React Three Fiber",
      "WebGL",
      "GSAP",
      "Lenis",
      "Framer Motion",
      "TypeScript",
    ],
    problem:
      "A portfolio aimed at frontend-heavy roles has to be the evidence itself: the site needs to show motion and 3D craft, not just claim it.",
    build:
      "A Next.js site with a React Three Fiber WebGL hero, an animated logo-reveal intro, a scroll-scrubbed torus-to-portrait morph, and a motion system built on GSAP, Lenis, and Framer Motion, all driven from a single-source-of-truth content layer and a design-token system, with graceful fallbacks for reduced motion and no-WebGL contexts.",
    myRole:
      "Designer and developer: everything here, from the 3D scene to the content architecture.",
    metrics: [
      "Real-time WebGL rendered client-side.",
      "Reduced-motion and no-WebGL fallbacks throughout.",
      "Single source of truth for all copy.",
    ],
    liveUrl: "https://aqeeljameel.com",
  },
  {
    slug: "project-4",
    role: "ML & Data Mining",
    dates: "2025",
    summary:
      "Hands-on machine-learning coursework: classification and regression for loan approval, including an ensemble and decision-tree models, built and evaluated end-to-end.",
    impact: [
      "Trained and evaluated Naive Bayes, Logistic Regression, and KNN classifiers plus a Decision-Tree regressor.",
      "Built a Naive Bayes + Logistic Regression ensemble across full data-cleaning and feature pipelines.",
    ],
    stack: ["Python", "scikit-learn", "Pandas", "NumPy", "Jupyter"],
    problem:
      "Predict loan-approval outcomes and work out which modelling approach generalises best.",
    build:
      "I built and evaluated classification models (Naive Bayes, Logistic Regression, KNN) and a Decision-Tree regressor in Python, including a Naive Bayes + Logistic Regression ensemble, and ran the full data-mining workflow of cleaning, feature preparation, training, and evaluation.",
    myRole:
      "Individual project: all modelling, evaluation, and analysis.",
    metrics: [
      "Ensemble of three algorithms (Naive Bayes, Logistic Regression, KNN).",
      "Full data-cleaning and feature pipelines.",
    ],
  },
];

export const allWork: (Experience | Project)[] = [...experience, ...projects];

export const getWorkBySlug = (slug: string) =>
  allWork.find((w) => w.slug === slug);

// ── Skills ───────────────────────────────────────────────────────────────
// Category labels are structural (they drive the row layout) and stay real;
// the chips themselves are content. Trimmed to defensible tools/frameworks
// actually used across the projects above.
export type SkillCategory = {
  label: string;
  skills: string[];
};

export const skillCategories: SkillCategory[] = [
  {
    label: "Cloud & DevOps",
    skills: [
      "AWS (EC2, RDS, S3, CloudFront)",
      "GitHub Actions CI/CD (OIDC)",
      "EventBridge & CloudWatch",
      "SSM Parameter Store",
      "Vercel · Railway",
    ],
  },
  {
    label: "Languages",
    skills: ["Python", "TypeScript", "Java", "Dart", "SQL"],
  },
  {
    label: "Frontend",
    skills: ["React", "Next.js", "Flutter", "Tailwind CSS", "React Three Fiber"],
  },
  {
    label: "Backend",
    skills: ["Node.js", "NestJS", "REST APIs", "Prisma", "TypeORM"],
  },
  {
    label: "Databases",
    skills: ["PostgreSQL", "MySQL", "Schema design & migrations"],
  },
  {
    label: "Auth & Payments",
    skills: ["Auth0", "JWT / RBAC", "CyberSource (HNB IPG)", "PayHere"],
  },
  {
    label: "AI / ML",
    skills: [
      "Google Gemini",
      "OpenRouter",
      "Prompt engineering (structured JSON)",
      "scikit-learn",
      "Pandas / NumPy",
    ],
  },
  {
    label: "Tools",
    skills: ["Git / GitHub", "Docker", "Postman", "Linux"],
  },
];

// ── Education ────────────────────────────────────────────────────────────
export type EducationEntry = {
  slug: string;
  institution: string;
  credential: string;
  dates: string;
  detail: string;
  highlights: string[];
};

export const education: EducationEntry[] = [
  {
    slug: "education-university",
    institution: "University of Westminster · IIT, Colombo",
    credential: "BSc (Hons) Computer Science",
    dates: "2024 - 2028",
    detail:
      "2nd-year undergraduate at the Informatics Institute of Technology, affiliated with the University of Westminster (UK).",
    highlights: [
      "Individual machine-learning & data-mining project (viva passed).",
      "IEEE member across the Computer Society and Robotics & Automation Society.",
    ],
  },
  {
    slug: "education-foundation",
    institution: "Informatics Institute of Technology (IIT)",
    credential: "Foundation Programme",
    dates: "2023 - 2024",
    detail:
      "Foundation year bridging into the BSc (Hons) Computer Science degree.",
    highlights: [
      "Completed GCE Ordinary Levels.",
      "Progressed directly into the BSc (Hons) Computer Science.",
    ],
  },
];

// ── Certifications ───────────────────────────────────────────────────────
export type Certification = {
  slug: string;
  title: string;
  issuer: string;
  date: string;
  detail: string;
  /** Structural flag — drives the pulsing "In progress" badge. */
  inProgress: boolean;
};

export const certifications: Certification[] = [
  {
    slug: "cert-aws-saa",
    title: "AWS Certified Solutions Architect, Associate (SAA-C03)",
    issuer: "Amazon Web Services",
    date: "Targeting August 2026",
    detail:
      "In progress: cloud architecture across compute, storage, networking, and security on AWS.",
    inProgress: true,
  },
  {
    slug: "cert-iit-ai",
    title: "Professional Certificate in Artificial Intelligence",
    issuer: "Informatics Institute of Technology (IIT)",
    date: "May - Sep 2025",
    detail: "Applied AI/ML foundations and hands-on model building.",
    inProgress: false,
  },
  {
    slug: "cert-sliit",
    title: "Professional Certificate in Computer Science & AI Foundations",
    issuer: "SLIIT",
    date: "May - Sep 2024",
    detail: "Core computer-science and AI fundamentals.",
    inProgress: false,
  },
];

// ── Beyond the Code ──────────────────────────────────────────────────────
// Language level is structural — it sets the meter width and the visible
// label — so it stays a real enum value while the language name is content.
export type LanguageLevel = "fluent" | "intermediate" | "beginner";

export const LANGUAGE_LEVEL_PERCENT: Record<LanguageLevel, number> = {
  fluent: 100,
  intermediate: 60,
  beginner: 30,
};

export const LANGUAGE_LEVEL_LABEL: Record<LanguageLevel, string> = {
  fluent: "Fluent",
  intermediate: "Intermediate",
  beginner: "Beginner",
};

export type SpokenLanguage = {
  name: string;
  level: LanguageLevel;
};

export const spokenLanguages: SpokenLanguage[] = [
  { name: "English", level: "fluent" },
  { name: "Sinhala", level: "fluent" },
  { name: "Tamil", level: "fluent" },
  { name: "Malay", level: "intermediate" },
];

export type LeadershipItem = {
  org: string;
  role: string;
  dates: string;
  detail: string;
};

export const leadership: LeadershipItem[] = [
  {
    org: "IEEE",
    role: "Member of the Computer Society & Robotics and Automation Society",
    dates: "Jan 2025 - Present",
    detail:
      "Active member across the IEEE Computer Society and the Robotics & Automation Society.",
  },
  {
    org: "IEEEXtreme 19.0",
    role: "Competitive Programmer, Team CyberWarriors",
    dates: "2025",
    detail:
      "Competed in IEEE's 24-hour global algorithmic programming challenge.",
  },
];

export type SportsItem = {
  title: string;
  achievement: string;
};

export const sports: SportsItem[] = [
  { title: "MMA & K-1", achievement: "Three years of competitive experience" },
  { title: "Swimming", achievement: "Two-time bronze medallist" },
  { title: "Muay Thai & BJJ", achievement: "Active practitioner" },
];
