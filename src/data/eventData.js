/**
 * HackFest 3.0 - Central Event Data Architecture
 * Student Developer Club, REC Banda
 * 
 * All copy, timelines, criteria, and details are centralized here
 * for straightforward configuration by the organizing committee.
 */

export const eventMeta = {
  name: "HACKFEST 3.0",
  edition: "3.0",
  organizer: "Student Developer Club",
  institution: "Rajkiya Engineering College Banda",
  institutionShort: "REC Banda",
  tagline: "THE WORLD IS CHANGING. BUILD WHAT COMES NEXT.",
  theme: "Doomsday Disruption & Rebuilding the Future",
  dates: "OCTOBER 2026", // Configurable event dates
  datesDisplay: "2 DAYS OF HIGH-IMPACT COMPUTING",
  venue: "Multipurpose Hall, REC Banda Campus, Atarra, Banda (U.P.)",
  venueShort: "Multipurpose Hall, REC Banda",
  eligibility: "Open to student developers, designers, thinkers, and engineers across all recognized institutions.",
  teamSize: {
    hackathon: "2 to 4 members per team",
    ideathon: "1 to 3 members per team",
    codeathon: "Individual participation"
  },
  registrationStatus: "OPEN",
  registrationDeadline: "REGISTRATION CLOSING SOON",
  contactEmail: "sdc@recbanda.ac.in",
  socials: {
    instagram: "https://instagram.com/sdc_recb",
    linkedin: "https://linkedin.com/company/student-developer-club-rec-banda",
    x: "https://x.com/sdcrecbanda",
    website: "https://recbanda.ac.in"
  }
};

export const eventHighlights = [
  {
    number: "03",
    label: "COMPETITIONS",
    description: "Codeathon, Ideathon, and the Flagship Hackathon challenging every tier of technical ability."
  },
  {
    number: "06",
    label: "PROBLEM CATEGORIES",
    description: "Multi-disciplinary crisis tracks addressing systemic challenges in a changing world."
  },
  {
    number: "02",
    label: "INTENSIVE DAYS",
    description: "48 continuous hours of conceptualization, algorithmic combat, mentoring, and execution."
  },
  {
    number: "01",
    label: "UNITED TECH COMMUNITY",
    description: "Over 500+ builders, innovators, alumni, and faculty driving practical engineering."
  }
];

export const additionalHighlights = [
  {
    title: "MENTORING",
    desc: "1-on-1 milestone reviews by seasoned seniors and industry practitioners throughout the build cycle."
  },
  {
    title: "EXPERT JUDGING",
    desc: "Rigorous evaluation panels led by academic leadership and senior technology specialists."
  },
  {
    title: "TEAM COLLABORATION",
    desc: "Synergistic problem solving combining full-stack development, product strategy, and systems design."
  },
  {
    title: "LIVE PROJECT BUILDING",
    desc: "From zero lines of code to validated functional prototypes demoed live in the Multipurpose Hall."
  }
];

