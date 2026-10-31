export const PROCESSES = ["CODE", "AI", "BUILDING", "OPEN SOURCE", "SPORTS", "CURIOSITY"];

export const NODE_LABELS = [
  "cocotb",
  "AI",
  "C++",
  "Python",
  "React",
  "ML",
  "Java",
  "SQL",
  "LangChain",
  "Kotlin",
  "Projects",
  "Ideas",
];

export const GITHUB_URL = "https://github.com/Siddharth-singla";
export const EMAIL = "siddharth22052006@gmail.com";
export const LINKEDIN_URL = "https://www.linkedin.com/in/siddharth-singla200622/";

export const CHAPTERS = [
  { id: "hero", label: "CH 00 · BOOT" },
  { id: "about", label: "OPERATOR PROFILE" },
  { id: "map", label: "WORLD MAP" },
  { id: "voice", label: "VOICE INPUT" },
  { id: "build", label: "CH 01–05 · THE BUILD" },
  { id: "source", label: "CH 06 · GIVING BACK" },
  { id: "lab", label: "LAB" },
  { id: "play", label: "THE MATCH" },
  { id: "mind", label: "CONNECTIONS" },
  { id: "timeline", label: "THE STORY SO FAR" },
  { id: "future", label: "WHAT'S NEXT" },
  { id: "final", label: "GET IN TOUCH" },
];

export const WORLDS = [
  { id: "build", label: "BUILD", glyph: "Terminal", section: "build", desc: "the technology ecosystem and the things it shipped", status: "RUNNING", pos: { x: 86, y: 20 } },
  { id: "play", label: "PLAY", glyph: "Trophy", section: "play", desc: "engineering as a football match — 2024 → 2028", status: "RUNNING", pos: { x: 14, y: 22 } },
  { id: "lab", label: "LAB", glyph: "FlaskConical", section: "lab", desc: "currently experimenting with", status: "UNSTABLE", pos: { x: 14, y: 72 } },
  { id: "mind", label: "MIND", glyph: "Network", section: "mind", desc: "how it's all connected", status: "RUNNING", pos: { x: 50, y: 88 } },
  { id: "future", label: "FUTURE", glyph: "Rocket", section: "future", desc: "what's next", status: "LOADING", pos: { x: 86, y: 70 } },
];

export const EDUCATION = {
  degree: "B.E. COMPUTER SCIENCE",
  school: "Thapar Institute of Engineering and Technology, Patiala",
  years: "2024 — 2028",
  cgpa: "CGPA 9.1/10",
  coursework: ["Data Structures & Algorithms", "Database Systems", "Operating Systems", "ML Fundamentals", "Probability & Statistics"],
};

export const EXPERIENCE = {
  role: "AI/ML INTERN",
  company: "Revino",
  team: "Endpoint Threat Detection",
  years: "FEB 2025 — APR 2025",
  text: "Built the anomaly-detection component of an endpoint threat-monitoring system over a 3-month internship, part of a team developing Sysmon/ETW-based behavioral monitoring and baseline-comparison tooling.",
};

export const CERTS = [
  { name: "Modern AI — Cisco Networking Academy", detail: "LLM fundamentals, computer vision, multimodal systems", date: "MAY 2026" },
  { name: "Pregrad AI/ML Program", detail: "End-to-end ML pipeline: preprocessing, model building, evaluation", date: null },
  { name: "Decoding Finance", detail: "Financial data interpretation and quantitative analytical methods", date: null },
];

