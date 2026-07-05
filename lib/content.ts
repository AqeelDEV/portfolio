// Single source of truth for every piece of copy on the site.
// Unfilled fields keep their {{FILL: ...}} token and render as a visible
// TODO block — they must never be silently invented or dropped.

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
  location: "{{FILL: LOCATION}}",
  linkedinUrl: "{{FILL: LINKEDIN_URL}}",
  githubUrl: "{{FILL: GITHUB_URL}}",
  cvUrl: "/cv.pdf",
  photo: "/me.png",
  availability:
    "Open to Forward Deployed Engineer / applied-AI internships.",
};

export const experience: Experience[] = [
  {
    slug: "experience-1",
    role: "{{FILL: ROLE}}",
    org: "{{FILL: ORG}}",
    dates: "{{FILL: DATES}}",
    summary: "{{FILL: ONE_SENTENCE}}",
    impact: ["{{FILL: IMPACT_1}}", "{{FILL: IMPACT_2}}"],
    stack: ["{{FILL: STACK_CHIPS}}"],
    problem: "{{FILL: PROBLEM}}",
    build: "{{FILL: WHAT_I_BUILT}}",
    myRole: "{{FILL: MY_ROLE}}",
    metrics: ["{{FILL: METRIC}}"],
    liveUrl: "{{FILL: LIVE_URL}}",
    repoUrl: "{{FILL: REPO_URL}}",
  },
  {
    slug: "experience-2",
    role: "{{FILL: ROLE}}",
    org: "{{FILL: ORG}}",
    dates: "{{FILL: DATES}}",
    summary: "{{FILL: ONE_SENTENCE}}",
    impact: ["{{FILL: IMPACT_1}}", "{{FILL: IMPACT_2}}"],
    stack: ["{{FILL: STACK_CHIPS}}"],
    problem: "{{FILL: PROBLEM}}",
    build: "{{FILL: WHAT_I_BUILT}}",
    myRole: "{{FILL: MY_ROLE}}",
    metrics: ["{{FILL: METRIC}}"],
    liveUrl: "{{FILL: LIVE_URL}}",
    repoUrl: "{{FILL: REPO_URL}}",
  },
];

export const projects: Project[] = [
  {
    slug: "project-1",
    role: "{{FILL: PROJECT_NAME}}",
    dates: "{{FILL: YEAR}}",
    summary: "{{FILL: ONE_SENTENCE}}",
    impact: ["{{FILL: IMPACT_1}}"],
    stack: ["{{FILL: STACK_CHIPS}}"],
    problem: "{{FILL: PROBLEM}}",
    build: "{{FILL: WHAT_I_BUILT}}",
    myRole: "{{FILL: MY_ROLE}}",
    metrics: ["{{FILL: METRIC}}"],
    liveUrl: "{{FILL: LIVE_URL}}",
    repoUrl: "{{FILL: REPO_URL}}",
  },
  {
    slug: "project-2",
    role: "{{FILL: PROJECT_NAME}}",
    dates: "{{FILL: YEAR}}",
    summary: "{{FILL: ONE_SENTENCE}}",
    impact: ["{{FILL: IMPACT_1}}"],
    stack: ["{{FILL: STACK_CHIPS}}"],
    problem: "{{FILL: PROBLEM}}",
    build: "{{FILL: WHAT_I_BUILT}}",
    myRole: "{{FILL: MY_ROLE}}",
    metrics: ["{{FILL: METRIC}}"],
    liveUrl: "{{FILL: LIVE_URL}}",
    repoUrl: "{{FILL: REPO_URL}}",
  },
  {
    slug: "project-3",
    role: "{{FILL: PROJECT_NAME}}",
    dates: "{{FILL: YEAR}}",
    summary: "{{FILL: ONE_SENTENCE}}",
    impact: ["{{FILL: IMPACT_1}}"],
    stack: ["{{FILL: STACK_CHIPS}}"],
    problem: "{{FILL: PROBLEM}}",
    build: "{{FILL: WHAT_I_BUILT}}",
    myRole: "{{FILL: MY_ROLE}}",
    metrics: ["{{FILL: METRIC}}"],
    liveUrl: "{{FILL: LIVE_URL}}",
    repoUrl: "{{FILL: REPO_URL}}",
  },
];

export const allWork: (Experience | Project)[] = [...experience, ...projects];

export const getWorkBySlug = (slug: string) =>
  allWork.find((w) => w.slug === slug);

// ── Skills ───────────────────────────────────────────────────────────────
// Category labels are structural (they drive the row layout) and stay real;
// the chips themselves are content and keep {{FILL}} until filled.
export type SkillCategory = {
  label: string;
  skills: string[];
};

