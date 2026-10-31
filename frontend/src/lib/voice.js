import { matchClock } from "./clock";

export const VOICE_EXAMPLES = [
  "Tell me his story",
  "Show me what he built",
  "Show me his AI work",
  "How did he get into AI?",
  "Projects dikhao",
];

// Spoken commands arrive messy: fillers, politeness, Hinglish. Normalise first.
const FILLERS = [
  "um", "umm", "uh", "uhh", "hmm", "like", "basically", "actually", "please", "pls",
  "can you", "could you", "would you", "i want to", "i wanna", "let me", "just",
  "matlab", "yaar", "bhai", "na", "toh", "zara", "thoda", "jara",
];

const HINGLISH = [
  [/\b(dikhao|dikha do|dikhaao|dikhana|dikhaiye|dikha)\b/g, "show"],
  [/\b(batao|bata do|bataao|bataiye|bata)\b/g, "tell"],
  [/\b(sunao|suna do|sunaao|bajao)\b/g, "play music"],
  [/\b(kahani|kahaani)\b/g, "story"],
  [/\b(kaise|kaisa|kaise kiya)\b/g, "how"],
  [/\b(kyun|kyon|kyu)\b/g, "why"],
  [/\b(kab)\b/g, "when"],
  [/\b(kya)\b/g, "what"],
  [/\b(banaya|banayi|banaye|banaa)\b/g, "built"],
  [/\b(kaam)\b/g, "work"],
  [/\b(khel|khelta|khelna)\b/g, "sports"],
  [/\b(padhai)\b/g, "education"],
  [/\b(aage|agla|aagey)\b/g, "next"],
  [/\b(sampark|baat karni|baat karo)\b/g, "contact"],
  [/\b(uska|uski|uske|iska|iski|iske|unka|unki)\b/g, "his"],
  [/\b(gaana|gaane|gana)\b/g, "music"],
  [/\b(saare|saara|sab)\b/g, "all"],
];