export const TECHS = [
  { n: "Python", ring: 0, projects: ["Cache Eviction Visualizer", "Network Intrusion Detection System", "RAG Pipeline", "AI Meeting Assistant"] },
  { n: "Java", ring: 0, projects: [] },
  { n: "JavaScript", ring: 0, projects: ["Blog Verse", "LLD Practice Platform"] },
  { n: "C++", ring: 0, projects: [] },
  { n: "Kotlin", ring: 0, projects: ["Aurora Chat"] },
  { n: "SQL", ring: 0, projects: [] },
  { n: "React", ring: 0, projects: ["Blog Verse"] },
  { n: "Next.js", ring: 0, projects: [] },
  { n: "Node.js", ring: 0, projects: ["Blog Verse"] },
  { n: "Express", ring: 1, projects: ["Blog Verse"] },
  { n: "MongoDB", ring: 1, projects: ["Blog Verse"] },
  { n: "Supabase", ring: 1, projects: [] },
  { n: "Firebase", ring: 1, projects: ["Aurora Chat"] },
  { n: "REST APIs", ring: 1, projects: [] },
  { n: "JWT Authentication", ring: 1, projects: ["Blog Verse"] },
  { n: "DSA", ring: 1, projects: ["Cache Eviction Visualizer"] },
  { n: "Operating Systems", ring: 1, projects: [] },
  { n: "Computer Networks", ring: 1, projects: [] },
  { n: "OOP", ring: 1, projects: [] },
  { n: "System Design Basics", ring: 1, projects: [] },
  { n: "LangChain", ring: 2, projects: ["RAG Pipeline", "AI Meeting Assistant"] },
  { n: "ChromaDB", ring: 2, projects: ["RAG Pipeline"] },
  { n: "Scikit-learn", ring: 2, projects: ["Network Intrusion Detection System"] },
  { n: "Pandas", ring: 2, projects: [] },
  { n: "NumPy", ring: 2, projects: [] },
  { n: "Feature Engineering", ring: 2, projects: [] },
  { n: "Git", ring: 2, projects: [] },
  { n: "GitHub", ring: 2, projects: [] },
  { n: "FastAPI", ring: 2, projects: [] },
  { n: "Vercel", ring: 2, projects: [] },
  { n: "Postman", ring: 2, projects: [] },
];

export const TECH_CHAINS = [
  { chain: ["Python", "Streamlit", "LangChain", "AI Meeting Assistant"] },
  { chain: ["LangChain", "ChromaDB", "Mistral AI", "RAG Pipeline"] },
  { chain: ["React", "Node.js", "Express", "Blog Verse"] },
  { chain: ["Kotlin", "Jetpack Compose", "Firebase", "Aurora Chat"] },
  { chain: ["Python", "Scikit-learn", "UNSW-NB15", "Network Intrusion Detection System"] },
  { chain: ["TypeScript", "Backend API", "Vercel", "Savoury"] },
];

export const FILTERS = [
  { key: "all", label: "ALL" },
  { key: "live", label: "LIVE" },
  { key: "ai", label: "AI" },
  { key: "ml", label: "ML" },
  { key: "fullstack", label: "FULL-STACK" },
  { key: "mobile", label: "MOBILE" },
  { key: "systems", label: "SYSTEMS" },
];

// Stage text that hasn't been written yet. Stages with this text are hidden on the site.
export const PENDING = "Not documented — ask me about it.";