export const skillCategories: SkillCategory[] = [
  {
    label: "Cloud & DevOps",
    skills: [
      "{{FILL: CLOUD_DEVOPS_1}}",
      "{{FILL: CLOUD_DEVOPS_2}}",
      "{{FILL: CLOUD_DEVOPS_3}}",
      "{{FILL: CLOUD_DEVOPS_4}}",
      "{{FILL: CLOUD_DEVOPS_5}}",
      "{{FILL: CLOUD_DEVOPS_6}}",
    ],
  },
  {
    label: "Languages",
    skills: [
      "{{FILL: LANG_SKILL_1}}",
      "{{FILL: LANG_SKILL_2}}",
      "{{FILL: LANG_SKILL_3}}",
      "{{FILL: LANG_SKILL_4}}",
      "{{FILL: LANG_SKILL_5}}",
    ],
  },
  {
    label: "Frontend",
    skills: [
      "{{FILL: FRONTEND_1}}",
      "{{FILL: FRONTEND_2}}",
      "{{FILL: FRONTEND_3}}",
      "{{FILL: FRONTEND_4}}",
      "{{FILL: FRONTEND_5}}",
    ],
  },
  {
    label: "Backend",
    skills: [
      "{{FILL: BACKEND_1}}",
      "{{FILL: BACKEND_2}}",
      "{{FILL: BACKEND_3}}",
      "{{FILL: BACKEND_4}}",
      "{{FILL: BACKEND_5}}",
    ],
  },
  {
    label: "Databases",
    skills: [
      "{{FILL: DATABASE_1}}",
      "{{FILL: DATABASE_2}}",
      "{{FILL: DATABASE_3}}",
      "{{FILL: DATABASE_4}}",
    ],
  },
  {
    label: "Auth & Payments",
    skills: [
      "{{FILL: AUTH_PAY_1}}",
      "{{FILL: AUTH_PAY_2}}",
      "{{FILL: AUTH_PAY_3}}",
      "{{FILL: AUTH_PAY_4}}",
    ],
  },
  {
    label: "AI / ML",
    skills: [
      "{{FILL: AI_ML_1}}",
      "{{FILL: AI_ML_2}}",
      "{{FILL: AI_ML_3}}",
      "{{FILL: AI_ML_4}}",
      "{{FILL: AI_ML_5}}",
    ],
  },
  {
    label: "Tools",
    skills: [
      "{{FILL: TOOL_1}}",
      "{{FILL: TOOL_2}}",
      "{{FILL: TOOL_3}}",
      "{{FILL: TOOL_4}}",
      "{{FILL: TOOL_5}}",
    ],
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
    institution: "{{FILL: UNIVERSITY_NAME}}",
    credential: "{{FILL: DEGREE_TITLE}}",
    dates: "{{FILL: UNIVERSITY_DATES}}",
    detail: "{{FILL: UNIVERSITY_DETAIL}}",
    highlights: ["{{FILL: EDU_HIGHLIGHT_1}}", "{{FILL: EDU_HIGHLIGHT_2}}"],
  },
  {
    slug: "education-school",
    institution: "{{FILL: SCHOOL_NAME}}",
    credential: "{{FILL: SCHOOL_QUALIFICATION}}",
    dates: "{{FILL: SCHOOL_DATES}}",
    detail: "{{FILL: SCHOOL_DETAIL}}",
    highlights: ["{{FILL: SCHOOL_HIGHLIGHT_1}}", "{{FILL: SCHOOL_HIGHLIGHT_2}}"],
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
    title: "{{FILL: CERT_TITLE_1}}",
    issuer: "{{FILL: CERT_ISSUER_1}}",
    date: "{{FILL: CERT_DATE_1}}",
    detail: "{{FILL: CERT_DETAIL_1}}",
    inProgress: true,
  },
  {
    slug: "cert-iit-ai",
    title: "{{FILL: CERT_TITLE_2}}",
    issuer: "{{FILL: CERT_ISSUER_2}}",
    date: "{{FILL: CERT_DATE_2}}",
    detail: "{{FILL: CERT_DETAIL_2}}",
    inProgress: false,
  },
  {
    slug: "cert-sliit",
    title: "{{FILL: CERT_TITLE_3}}",
    issuer: "{{FILL: CERT_ISSUER_3}}",
    date: "{{FILL: CERT_DATE_3}}",
    detail: "{{FILL: CERT_DETAIL_3}}",
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
  { name: "{{FILL: LANGUAGE_1}}", level: "fluent" },
  { name: "{{FILL: LANGUAGE_2}}", level: "fluent" },
  { name: "{{FILL: LANGUAGE_3}}", level: "fluent" },
  { name: "{{FILL: LANGUAGE_4}}", level: "intermediate" },
  { name: "{{FILL: LANGUAGE_5}}", level: "beginner" },
];

export type LeadershipItem = {
  org: string;
  role: string;
  dates: string;
  detail: string;
};

export const leadership: LeadershipItem[] = [
  {
    org: "{{FILL: LEADERSHIP_ORG_1}}",
    role: "{{FILL: LEADERSHIP_ROLE_1}}",
    dates: "{{FILL: LEADERSHIP_DATES_1}}",
    detail: "{{FILL: LEADERSHIP_DETAIL_1}}",
  },
  {
    org: "{{FILL: LEADERSHIP_ORG_2}}",
    role: "{{FILL: LEADERSHIP_ROLE_2}}",
    dates: "{{FILL: LEADERSHIP_DATES_2}}",
    detail: "{{FILL: LEADERSHIP_DETAIL_2}}",
  },
  {
    org: "{{FILL: LEADERSHIP_ORG_3}}",
    role: "{{FILL: LEADERSHIP_ROLE_3}}",
    dates: "{{FILL: LEADERSHIP_DATES_3}}",
    detail: "{{FILL: LEADERSHIP_DETAIL_3}}",
  },
];

export type SportsItem = {
  title: string;
  achievement: string;
};

export const sports: SportsItem[] = [
  { title: "{{FILL: SPORT_1}}", achievement: "{{FILL: SPORT_ACHIEVEMENT_1}}" },
  { title: "{{FILL: SPORT_2}}", achievement: "{{FILL: SPORT_ACHIEVEMENT_2}}" },
  { title: "{{FILL: SPORT_3}}", achievement: "{{FILL: SPORT_ACHIEVEMENT_3}}" },
];