export const competitions = [
  {
    id: "codeathon",
    title: "CODEATHON",
    badge: "EVENT 01",
    tagline: "THINK FAST. CODE SMART.",
    duration: "1.5 HOURS",
    format: "COMPETITIVE CODING",
    evaluation: "RANKING-BASED RESULT",
    themeColor: "steel-blue",
    cardTone: "rgba(60, 83, 107, 0.18)",
    borderTone: "#3C536B",
    accentColor: "#3C536B",
    bgImage: "/images/codeathon-matrix.jpg",
    cta: "EXPLORE CODEATHON",
    shortDescription: "A high-stakes 90-minute algorithmic competition. Test data structures, algorithmic efficiency, and problem-solving velocity against the ticking clock.",
    fullOverview: "The Codeathon is HackFest 3.0's speed and computational trial. Held inside a controlled environment, coders are presented with a calibrated problem set ranging from foundational algorithmic puzzles to complex dynamic programming and graph challenges. Speed, precision, and edge-case handling dictate the leaderboard.",
    rules: [
      "Individual participation only. No team collaboration is permitted.",
      "Strict 1.5 hours (90 minutes) window. Timers start simultaneously for all participants.",
      "All submissions must pass automated test vectors within prescribed execution time and memory limits.",
      "Plagiarism checks are executed post-contest; identical logic or unauthorized assistance results in immediate disqualification.",
      "Standard programming languages supported: C++, Java, Python, and C.",
      "Any form of external communication or tab-switching outside the testing platform is logged and strictly barred."
    ],
    resultCriteria: {
      type: "FINAL LEADERBOARD / RANKING",
      metrics: [
        { label: "SCORE", detail: "Points allocated per problem based on test cases solved." },
        { label: "RANK", detail: "Real-time positioning determined by cumulative solved weight." },
        { label: "TIME / PENALTY", detail: "Elapsed minutes plus penalty applied for incorrect submissions." },
        { label: "TIE-BREAK RULES", detail: "Ties resolved automatically by chronological submission timestamps and lower penalty counts." }
      ]
    },
    timeline: [
      { step: "01", name: "PORTAL LOGIN", time: "DAY 1 • [TO BE DECIDED]" },
      { step: "02", name: "PROBLEM REVEAL", time: "DAY 1 • [TO BE DECIDED]" },
      { step: "03", name: "CODING SPRINT (1.5 HRS)", time: "DAY 1 • [TO BE DECIDED]" },
      { step: "04", name: "LEADERBOARD FREEZE & AUDIT", time: "DAY 1 • [TO BE DECIDED]" }
    ],
    faqs: [
      { q: "What platform will be used for Codeathon?", a: "The contest will be hosted on a dedicated competitive programming platform configured for REC Banda." },
      { q: "Can I use external code templates?", a: "Standard boilerplate templates are permitted; importing complete algorithmic libraries that bypass core problem logic is prohibited." },
      { q: "What happens in case of internet instability?", a: "Local server synchronization and offline buffer logs ensure that submitted answers are preserved." }
    ]
  },
  {
    id: "ideathon",
    title: "IDEATHON",
    badge: "EVENT 02",
    tagline: "ONE IDEA. ONE PITCH.",
    duration: "SINGLE PITCHING ROUND",
    format: "PITCH & DEFENSE",
    evaluation: "INNOVATION-FOCUSED EVALUATION",
    themeColor: "burgundy",
    cardTone: "rgba(87, 36, 43, 0.22)",
    borderTone: "#57242B",
    accentColor: "#8F3035",
    bgImage: "/images/ideathon-concept.jpg",
    cta: "EXPLORE IDEATHON",
    shortDescription: "A focused defense of disruptive concepts. Present strategic technical solutions, viability frameworks, and market roadmaps to a critical jury.",
    fullOverview: "The Ideathon is designed for visionaries, systems architects, and product strategists. Participants articulate an original solution to a pressing societal or technological bottleneck. With a single round to deliver your presentation and endure intense judge Q&A, clarity, feasibility, and impact reign supreme.",
    rules: [
      "Teams of 1 to 3 members permitted.",
      "Each team receives a strictly timed pitch window followed by an intensive Judge Q&A session.",
      "Presentations must use the standardized HackFest 3.0 slide deck structure (Problem, Proposed Tech Architecture, Feasibility, Scalability, Roadmap).",
      "Concepts must be original. Prior academic submissions must disclose existing progress.",
      "Physical mockups, wireframes, or architectural diagrams are strongly encouraged during the pitch."
    ],
    judgingCriteria: [
      { criterion: "PROBLEM IDENTIFICATION", weight: "[TO BE DECIDED]" },
      { criterion: "ORIGINALITY", weight: "[TO BE DECIDED]" },
      { criterion: "SOLUTION APPROACH", weight: "[TO BE DECIDED]" },
      { criterion: "FEASIBILITY", weight: "[TO BE DECIDED]" },
      { criterion: "IMPACT", weight: "[TO BE DECIDED]" },
      { criterion: "SCALABILITY", weight: "[TO BE DECIDED]" },
      { criterion: "PRESENTATION", weight: "[TO BE DECIDED]" },
      { criterion: "Q&A / DEFENSE", weight: "[TO BE DECIDED]" }
    ],
    timeline: [
      { step: "01", name: "PITCH ROSTER POSTING", time: "DAY 1 • [TO BE DECIDED]" },
      { step: "02", name: "SINGLE PITCHING ROUND", time: "DAY 1 • AFTERNOON" },
      { step: "03", name: "JURY CROSS-EXAMINATION", time: "DAY 1 • CONCURRENT" },
      { step: "04", name: "EVALUATION SCORE COLLATION", time: "DAY 1 • POST-PITCH" }
    ],
    faqs: [
      { q: "Is working code required for the Ideathon?", a: "No functional code is mandatory, but detailed technical architecture, UI wireframes, and implementation feasibility plans are vital." },
      { q: "What is the pitch duration?", a: "Exact minutes per pitch and Q&A will be briefed during the Official Event Briefing on Day 1." }
    ]
  },
  {
    id: "hackathon",
    title: "HACKATHON",
    badge: "MAIN EVENT • FLAGSHIP HACKATHON",
    tagline: "BUILD WHAT COMES NEXT.",
    duration: "2-DAY IMMERSIVE BUILD",
    format: "6 PROBLEM CATEGORIES • TEAM DEVELOPMENT",
    evaluation: "MENTOR REVIEWS & LIVE JURY DEMO",
    themeColor: "crimson",
    cardTone: "rgba(143, 48, 53, 0.25)",
    borderTone: "#8F3035",
    accentColor: "#8F3035",
    bgImage: "/images/hackathon-rebuild.jpg",
    cta: "EXPLORE HACKATHON",
    isDominant: true,
    shortDescription: "The premier centerpiece of HackFest 3.0. Form a team, choose one of six crisis problem categories, build an operational prototype, and demo it live before industry experts.",
    fullOverview: "In a world destabilized by rapid shifts, the Hackathon is where engineers stand up and rebuild. Spanning Day 2 in full force, teams select one of 6 official crisis categories announced at the event. Through dedicated mentoring touchpoints and rigorous live testing, participants transform abstract concepts into deployable code, responsive web apps, AI systems, and hardware integrations.",
    rules: [
      "Team size: 2 to 4 registered participants. Cross-year and inter-departmental teams are encouraged.",
      "All code and project repositories must be started afresh during HackFest 3.0. Open-source libraries and APIs are permitted with clear attribution.",
      "Teams must pick exactly one of the 6 official problem categories.",
      "Attendance at mandatory mentoring rounds is required for qualification to final judging.",
      "All repositories must contain a comprehensive README, setup instructions, and architecture breakdown prior to final submission cutoff.",
      "Final presentations require a live, functioning prototype demonstration on stage in the Multipurpose Hall."
    ],
    judgingCriteria: [
      { criterion: "PROBLEM UNDERSTANDING", weight: "[TO BE DECIDED]" },
      { criterion: "QUALITY OF SOLUTION", weight: "[TO BE DECIDED]" },
      { criterion: "INNOVATION", weight: "[TO BE DECIDED]" },
      { criterion: "TECHNICAL IMPLEMENTATION", weight: "[TO BE DECIDED]" },
      { criterion: "FUNCTIONALITY", weight: "[TO BE DECIDED]" },
      { criterion: "USABILITY & FEASIBILITY", weight: "[TO BE DECIDED]" },
      { criterion: "IMPACT", weight: "[TO BE DECIDED]" },
      { criterion: "SCALABILITY", weight: "[TO BE DECIDED]" },
      { criterion: "PRESENTATION & DEMO", weight: "[TO BE DECIDED]" }
    ],
    timeline: [
      { step: "01", name: "CATEGORY SELECTION", time: "DAY 2 • MORNING" },
      { step: "02", name: "DEVELOPMENT COMMENCES", time: "DAY 2 • [TO BE DECIDED]" },
      { step: "03", name: "MENTORING ROUNDS", time: "DAY 2 • AFTERNOON" },
      { step: "04", name: "FINAL SUBMISSION CUTOFF", time: "DAY 2 • [TO BE DECIDED]" },
      { step: "05", name: "LIVE JURY DEMONSTRATIONS", time: "DAY 2 • EVENING" }
    ],
    faqs: [
      { q: "Can we build hardware projects?", a: "Yes. Both software and software-hardware integrated prototypes are welcome, provided you bring necessary development boards." },
      { q: "Are pre-built templates or existing projects allowed?", a: "No. Existing projects will be disqualified. Foundational frameworks (e.g., create-vite-app, Django scaffolding) are allowed once the clock starts." }
    ]
  }
];