export const PROJECTS = [
  { id: "MOD-01", name: "Cache Eviction Visualizer — LRU vs LFU", date: null, chapter: "CH 01 · FUNDAMENTALS", stack: ["Python", "LRU", "LFU", "O(1) get/put"], tags: ["systems"], links: [{ label: "GITHUB", url: "https://github.com/Siddharth-singla/LRU-LFU-CACHE" }],
    stages: [
      ["IDEA", "Caches are invisible until they misbehave."],
      ["PROBLEM", "LRU vs LFU is easy to memorize and hard to feel."],
      ["EXPERIMENT", "Implementing both from scratch with O(1) get and put."],
      ["BUILD", "A live dashboard comparing LRU and LFU side by side."],
      ["WHAT BROKE", PENDING],
      ["WHAT I LEARNED", PENDING],
      ["CURRENT STATE", "From-scratch implementations with a live comparison dashboard."],
    ] },
  { id: "MOD-02", name: "LLD Practice Platform", date: null, chapter: "CH 01 · FUNDAMENTALS", stack: ["JavaScript", "LLM feedback", "Rubric evaluation"], tags: ["systems"], links: [{ label: "GITHUB", url: "https://github.com/Siddharth-singla/lld-practice-platform" }],
    stages: [
      ["IDEA", "Low-level design is learned by doing, not by reading."],
      ["PROBLEM", "Design practice needs feedback, and humans are slow to give it."],
      ["EXPERIMENT", "Rubric-based evaluation with a real LLM or a simulated evaluator."],
      ["BUILD", "MVP: pick a problem, submit a design, get rubric-based feedback, review attempt history."],
      ["WHAT BROKE", PENDING],
      ["WHAT I LEARNED", PENDING],
      ["CURRENT STATE", "MVP shipped."],
    ] },
  { id: "MOD-03", name: "Blog Verse — Full-Stack Blog Platform", date: "MAY 2026", chapter: "CH 02 · LEARNING TO BUILD", stack: ["React", "Node.js", "Express", "MongoDB", "JWT", "Cloudinary"], tags: ["fullstack"], links: [{ label: "LIVE", url: "https://mern-blog-d1c7.vercel.app" }],
    stages: [
      ["IDEA", "A blog platform where every resource type is a first-class citizen."],
      ["PROBLEM", "Posts, categories, comments and users need clean relations — and real auth."],
      ["EXPERIMENT", "4 core resource types, all backend routes secured with JWT auth middleware."],
      ["BUILD", "React + Node.js/Express + MongoDB with Cloudinary image upload."],
      ["WHAT BROKE", PENDING],
      ["WHAT I LEARNED", PENDING],
      ["CURRENT STATE", "Deployed and live on Vercel."],
    ] },
  { id: "MOD-04", name: "Network Intrusion Detection System", date: "FEB — APR 2026", chapter: "CH 03 · SECURITY & ML", stack: ["Python", "Scikit-learn", "UNSW-NB15"], tags: ["ml"], links: [{ label: "GITHUB", url: "https://github.com/Siddharth-singla/UNSW-NB15-Intrusion-Detection" }],
    stages: [
      ["IDEA", "Spot intrusions by class, not just by alarm."],
      ["PROBLEM", "9 attack categories to tell apart."],
      ["EXPERIMENT", "Multi-class classification on UNSW-NB15 with feature selection."],
      ["BUILD", "30% dimensionality reduction via feature selection, then classifier training and tuning."],
      ["WHAT BROKE", PENDING],
      ["WHAT I LEARNED", "Confusion-matrix analysis and threshold tuning improved recall on 2 low-frequency attack classes."],
      ["CURRENT STATE", "91% precision on the held-out test set across 9 attack categories."],
    ] },
  { id: "MOD-05", name: "RAG — Retrieval-Augmented Generation Pipeline", date: "JUNE 2026", chapter: "CH 04 · AI PRODUCTS", stack: ["Python", "LangChain", "ChromaDB", "Mistral AI", "Streamlit"], tags: ["ai", "ml"], links: [{ label: "GITHUB", url: "https://github.com/Siddharth-singla/RAG" }],
    stages: [
      ["IDEA", "LLMs answer better when they can look things up first."],
      ["PROBLEM", "One retrieval strategy doesn't fit every query."],
      ["EXPERIMENT", "Implementing and benchmarking 3 retrieval strategies: similarity, MMR and MultiQuery."],
      ["BUILD", "Full RAG pipeline across 3 modular components — document loading, chunking, embedding, vector storage, retrieval, LLM QA — with a Streamlit UI."],
      ["WHAT BROKE", PENDING],
      ["WHAT I LEARNED", PENDING],
      ["CURRENT STATE", "3 retrieval strategies benchmarked and wired into the pipeline."],
    ] },
  { id: "MOD-06", name: "AI Meeting Assistant", date: "JULY 2026", chapter: "CH 04 · AI PRODUCTS", stack: ["Python", "Streamlit", "LangChain", "RAG"], tags: ["ai", "ml"], links: [{ label: "GITHUB", url: "https://github.com/Siddharth-singla/AI-VOICE-AGENT" }],
    stages: [
      ["IDEA", "Meetings hold decisions, action items and questions that are easy to lose."],
      ["PROBLEM", "Raw audio isn't searchable, and questions rarely stop at the summary."],
      ["EXPERIMENT", "One pipeline ingesting YouTube and local audio into transcription + LLM prompting."],
      ["BUILD", "End-to-end meeting-intelligence pipeline generating 5 structured outputs: title, summary, action items, key decisions, open questions."],
      ["WHAT BROKE", PENDING],
      ["WHAT I LEARNED", PENDING],
      ["CURRENT STATE", "RAG-based chat runs on each transcript for follow-up queries; transcription and translation across 2 languages (English, Hindi)."],
    ] },
  { id: "MOD-07", name: "Savoury — Hostel Mess Management System", date: "2026 — 27", chapter: "CH 05 · SHIPPING TOGETHER", stack: ["TypeScript", "Backend API", "Mobile app", "Web console"], tags: ["fullstack"], links: [{ label: "GITHUB", url: "https://github.com/Siddharth-singla/Savoury" }, { label: "LIVE", url: "https://savoury-two.vercel.app" }],
    stages: [
      ["IDEA", "One mess, hundreds of students, one shared spreadsheet of chaos."],
      ["PROBLEM", "The kitchen needs to know tonight's count before tonight — and lock it."],
      ["EXPERIMENT", "Per-meal opt-in/opt-out booking with cutoff-driven locking."],
      ["BUILD", "Shared backend API, student mobile app, admin/staff web console; QR/roster-based attendance and a wallet ledger with top-ups and semester-end cashouts."],
      ["WHAT BROKE", PENDING],
      ["WHAT I LEARNED", PENDING],
      ["CURRENT STATE", "Team of 3 — Siddharth Singla, Vineet Tripathi, Shivansh Sahu. Software Engineering (UCS503) at TIET, 2026–27. Live on Vercel."],
    ] },
  { id: "MOD-08", name: "Aurora Chat", date: null, chapter: "CH 05 · SHIPPING TOGETHER", stack: ["Kotlin", "Jetpack Compose", "Firebase Auth"], tags: ["mobile"], links: [{ label: "GITHUB", url: "https://github.com/Siddharth-singla/aurora-chatroom" }],
    stages: [
      ["IDEA", "A chat app where the first impression feels premium, not generic."],
      ["PROBLEM", "Auth is the front door — it has to be hardened, not just present."],
      ["EXPERIMENT", "Firebase email/password auth with a password strength meter."],
      ["BUILD", "Kotlin + Jetpack Compose with a premium animated UI: welcome, sign up, sign in, home."],
      ["WHAT BROKE", PENDING],
      ["WHAT I LEARNED", PENDING],
      ["CURRENT STATE", "Milestone 1 complete: sign up with strength meter, sign in, and email verification on home."],
    ] },
];

