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