export function normalize(raw) {
  let t = (raw || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9+#./\s-]/g, " ");
  for (const [re, to] of HINGLISH) t = t.replace(re, to);
  for (const f of FILLERS) t = t.replace(new RegExp(`\\b${f}\\b`, "g"), " ");
  return t.replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();
}

// Spoken names for each project, matched as whole words.
const PROJECT_NAMES = [
  { id: "MOD-07", words: ["savoury", "savory", "mess", "hostel"] },
  { id: "MOD-05", words: ["rag", "retrieval"] },
  { id: "MOD-06", words: ["meeting", "meeting assistant"] },
  { id: "MOD-04", words: ["intrusion", "nids", "unsw"] },
  { id: "MOD-03", words: ["blog", "blog verse", "blogverse"] },
  { id: "MOD-08", words: ["aurora", "chat app"] },
  { id: "MOD-02", words: ["lld", "low level design"] },
  { id: "MOD-01", words: ["cache", "lru", "lfu"] },
];

const FILTER_WORDS = [
  { key: "live", words: ["live", "ship", "shipped", "ships", "deployed", "launched", "production"] },
  { key: "ai", words: ["ai", "artificial intelligence", "llm", "llms", "langchain", "genai"] },
  { key: "ml", words: ["ml", "machine learning", "model", "models", "sklearn", "scikit", "classifier", "data science"] },
  { key: "fullstack", words: ["full stack", "fullstack", "full-stack", "mern", "web", "website", "websites"] },
  { key: "mobile", words: ["mobile", "android", "kotlin", "jetpack", "app", "apps"] },
  { key: "systems", words: ["systems", "system design", "algorithm", "algorithms", "dsa", "fundamentals"] },
];

const SLASH = {
  "/build": ["build", "BUILD.EXE"],
  "/source": ["source", "OPEN-SOURCE.LOG"],
  "/oss": ["source", "OPEN-SOURCE.LOG"],
  "/lab": ["lab", "LAB.EXE"],
  "/play": ["play", "PLAY.EXE"],
  "/mind": ["mind", "MIND.MAP"],
  "/story": ["timeline", "TIMELINE.EXE"],
  "/timeline": ["timeline", "TIMELINE.EXE"],
  "/future": ["future", "FUTURE.EXE"],
  "/contact": ["final", "CONTACT.EXE"],
};

const HELP = [
  "AVAILABLE COMMANDS",
  "/build  /source  /lab  /play  /mind  /story  /future  /contact",
  "OR JUST ASK: \"show me his AI work\" · \"tell me about savoury\"",
  "SOUND: \"play some music\" · \"mute\"",
];

function listReply(title, list) {
  return [
    "UNDERSTOOD.",
    "FILTERING...",
    title,
    ...list.map((p, i) => `${i === list.length - 1 ? "└──" : "├──"} ${p.name.toUpperCase()}`),
  ];
}

export function matchCommand(raw, projects, opts = {}) {
  const rawTrim = (raw || "").trim().toLowerCase();
  const t = normalize(raw);
  const words = new Set(t.split(" "));
  const has = (...xs) => xs.some((x) => (x.includes(" ") ? ` ${t} `.includes(` ${x} `) : words.has(x)));
  const techCount = opts.techCount;

  if (!t) return { reply: [] };

  // --- slash commands and easter eggs ---
  const slash = rawTrim.split(/\s+/)[0];
  if (SLASH[slash]) {
    const [section, label] = SLASH[slash];
    return { section, label, reply: [`OPENING ${label}...`] };
  }
  if (rawTrim === "help" || rawTrim === "/help" || rawTrim === "?" || has("commands", "help")) {
    return { reply: HELP };
  }
  if (rawTrim.startsWith("sudo")) {
    return /siddharth/.test(rawTrim)
      ? { kind: "sudo", reply: ["[sudo] password for guest: ********", "ACCESS GRANTED.", "WELCOME BACK, OPERATOR."] }
      : { reply: ["guest is not in the sudoers file.", "THIS INCIDENT WILL BE REPORTED."] };
  }
  if (rawTrim === "whoami") {
    return { kind: "whoami", reply: [] };
  }
  if (/rm\s+-rf/.test(rawTrim)) {
    return { reply: ["NICE TRY."] };
  }
  if (has("hey wispr", "hi wispr", "hello wispr", "hey whisper", "hi whisper", "hello whisper")) {
    return {
      reply: [
        "HELLO, WISPR TEAM.",
        "THIS WHOLE SYSTEM RUNS ON THE SAME IDEA AS FLOW:",
        "TALKING IS THE FASTEST WAY TO GET WHAT YOU WANT.",
      ],
    };
  }

  // --- sound ---
  if (has("mute", "silence", "sound off", "quiet", "shut up")) {
    return { kind: "mute", reply: ["SOUND: OFF."] };
  }
  if (has("unmute", "sound on")) {
    return { kind: "unmute", reply: ["SOUND: ON."] };
  }
  if (has("music", "song", "songs", "sound", "sounds", "album", "track", "melody", "tune")) {
    return {
      kind: "sound",
      reply: [
        "NOW PLAYING: THE INTERFACE.",
        "EVERY WORLD, COMMAND AND CLICK HAS ITS OWN NOTE.",
        "D MAJOR PENTATONIC · NOTHING IS PRE-RECORDED.",
      ],
    };
  }

  // --- the closing question ---
  if (has("build next", "should build", "should i build", "should he build", "you should build", "idea", "ideas", "suggest", "suggestion")) {
    return {
      kind: "idea",
      section: "final",
      label: "IDEAS.INBOX",
      reply: ["UNDERSTOOD.", "OPENING THE IDEAS INBOX..."],
    };
  }

  // --- a specific project ---
  const named = PROJECT_NAMES.find((p) => p.words.some((w) => has(w)));
  if (named) {
    const p = projects.find((x) => x.id === named.id);
    if (p) {
      return {
        section: "build",
        label: "BUILD.EXE",
        filter: `project:${p.id}`,
        reply: ["UNDERSTOOD.", `OPENING MODULE ${p.id}...`, `→ ${p.name.toUpperCase()}`],
      };
    }
  }

  // --- questions ---
  if (has("how", "why", "when") && has("ai", "ml", "machine learning", "artificial intelligence")) {
    return {
      section: "timeline",
      label: "TIMELINE.EXE",
      reply: [
        "UNDERSTOOD.",
        "TRACING ORIGIN STORY...",
        "2024: B.E. CS BEGINS → 2025: AI/ML INTERN @ REVINO → 2026: RAG, LLM PIPELINES, SAVOURY & OPEN SOURCE.",
      ],
    };
  }

  if (has("fail", "failed", "failure", "failures", "broke", "broken", "error", "errors", "mistake", "mistakes", "bug", "bugs", "did not work", "didnt work", "wrong")) {
    return {
      section: "build",
      label: "BUILD.EXE",
      reply: ["UNDERSTOOD.", "THE FAILURE LOG IS STILL BEING WRITTEN UP.", "FOR NOW, THE LESSONS LIVE INSIDE EACH MODULE."],
    };
  }

  if (has("open source", "opensource", "contribution", "contributions", "contribute", "pull request", "pull requests", "pr", "prs", "cocotb", "icalendar", "giving back")) {
    const merged = opts.oss ? opts.oss.merged : null;
    const open = opts.oss ? opts.oss.open : null;
    return {
      section: "source",
      label: "OPEN-SOURCE.LOG",
      reply: [
        "UNDERSTOOD.",
        "PULLING MERGED HISTORY...",
        merged != null ? `${merged} MERGED · ${open} OPEN PULL REQUESTS.` : "LOADING PULL REQUESTS.",
      ],
    };
  }

  if (
    has("lab", "experiment", "experiments", "experimenting", "currently", "working on", "learning", "right now") &&
    !has("machine learning", "deep learning")
  ) {
    return {
      section: "lab",
      label: "LAB.EXE",
      reply: ["UNDERSTOOD.", "LOADING LAB.EXE...", "8 ACTIVE EXPERIMENTS FOUND."],
    };
  }

  if (has("sport", "sports", "football", "soccer", "badminton", "match", "play", "game", "games")) {
    const c = matchClock();
    return {
      section: "play",
      label: "PLAY.EXE",
      reply: ["UNDERSTOOD.", "LOADING PLAY.EXE...", `MATCH CLOCK: ${c.text} · ${c.half} · ENGINEERING 2024→2028`],
    };
  }

  if (has("mind", "connect", "connected", "connection", "connections", "relation", "hobby", "hobbies", "interest", "interests", "personality", "together")) {
    return {
      section: "mind",
      label: "MIND.MAP",
      reply: ["UNDERSTOOD.", "MAPPING SYNAPSES...", "THESE AREN'T RANDOM HOBBIES."],
    };
  }

  if (has("hire", "hiring", "available", "availability", "open to", "looking for", "recruit", "recruiter", "job", "jobs", "role")) {
    return {
      section: "final",
      label: "CONTACT.EXE",
      reply: ["UNDERSTOOD.", "STATUS: OPEN TO INTERNSHIPS.", "OPENING /reach-me..."],
    };
  }

  if (has("intern", "internship", "internships", "revino", "college", "thapar", "cgpa", "gpa", "education", "degree", "certificate", "certificates", "certification", "certifications", "resume", "cv", "experience")) {
    return {
      section: "build",
      label: "BUILD.EXE",
      reply: [
        "UNDERSTOOD.",
        "PULLING THE PAPER TRAIL...",
        "B.E. CS @ THAPAR (2024–2028 · CGPA 9.1/10) · AI/ML INTERN @ REVINO (FEB–APR 2025) · 3 CERTIFICATIONS.",
      ],
    };
  }

  if (has("timeline", "journey", "story", "history", "start", "started", "begin", "beginning", "origin", "who", "about him", "yourself", "himself")) {
    return {
      section: "timeline",
      label: "TIMELINE.EXE",
      reply: ["UNDERSTOOD.", "REPLAYING THE STORY...", "2024 THAPAR → 2025 REVINO → 2026 EIGHT PROJECTS & OPEN SOURCE. NEXT CHAPTERS UNWRITTEN."],
    };
  }

  if (has("contact", "email", "mail", "linkedin", "reach", "message", "talk to him", "call")) {
    return {
      section: "final",
      label: "CONTACT.EXE",
      reply: ["UNDERSTOOD.", "OPENING /reach-me...", "EMAIL · GITHUB · LINKEDIN — ALL CHANNELS READY."],
    };
  }

  if (has("future", "next", "goal", "goals", "plan", "plans", "dream", "dreams", "ambition", "ambitions", "after")) {
    return {
      section: "future",
      label: "FUTURE.EXE",
      reply: ["UNDERSTOOD.", "LOADING FUTURE.EXE...", "STATUS: BUILDING."],
    };
  }

  // --- project filters ---
  const f = FILTER_WORDS.find((x) => x.words.some((w) => has(w)));
  if (f) {
    const list =
      f.key === "live"
        ? projects.filter((p) => p.links.some((l) => l.label === "LIVE"))
        : projects.filter((p) => p.tags.includes(f.key));
    if (list.length) {
      return {
        section: "build",
        label: "BUILD.EXE",
        filter: f.key,
        reply: listReply(f.key === "live" ? "LIVE ON THE INTERNET" : f.key.toUpperCase(), list),
      };
    }
  }

  if (has("project", "projects", "built", "build", "building", "made", "make", "work", "portfolio", "module", "modules", "code", "stack", "skills", "tech", "best", "cool", "impressive", "favourite", "favorite")) {
    return {
      section: "build",
      label: "BUILD.EXE",
      reply: [
        "UNDERSTOOD.",
        "LOADING BUILD.EXE...",
        `${techCount ? `${techCount} TECHNOLOGIES · ` : ""}${projects.length} SYSTEM MODULES.`,
      ],
    };
  }

  return {
    kind: "unknown",
    reply: [
      "COMMAND NOT RECOGNIZED.",
      "TRY:",
      '"show me what he built" · "show me his open source"',
      '"how did he get into AI?" · "help"',
    ],
  };
}