export const OSS = [
  { repo: "cocotb/cocotb", desc: "Python-based chip / RTL verification library", prs: [
    { id: "#5873", title: "Document exact time values with Decimal", url: "https://github.com/cocotb/cocotb/pull/5873", state: "MERGED" },
    { id: "#5880", title: "Don't treat leading '-' as a sign in LogicArray int conversion", url: "https://github.com/cocotb/cocotb/pull/5880", state: "MERGED" },
    { id: "#5881", title: "Document default round mode setting", url: "https://github.com/cocotb/cocotb/pull/5881", state: "MERGED" },
    { id: "#5888", title: "Document that random must be seeded before user code", url: "https://github.com/cocotb/cocotb/pull/5888", state: "MERGED" },
    { id: "#5875", title: "Explain task states and trigger firing in the scheduler guide", url: "https://github.com/cocotb/cocotb/pull/5875", state: "OPEN" },
  ] },
  { repo: "collective/icalendar", desc: null, prs: [
    { id: "#1940", title: "Validate UID value on set (#1929)", url: "https://github.com/collective/icalendar/pull/1940", state: "OPEN" },
  ] },
];

export const ARCHIVE_QUOTE = ["Engineering isn't just the things that work.", "A lot of it is figuring out why things don't."];

export const LAB = [
  { n: "AI", status: "BUILDING" },
  { n: "FULL STACK", status: "BUILDING" },
  { n: "REACT", status: "SHIPPING" },
  { n: "BACKEND", status: "EXPERIMENTING" },
  { n: "CLOUD", status: "LEARNING" },
  { n: "COMPUTER VISION", status: "EXPERIMENTING" },
  { n: "VOICE INTERFACES", status: "BROKEN" },
  { n: "PRODUCT DESIGN", status: "LEARNING" },
];