export const problemCategories = [
  {
    id: "cat-01",
    number: "01",
    title: "[PROBLEM CATEGORY 01]",
    placeholderNotice: "OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING",
    theme: "Resilient Infrastructure & Autonomous Systems",
    background: "Modern public infrastructure—from power distribution grids to distributed transit and logistics networks—remains vulnerable to severe environmental disruptions, cascading outages, and single points of failure.",
    challenge: "Design and implement a decentralized, highly fault-tolerant system capable of monitoring, rerouting, or automatically balancing infrastructure services during catastrophic system failure.",
    requirements: [
      "Real-time or simulated sensory telemetry ingestion.",
      "Fault-detection algorithms with failover mechanism.",
      "Intuitive operational dashboard for disaster control teams.",
      "Low-bandwidth emergency communication fallback protocol."
    ],
    expectedOutcome: "A functional working prototype demonstrating automated failure isolation and dynamic rerouting under simulated stress conditions.",
    suggestedDirection: "Exploration of edge computing, distributed consensus, mesh communication, and lightweight telemetry visualization.",
    submissionInfo: "GitHub repository with setup instructions, architectural diagram, and a 3-minute video/live demonstration."
  },
  {
    id: "cat-02",
    number: "02",
    title: "[PROBLEM CATEGORY 02]",
    placeholderNotice: "OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING",
    theme: "Adaptive Crisis Healthcare & Triage Systems",
    background: "During regional crises and sudden population displacement, traditional healthcare centers suffer from severe information bottlenecks, chaotic patient triaging, and supply chain stock-outs.",
    challenge: "Build an adaptive triage and resource optimization platform that connects emergency medical teams, matches critical medical supplies, and tracks patient acuity under high latency or offline constraints.",
    requirements: [
      "Rapid patient intake and risk stratification mechanism.",
      "Offline-first synchronization capabilities for field clinics.",
      "Dynamic inventory and resource matching engine.",
      "Privacy-preserving medical record transmission."
    ],
    expectedOutcome: "An operational application showcasing offline data capture, peer sync, and intelligent patient triage prioritisation.",
    suggestedDirection: "PWA/Mobile-first designs, local SQLite/IndexedDB sync engines, lightweight predictive triage logic.",
    submissionInfo: "Executable codebase, API documentation, and test scenario walkthrough."
  },
  {
    id: "cat-03",
    number: "03",
    title: "[PROBLEM CATEGORY 03]",
    placeholderNotice: "OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING",
    theme: "Sustainable Energy, Grid Balancing & Climate Response",
    background: "Disrupted electrical networks require decentralized renewable microgrids capable of self-healing and dynamic load shifting when central power generation ceases.",
    challenge: "Develop an intelligent microgrid management software engine that optimizes distributed solar/battery storage usage and prioritizes critical life-support loads across communities.",
    requirements: [
      "Simulated load and supply forecasting logic.",
      "Automated shedding of non-essential power loads.",
      "Peer-to-peer virtual energy trading or distribution ledger.",
      "Participant engagement UI showing carbon and reserve metrics."
    ],
    expectedOutcome: "A simulation environment or hardware-in-the-loop dashboard illustrating real-time balancing between erratic supply and shifting demand.",
    suggestedDirection: "Smart contracts, time-series forecasting, IoT telemetry simulators, WebSockets.",
    submissionInfo: "Complete codebase with reproducible test vectors and simulation playback."
  },
  {
    id: "cat-04",
    number: "04",
    title: "[PROBLEM CATEGORY 04]",
    placeholderNotice: "OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING",
    theme: "Secure Communications & Disinformation Defense",
    background: "In the wake of major disruption, information channels are inundated with spoofed communications, malicious panic mongering, and breakdown of trusted authorities.",
    challenge: "Construct a verifiable emergency communication protocol that authenticates civic alerts, verifies eyewitness reports, and dispels misleading rumors without requiring centralized servers.",
    requirements: [
      "Cryptographic signing and verification of crisis bulletins.",
      "Crowdsourced anomaly and corroboration engine.",
      "Tamper-evident public ledger or distributed verification tree.",
      "Accessible multi-lingual mobile interface for citizens."
    ],
    expectedOutcome: "A working proof-of-concept demonstrating verification of incoming distress beacons and defense against spoofed broadcasts.",
    suggestedDirection: "Zero-knowledge proofs, asymmetric public key infrastructure, decentralized identity (DID).",
    submissionInfo: "Code repository with cryptographic verification unit tests and architecture paper."
  },
  {
    id: "cat-05",
    number: "05",
    title: "[PROBLEM CATEGORY 05]",
    placeholderNotice: "OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING",
    theme: "Autonomous Logistics & Disaster Relief Distribution",
    background: "Physical delivery of relief provisions, clean water, and tools into blocked or disrupted zones is delayed by fractured transportation links and lack of coordination.",
    challenge: "Create an autonomous routing and consignment allocation system that coordinates ground volunteers, drone routes, and depot checkpoints to optimize delivery times and prevent wastage.",
    requirements: [
      "Dynamic shortest-path routing algorithm accounting for hazard zones.",
      "Consignment tracking with proof-of-delivery validation.",
      "Volunteer assignment module based on skill and proximity.",
      "Interactive command & dispatch map."
    ],
    expectedOutcome: "An interactive command portal demonstrating routing optimization and dispatch allocation across disrupted zones.",
    suggestedDirection: "Geospatial indexing (H3, PostGIS), genetic algorithms, real-time dispatch systems.",
    submissionInfo: "Repository link, deployment URL, and routing benchmark report."
  },
  {
    id: "cat-06",
    number: "06",
    title: "[PROBLEM CATEGORY 06]",
    placeholderNotice: "OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING",
    theme: "Open Innovation, Economic Rebuilding & Civic Tech",
    background: "Post-crisis rebuilding demands grassroots economic tools that allow local artisans, students, and small enterprises to barter skills, organize micro-labor, and restart local economies.",
    challenge: "Develop an open-source platform facilitating decentralized skill exchange, mutual aid coordination, and verifiable micro-credentials to empower community restoration.",
    requirements: [
      "Peer-to-peer skill and resource matching engine.",
      "Verifiable contribution credentials or karma metrics.",
      "Lightweight accessibility for low-end mobile devices.",
      "Community governance and dispute settlement mechanisms."
    ],
    expectedOutcome: "A fully responsive web platform enabling community task creation, fulfillment verification, and credential issuance.",
    suggestedDirection: "Modern full-stack web architectures, accessible UI/UX, progressive offline caching.",
    submissionInfo: "Live deployed web link, public source repository, and demo account credentials."
  }
];

