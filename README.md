# HackFest 3.0 — Official Website
this is my features workflow
> **Student Developer Club, Rajkiya Engineering College Banda**  
> *"The world is changing. Build what comes next."*

A professional technology-event website for **HackFest 3.0**, engineered with a cinematic apocalyptic-technological aesthetic inspired by systemic disruption and rebuilding.

---

## 🏛️ Event Architecture

The homepage strictly follows the standardized festival information architecture:

1. **01. Hero / Home** — High-impact focal atmosphere, identity, and primary CTAs
2. **02. About Event** — Student Developer Club, REC Banda mission, 100–150 words copy & documentary imagery
3. **03. Event Highlights** — 3 Competitions, 6 Categories, 2 Days, 1 Tech Community, plus core pillars
4. **04. Competitions (The Three Arenas)** — Codeathon, Ideathon, and the dominant Flagship Hackathon
5. **05. Problem Statements** — Exactly 6 Hackathon crisis categories with interactive modal inspection
6. **06. Schedule** — Exact Day 1 & Day 2 chronological sequence with Multipurpose Hall proceedings
7. **07. How The Event Works** — Dedicated visual workflows for Hackathon, Codeathon, and Ideathon
8. **08. Mentors & Judges** — Dark editorial profile roster & official 9-dimension and 8-dimension judging criteria
9. **09. Prizes ("The Final Verdict")** — Trophies, Medals, Certificates, and Goodies across all 3 arenas (no speculative prize money)
10. **10. Rules & FAQ** — Visually distinct rules governance + 10 interactive question accordions
11. **11. Sponsors** — Organized By, Ecosystem Partners, Supported By, and Sponsorship Prospectus CTA
12. **12. Register ("Enter The Battle")** — High-visibility registration portal CTA with full event metadata
13. **Footer** — Quick links, REC Banda info, and social channels

---

## 🗂️ Dedicated Routes & Deep Dives

In addition to the unified narrative homepage experience, dedicated pages provide complete details:

- `/` — Main festival experience
- `/codeathon` — Dedicated Codeathon specification (overview, format, timeline, rules, leaderboard criteria, FAQs)
- `/ideathon` — Dedicated Ideathon specification (overview, format, pitch requirements, judging criteria, FAQs)
- `/hackathon` — Dedicated Flagship Hackathon specification (overview, categories, timeline, rules, 9 judging criteria, FAQs)
- `/missions` — Problem statements inspector
- `/schedule` — Chronological schedule & event day breakdowns
- `/mentors` & `/judges` — Faculty coordinators & jury profiles
- `/prizes` — Championship honors & award breakdowns
- `/rules` & `/faq` — Regulatory framework & FAQs
- `/sponsors` — Partner network & sponsor inquiries
- `/register` — Interactive registration portal

---

## 🎨 Typography & Custom Font Drop-In

As specified, a **custom display font** for main headings can be dropped in easily:

1. Place your font file in:
   ```
   public/fonts/hackfest-custom-heading.woff2
   ```
2. Open [`src/index.css`](file:///c:/Users/itsak/OneDrive/Desktop/SDC/Hackfest%203.0%20Website/Hackfest3.0/src/index.css) and uncomment the `@font-face` block:
   ```css
   @font-face {
     font-family: 'HackfestCustomFont';
     src: url('/fonts/hackfest-custom-heading.woff2') format('woff2');
     font-weight: 700 900;
     font-display: swap;
   }
   ```
3. The custom font is scoped strictly to display headlines, arena titles, and hero statements (`.heading-display` & `.heading-section`). Body text remains clean, highly readable neutral sans-serif (`Plus Jakarta Sans`), and metadata uses monospace (`JetBrains Mono`).

---

## ⚙️ Configuration Architecture

All event details, timings, problem categories, and judging rubrics are centralized in:
[`src/data/eventData.js`](file:///c:/Users/itsak/OneDrive/Desktop/SDC/Hackfest%203.0%20Website/Hackfest3.0/src/data/eventData.js)

To update event dates, venue details, or finalize `[TO BE DECIDED]` times, simply edit this file without modifying component logic.

---

## 🚀 Running Locally

```bash
# Start development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```