export const PLAYS = [
  { min: "PLAY 01", title: "KICKOFF", text: "2024. B.E. Computer Science begins at Thapar Institute, Patiala. The ball leaves the center circle." },
  { min: "PLAY 02", title: "LEARNING", text: "Data structures, operating systems, networks, probability. Coursework reps win matches." },
  { min: "PLAY 03", title: "BUILDING", text: "Feb 2025: first internship. 2026: eight projects and a team product. The game slows down once you understand it." },
  // pending: hidden on the site until real stories are written for them.
  { min: "PLAY 04", title: "FAILURE", text: "Entry reserved — failure stories available on request.", pending: true },
  { min: "PLAY 05", title: "HACKATHONS", text: "Reserved play. Watch this space.", pending: true },
  { min: "PLAY 06", title: "EXPERIMENTS", text: "Retrieval strategies, threat detection, meeting intelligence. Some work, all teach." },
  { min: "PLAY 07", title: "NEXT PLAY", text: "Then we play again." },
];

export const PLAY_QUOTE = ["You train. You fail. You adapt.", "You work with a team. You compete.", "And then you play again."];

export const MIND_LINKS = [
  ["CODE", "OPEN SOURCE", "COMMUNITY"],
  ["SPORTS", "DISCIPLINE", "ENGINEERING"],
  ["CODE", "PRODUCTS", "ENTREPRENEURSHIP"],
  ["HACKATHONS", "RAPID BUILDING", "PRODUCT THINKING"],
];

export const MIND_QUOTE = ["These aren't random hobbies.", "They influence one another."];

export const TIMELINE = [
  { year: "2024", label: "KICKOFF", items: ["B.E. Computer Science", "Thapar Institute, Patiala", "2024 → 2028"] },
  { year: "2025", label: "BUILDING", items: ["AI/ML Intern @ Revino", "Endpoint threat detection", "Anomaly-detection component"] },
  { year: "2026", label: "EXPANDING", items: ["8 projects", "Savoury · team of 3", "Open source: cocotb, icalendar", "RAG & LLM pipelines", "Cisco Modern AI"] },
  { year: "2027", label: "?", items: [], future: true },
  { year: "2028", label: "?", items: [], future: true },
  { year: "∞", label: "?", items: [], future: true },
];

export const TIMELINE_QUOTE = "The next chapters haven't been written yet.";

export const FUTURE_ITEMS = ["AI", "Software Engineering", "Product Building", "Entrepreneurship", "New Technologies", "Real-world products"];

export const CHECKLIST = [
  ["CODE", "OK"],
  ["AI", "OK"],
  ["OPEN SOURCE", "OK"],
  ["SPORTS", "OK"],
  ["IDEAS", "OK"],
  ["EXPERIENCE", "LOADING"],
];