export const scheduleData = {
  day1: {
    dayNumber: "DAY 01",
    theme: "INDUCTION, ALGORITHMIC COMBAT & CONCEPTUAL DEFENSE",
    date: "[TO BE DECIDED]",
    venue: "Multipurpose Hall, REC Banda",
    items: [
      {
        order: "01",
        time: "[TO BE DECIDED]",
        title: "OPENING CEREMONY",
        location: "Multipurpose Hall",
        speaker: "SDC Leadership & Faculty Coordinators",
        description: "Official inaugural gathering of HackFest 3.0. Welcome address, lamp lighting ceremony, and introduction of esteemed dignitaries.",
        dignitaries: [
          { name: "Dr. Abhijeet Singh Sir", role: "Coordinator, Student Developer Club" },
          { name: "Dr. Vibhash Yadav Sir", role: "Head of Department, Information Technology" }
        ],
        highlight: true
      },
      {
        order: "02",
        time: "[TO BE DECIDED]",
        title: "MOTIVATIONAL ADDRESS",
        location: "Multipurpose Hall",
        speaker: "Dr. Abhijeet Singh Sir & Dr. Vibhash Yadav Sir",
        description: "Keynote inspiring the student developer community on technical resilience, engineering mindset, and building what comes next in an evolving technology landscape.",
        note: "Official keynote session."
      },
      {
        order: "03",
        time: "[TO BE DECIDED]",
        title: "OFFICIAL EVENT BRIEFING",
        location: "Multipurpose Hall",
        speaker: "SDC Core Organizing Committee",
        description: "Comprehensive walkthrough of event structure, competition formats, code submission protocols, judging standards, participant requirements, and strict deadlines."
      },
      {
        order: "04",
        time: "[TO BE DECIDED]",
        title: "CODEATHON — 1.5 HOURS",
        location: "Computing Centers & Designated Labs",
        speaker: "Codeathon Lead Coordinators",
        description: "90 minutes of intensive algorithmic problem solving. Participants race to solve calibrated challenges on the competitive programming portal.",
        badge: "EVENT 01",
        highlight: true
      },
      {
        order: "05",
        time: "[TO BE DECIDED]",
        title: "LUNCH BREAK",
        location: "Dining Hall / Campus Cafeteria",
        description: "Nutritious meal break and casual networking between competitors, seniors, and organizers."
      },
      {
        order: "06",
        time: "[TO BE DECIDED]",
        title: "IDEATHON — SINGLE PITCHING ROUND",
        location: "Multipurpose Hall & Seminar Halls",
        speaker: "Ideathon Jury Panel",
        description: "Single high-impact pitching round. Registered idea teams present original problem-solving frameworks followed by direct Q&A defense before the panel.",
        badge: "EVENT 02",
        highlight: true
      },
      {
        order: "07",
        time: "[TO BE DECIDED]",
        title: "EVALUATION",
        location: "Jury Chambers",
        description: "Deliberation and preliminary score aggregation by the Ideathon jury across originality, technical feasibility, scalability, and defense quality."
      },
      {
        order: "08",
        time: "[TO BE DECIDED]",
        title: "SNACKS BREAK",
        location: "Multipurpose Hall Foyer",
        description: "Evening refreshments, coffee, and informal team regrouping prior to Day 2 preparation."
      },
      {
        order: "09",
        time: "[TO BE DECIDED]",
        title: "RESULT PREPARATION",
        location: "SDC Organizing Desk",
        description: "Tabulation, integrity verification, and secure recording of Day 1 Codeathon rankings and Ideathon jury scores."
      }
    ]
  },
  day2: {
    dayNumber: "DAY 02",
    theme: "THE FLAGSHIP HACKATHON, DEMOS & THE FINAL VERDICT",
    date: "[TO BE DECIDED]",
    venue: "Multipurpose Hall & Engineering Labs, REC Banda",
    items: [
      {
        order: "01",
        time: "[TO BE DECIDED]",
        title: "MAIN HACKATHON COMMENCEMENT",
        location: "Multipurpose Hall",
        description: "The main hackathon hall opens. Teams assemble with hardware and workstations for the premier multi-hour build sprint.",
        badge: "EVENT 03",
        highlight: true
      },
      {
        order: "02",
        time: "[TO BE DECIDED]",
        title: "SELECT 1 OF 6 PROBLEM CATEGORIES",
        location: "Multipurpose Hall",
        description: "Official unsealing of the 6 problem categories. Teams lock in their chosen problem statement and register their Git repository."
      },
      {
        order: "03",
        time: "[TO BE DECIDED]",
        title: "DEVELOPMENT SPRINT",
        location: "Team Workstations",
        description: "Intense collaborative engineering. Front-end interfaces, back-end APIs, databases, machine learning pipelines, and hardware modules are built from scratch."
      },
      {
        order: "04",
        time: "[TO BE DECIDED]",
        title: "MENTORING ROUNDS",
        location: "Team Pods",
        description: "Designated mentors conduct desk-side code inspections, offer architectural critiques, and unblock critical development roadblocks.",
        highlight: true
      },
      {
        order: "05",
        time: "[TO BE DECIDED]",
        title: "FINAL SUBMISSION CUTOFF",
        location: "Portal / GitHub Repositories",
        description: "Hard stop for code commits. Teams submit final repository links, architectural documentation, and live demo URLs to the portal."
      },
      {
        order: "06",
        time: "[TO BE DECIDED]",
        title: "FINAL PRESENTATION",
        location: "Multipurpose Hall Main Stage",
        description: "Shortlisted teams present on the main stage, demonstrating working prototypes under real operating conditions."
      },
      {
        order: "07",
        time: "[TO BE DECIDED]",
        title: "JUDGING",
        location: "Jury Station",
        description: "Evaluation against strict criteria: problem understanding, technical implementation, novelty, functionality, impact, and demo viability."
      },
      {
        order: "08",
        time: "[TO BE DECIDED]",
        title: "RESULT VERIFICATION",
        location: "Scoring Command Center",
        description: "Independent audit of jury scorecards and normalization across all competition tracks."
      },
      {
        order: "09",
        time: "[TO BE DECIDED]",
        title: "GRAND RESULTS",
        location: "Multipurpose Hall",
        description: "Announcement of top honors across Hackathon, Codeathon, and Ideathon in the presence of the entire assembly.",
        highlight: true
      },
      {
        order: "10",
        time: "[TO BE DECIDED]",
        title: "AWARDS CEREMONY",
        location: "Main Stage",
        description: "Felicitation of winners with custom trophies, medals, certificates, and curated developer goodies.",
        highlight: true
      },
      {
        order: "11",
        time: "[TO BE DECIDED]",
        title: "CLOSING CEREMONY",
        location: "Main Stage",
        description: "Valedictory remarks by the patrons and faculty coordinators celebrating innovation and collaborative spirit."
      },
      {
        order: "12",
        time: "[TO BE DECIDED]",
        title: "VOTE OF THANKS",
        location: "Main Stage",
        description: "Formal expression of gratitude to institute administration, mentors, jury members, volunteers, and participants."
      },
      {
        order: "13",
        time: "[TO BE DECIDED]",
        title: "EVENT ENDS",
        location: "REC Banda",
        description: "Official conclusion of HackFest 3.0. Group photography and post-event debrief."
      }
    ]
  }
};

