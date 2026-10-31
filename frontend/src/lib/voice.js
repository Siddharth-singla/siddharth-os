export const VOICE_EXAMPLES = [
  "Tell me his story",
  "Show me what he built",
  "Show me his open source",
  "How did he get into AI?",
  "Show me his experiments",
];

export function matchCommand(raw, projects) {
  const t = (raw || "").toLowerCase();
  const has = (...ws) => ws.some((w) => t.includes(w));

  if (has("build next", "should i build", "suggest", "idea for")) {
    return {
      kind: "idea",
      reply: ["UNDERSTOOD.", "LOADING /dev/future...", "STATUS: BUILDING."],
    };
  }

  if (/how|why|when/.test(t) && has("ai", "ml", "machine learning")) {
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

  if (has("fail", "broke", "error", "mistake", "did not work", "didn't work", "wrong")) {
    return {
      section: "build",
      label: "BUILD.EXE",
      reply: ["UNDERSTOOD.", "THE FAILURE LOG IS HONESTLY EMPTY.", "LESSONS LIVE INSIDE EACH MODULE'S STAGE NOTES."],
    };
  }

  if (has("music", "sound", "song", "album", "lyric", "track")) {
    return {
      kind: "info",
      reply: [
        "NOTED.",
        "NO MUSIC FILES ON THIS SYSTEM.",
        "THE ONLY SOUNDS ARE THE INTERFACE ITSELF — TICKS, BLIPS & CHAPTER WHOOSHES, MUTED ANY TIME.",
      ],
    };
  }

  if (has("open source", "contribution", "pull request", "cocotb", "icalendar", "giving back")) {
    return {
      section: "source",
      label: "OPEN-SOURCE.LOG",
      reply: ["UNDERSTOOD.", "PULLING MERGED HISTORY...", "4 MERGED · 2 OPEN PULL REQUESTS ACROSS 2 PROJECTS."],
    };
  }

  if (has("lab", "experiment", "currently")) {
    return {
      section: "lab",
      label: "LAB.EXE",
      reply: ["UNDERSTOOD.", "LOADING LAB.EXE...", "8 ACTIVE EXPERIMENTS FOUND."],
    };
  }

  if (has("sport", "football", "soccer", "badminton", "match", "play")) {
    return {
      section: "play",
      label: "PLAY.EXE",
      reply: ["UNDERSTOOD.", "LOADING PLAY.EXE...", "MATCH CLOCK: 90:00 — ENGINEERING 2024→2028"],
    };
  }

  if (has("mind", "connect", "relation", "hobb", "interest", "together")) {
    return {
      section: "mind",
      label: "MIND.MAP",
      reply: ["UNDERSTOOD.", "MAPPING SYNAPSES...", "THESE AREN'T RANDOM HOBBIES."],
    };
  }

  if (has("intern", "revino", "college", "thapar", "cgpa", "education", "certif")) {
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

  if (has("timeline", "journey", "story", "history", "start", "begin", "origin", "who")) {
    return {
      section: "timeline",
      label: "TIMELINE.EXE",
      reply: ["UNDERSTOOD.", "REPLAYING THE STORY...", "2024 THAPAR → 2025 REVINO → 2026 EIGHT PROJECTS & OPEN SOURCE. NEXT CHAPTERS UNWRITTEN."],
    };
  }

  if (has("contact", "email", "linkedin", "reach", "mail")) {
    return {
      section: "final",
      label: "CONTACT.EXE",
      reply: ["UNDERSTOOD.", "OPENING /reach-me...", "EMAIL · GITHUB · LINKEDIN — ALL CHANNELS READY."],
    };
  }

  if (has("future", "next", "goal", "plan", "dream", "ambition", "after")) {
    return {
      section: "future",
      label: "FUTURE.EXE",
      reply: ["UNDERSTOOD.", "LOADING FUTURE.EXE...", "STATUS: BUILDING."],
    };
  }

  const FILTERS = [
    { key: "ai", words: ["ai", "artificial", "llm", "rag", "langchain", "meeting"] },
    { key: "ml", words: ["ml", "machine learning", "model", "sklearn", "scikit", "classifier", "intrusion"] },
    { key: "fullstack", words: ["full stack", "fullstack", "mern", "web", "blog", "savoury", "mess"] },
    { key: "mobile", words: ["mobile", "app", "kotlin", "aurora", "android", "jetpack"] },
    { key: "systems", words: ["systems", "cache", "lru", "lfu", "lld", "design", "algorithm"] },
  ];

  if (has("project", "built", "build", "filter", "module")) {
    const f = FILTERS.find((f) => f.words.some((w) => t.includes(w)));
    if (f) {
      const list = projects.filter((p) => p.tags.includes(f.key));
      return {
        section: "build",
        label: "BUILD.EXE",
        filter: f.key,
        reply: [
          "UNDERSTOOD.",
          "FILTERING...",
          f.key.toUpperCase(),
          ...list.map((p, i) => `${i === list.length - 1 ? "└──" : "├──"} ${p.name.toUpperCase()}`),
        ],
      };
    }
    return {
      section: "build",
      label: "BUILD.EXE",
      reply: ["UNDERSTOOD.", "LOADING BUILD.EXE...", "31 TECHNOLOGIES · 8 SYSTEM MODULES."],
    };
  }

  return {
    reply: [
      "COMMAND NOT RECOGNIZED.",
      "TRY:",
      '"show me what he built" · "show me his open source"',
      '"show me his experiments" · "how did he get into AI?"',
    ],
  };
}