export const howItWorks = {
  hackathon: {
    title: "HACKATHON WORKFLOW",
    subtitle: "HOW THE 2-DAY BUILD PROCESS OPERATES",
    steps: [
      { step: "01", name: "SELECT", desc: "Choose one of six official crisis problem categories revealed on Day 2." },
      { step: "02", name: "PLAN", desc: "Understand constraints, research user needs, and architect the system stack." },
      { step: "03", name: "BUILD", desc: "Develop the software/hardware solution collaboratively within your team repository." },
      { step: "04", name: "MENTOR", desc: "Receive technical guidance and architectural reviews from designated mentors." },
      { step: "05", name: "IMPROVE", desc: "Refine edge cases, fix vulnerabilities, and polish the user experience." },
      { step: "06", name: "PRESENT", desc: "Demonstrate a live, functional end-to-end prototype on the main stage." },
      { step: "07", name: "JUDGING", desc: "Rigorous evaluation by expert panels across all 9 technical criteria." },
      { step: "08", name: "RESULT", desc: "Final scores verified and top contenders awarded in the Grand Ceremony." }
    ]
  },
  codeathon: {
    title: "CODEATHON WORKFLOW",
    subtitle: "HOW THE 90-MINUTE ALGORITHMIC BATTLE UNFOLDS",
    steps: [
      { step: "01", name: "LOGIN", desc: "Access the calibrated competitive programming platform with unique participant credentials." },
      { step: "02", name: "PROBLEM SET", desc: "Review multi-tiered algorithmic problems spanning data structures, logic, and complexity." },
      { step: "03", name: "1.5 HOURS", desc: "Intense 90-minute coding sprint under automated test suite validation." },
      { step: "04", name: "SUBMIT", desc: "Deliver solutions passing private test cases within strict memory and CPU limits." },
      { step: "05", name: "LEADERBOARD", desc: "Real-time rank updates reflecting accuracy, score weight, and submission velocity." },
      { step: "06", name: "RESULT", desc: "Final leaderboard audit determines the official Codeathon champions." }
    ]
  },
  ideathon: {
    title: "IDEATHON WORKFLOW",
    subtitle: "HOW THE INNOVATION PITCH OPERATES",
    steps: [
      { step: "01", name: "IDEA", desc: "Formulate an original, scalable technological proposal addressing a critical need." },
      { step: "02", name: "PITCH", desc: "Deliver a crisp, structured presentation on problem, architecture, and roadmap." },
      { step: "03", name: "Q&A", desc: "Defend technical feasibility and operational economics during intense jury cross-examination." },
      { step: "04", name: "EVALUATION", desc: "Jury scores the pitch against the 8 standardized evaluation dimensions." },
      { step: "05", name: "RESULT", desc: "Scores aggregated to reveal top transformative concepts at HackFest 3.0." }
    ]
  }
};

export const prizesData = {
  sectionTitle: "THE FINAL VERDICT",
  subtitle: "HONORING ARCHITECTS WHO REBUILD WHAT COMES NEXT",
  note: "Trophies, medals, certificates of excellence, and specialized developer gift hampers awarded across all three competitions.",
  arenas: [
    {
      arenaId: "hackathon",
      arenaName: "FLAGSHIP HACKATHON",
      tagline: "BUILD WHAT COMES NEXT",
      awards: [
        {
          tier: "1ST PLACE",
          prize: "HACKFEST CHAMPIONS TROPHY",
          details: "Grand Championship Trophy + Official Certificate of Excellence + Premium Goodies Hamper",
          featured: true
        },
        {
          tier: "2ND PLACE",
          prize: "MEDAL + CERTIFICATE + GOODIES",
          details: "Silver Medal + Official Certificate of Excellence + Curated Goodies Hamper"
        },
        {
          tier: "3RD PLACE",
          prize: "MEDAL + CERTIFICATE + GOODIES",
          details: "Bronze Medal + Official Certificate of Excellence + Curated Goodies Hamper"
        }
      ]
    },
    {
      arenaId: "codeathon",
      arenaName: "CODEATHON",
      tagline: "THINK FAST. CODE SMART.",
      awards: [
        {
          tier: "1ST PLACE",
          prize: "CODEATHON CHAMPION TROPHY",
          details: "Winner Trophy + Official Certificate of Excellence + Premium Goodies Hamper",
          featured: true
        },
        {
          tier: "2ND PLACE",
          prize: "MEDAL + CERTIFICATE + GOODIES",
          details: "Silver Medal + Official Certificate of Excellence + Curated Goodies Hamper"
        },
        {
          tier: "3RD PLACE",
          prize: "MEDAL + CERTIFICATE + GOODIES",
          details: "Bronze Medal + Official Certificate of Excellence + Curated Goodies Hamper"
        }
      ]
    },
    {
      arenaId: "ideathon",
      arenaName: "IDEATHON",
      tagline: "ONE IDEA. ONE PITCH.",
      awards: [
        {
          tier: "1ST PLACE",
          prize: "INNOVATION TROPHY",
          details: "Winner Trophy + Official Certificate of Excellence + Premium Goodies Hamper",
          featured: true
        },
        {
          tier: "2ND PLACE",
          prize: "MEDAL + CERTIFICATE + GOODIES",
          details: "Silver Medal + Official Certificate of Excellence + Curated Goodies Hamper"
        },
        {
          tier: "3RD PLACE",
          prize: "MEDAL + CERTIFICATE + GOODIES",
          details: "Bronze Medal + Official Certificate of Excellence + Curated Goodies Hamper"
        }
      ]
    }
  ]
};

export const mentorsAndJudges = {
  mentors: [
    {
      id: "m1",
      name: "[SENIOR TECH MENTOR 01]",
      designation: "Systems & Cloud Architect",
      expertise: "Distributed Systems & Cloud Computing",
      bio: "Guiding teams on scalable backend architecture, microservices, and database resilience."
    },
    {
      id: "m2",
      name: "[SENIOR TECH MENTOR 02]",
      designation: "Applied AI Engineer",
      expertise: "Machine Learning & Edge Compute",
      bio: "Assisting teams with neural model deployment, data preprocessing, and edge inferencing."
    },
    {
      id: "m3",
      name: "[SENIOR TECH MENTOR 03]",
      designation: "Full Stack Lead",
      expertise: "Frontend Architecture & API Design",
      bio: "Assisting teams in rapid UI prototyping, WebSockets, and seamless user interaction design."
    },
    {
      id: "m4",
      name: "[SENIOR TECH MENTOR 04]",
      designation: "Hardware & IoT Specialist",
      expertise: "Embedded Systems & Microcontrollers",
      bio: "Advising on hardware interfaces, sensor telemetry, and reliable low-power protocols."
    }
  ],
  judges: [
    {
      id: "j1",
      name: "Dr. Abhijeet Singh Sir",
      designation: "Coordinator, Student Developer Club",
      organization: "REC Banda",
      bio: "Leading software development and student technological initiatives at REC Banda."
    },
    {
      id: "j2",
      name: "Dr. Vibhash Yadav Sir",
      designation: "Head of Department",
      organization: "Department of Information Technology, REC Banda",
      bio: "Guiding academic and industrial technology excellence across computing disciplines."
    },
    {
      id: "j3",
      name: "[INDUSTRY GUEST JURY 01]",
      designation: "Engineering Director",
      organization: "Enterprise Tech Partner",
      bio: "Evaluating technical depth, practical feasibility, and enterprise readiness."
    },
    {
      id: "j4",
      name: "[INDUSTRY GUEST JURY 02]",
      designation: "Product & Strategy Specialist",
      organization: "Global Technology Ecosystem",
      bio: "Reviewing usability, scalability potential, and presentation impact."
    }
  ]
};

export const rulesData = [
  {
    category: "Participation",
    rules: [
      "Open to bona fide undergraduate and postgraduate students from any recognized institution.",
      "Valid college identity card or bonafide certificate is required during on-campus physical verification.",
      "Participants must adhere to the Student Developer Club Code of Conduct throughout the event."
    ]
  },
  {
    category: "Team Regulations",
    rules: [
      "Hackathon teams must consist of 2 to 4 members.",
      "Ideathon teams must consist of 1 to 3 members.",
      "Codeathon is strictly an individual competition.",
      "Team composition cannot be altered once registration has officially closed."
    ]
  },
  {
    category: "Originality & Integrity",
    rules: [
      "All hackathon code must be authored afresh during the designated competition hours.",
      "Utilizing pre-existing complete applications or presenting past projects is grounds for immediate disqualification.",
      "Open source third-party packages, libraries, and frameworks are allowed if documented in the repository.",
      "Generative AI tools may be used as development assistants for debugging or boilerplate generation, but fundamental system architecture and application logic must be understood and defensible by the team."
    ]
  },
  {
    category: "Submission Protocols",
    rules: [
      "Submissions must be delivered to the official portal prior to the hard deadline timer.",
      "Every Hackathon submission must include a public Git repository with a clear README, setup guide, and architectural breakdown.",
      "Late submissions will not be entertained under any circumstance."
    ]
  }
];

export const faqsData = [
  {
    q: "Who can participate in HackFest 3.0?",
    a: "HackFest 3.0 is open to all students currently enrolled in undergraduate or postgraduate programs across engineering, science, design, and management disciplines."
  },
  {
    q: "What is the team size for each event?",
    a: "Hackathon: 2 to 4 members per team. Ideathon: 1 to 3 members per team. Codeathon: strictly individual participation."
  },
  {
    q: "How many problem categories exist for the Hackathon?",
    a: "There are exactly six multi-disciplinary crisis problem categories. Teams select one category at the start of Day 2 to focus their solution."
  },
  {
    q: "What is the duration of the Hackathon?",
    a: "The main Hackathon takes place on Day 2, spanning intense development sprints, scheduled mentoring rounds, and live evening presentations."
  },
  {
    q: "What is the Codeathon duration and format?",
    a: "The Codeathon is a 1.5-hour (90 minutes) competitive coding contest hosted on a dedicated algorithmic platform with real-time ranking."
  },
  {
    q: "How does the Ideathon work?",
    a: "The Ideathon features a single high-impact pitching round where teams present an original tech solution followed by an intense Q&A defense with the jury."
  },
  {
    q: "How are projects evaluated?",
    a: "Projects are evaluated by a multidisciplinary jury panel against strict criteria: problem understanding, solution quality, innovation, technical depth, functionality, scalability, and live demo."
  },
  {
    q: "What should participants bring to the venue?",
    a: "Participants should bring their laptops, chargers, extension cords, any required hardware components/microcontrollers, student ID cards, and personal essentials."
  },
  {
    q: "Can participants join more than one competition?",
    a: "Yes! Since Codeathon and Ideathon take place on Day 1 and the Flagship Hackathon takes place on Day 2, eligible participants may participate across different tracks provided their schedules do not directly conflict."
  },
  {
    q: "How do I register for HackFest 3.0?",
    a: "Registrations can be completed through the registration portal by clicking the 'REGISTER NOW' buttons on this website. Early registration is recommended as seat caps apply."
  }
];

export const sponsorsData = {
  organizedBy: [
    { name: "Student Developer Club", tag: "SDC REC Banda", role: "Organizing Body" },
    { name: "Department of Information Technology", tag: "IT Dept REC Banda", role: "Academic Host" },
    { name: "Rajkiya Engineering College Banda", tag: "REC Banda", role: "Host Institution" }
  ],
  partners: [
    { name: "Tech Partner Network", type: "Technical Platform", logoText: "PLATFORM PARTNER" },
    { name: "Community Ecosystem", type: "Student Community", logoText: "OUTREACH PARTNER" },
    { name: "Developer Guild", type: "Industry Mentorship", logoText: "KNOWLEDGE PARTNER" }
  ],
  supportedBy: [
    { name: "TEQIP-III Initiative", type: "Academic Excellence" },
    { name: "REC Banda Innovation Cell", type: "Incubation & Research" }
  ]
};
