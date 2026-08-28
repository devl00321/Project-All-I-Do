# ALLIDO Project Brain

## 🧠 Purpose
This document serves as the central memory, progress tracker, and source of truth for the ALLIDO project. 
**ALL AGENTS AND DEVELOPERS MUST RECORD EVERYTHING HERE:** All progressions, roadblocks, errors, and key decisions must be documented to ensure continuous context and prevent memory loss across sessions.

## 📝 Instructions for AI Agents
1. **Read First:** Review this document at the start of any new session or complex task to understand the current state of the project.
2. **Update Constantly:** Update the **Current Status & Progress** section whenever a major feature is completed or a bug is resolved.
3. **Log Errors:** Record any significant **Roadblocks & Errors** along with how they were solved for future reference.
4. **Track Decisions:** Keep track of the open items and placeholders. When the user makes a decision, update the corresponding section.

---

## 🏢 Project Context
**Project Name:** ALLIDO (All I Do — One App for Every Service)
**Launch City:** Suri, Birbhum, West Bengal, India
**Platform:** Android · iOS · Web

### ⚙️ Core Architecture & Business Model
Hyperlocal on-demand service marketplace operating on a strict **3-tier model**:
1. **Customers:** Discover, book, and pay for services via the Customer App.
2. **Dealers:** The operational nerve center. They receive all bookings for their zone and *manually assign* vetted workers.
3. **Workers:** Skilled professionals. **CRITICAL RULE:** Workers *cannot* self-assign, view unassigned bookings, or bypass the dealer. They rely entirely on the dealer for job dispatch.

### 💻 Technology Stack
- **Frontend:** React Native (Mobile), React.js (Web/PWA)
- **Backend:** Node.js, Express, Socket.IO (for realtime live tracking)
- **Database/Cache:** PostgreSQL, Redis
- **Infra (Phase 1):** Locally hosted server in Suri to minimize cloud costs, with an eventual migration path to AWS.

---

## 🚀 Current Status & Progress
- [x] Initial project scaffolding (`web-app` React frontend, `backend` Express API).
- [x] Extracted product requirements from `ALLIDO_Product_Documentation_v1.docx`.
- [x] Created `brain.md` as the central project memory.
- [ ] *[Add next tasks here...]*

---

## 🚧 Roadblocks, Errors & Solutions
*Log any major bugs, architectural roadblocks, or configuration errors here.*
- **2026-08-20**: TypeScript `rootDir` error for `drizzle.config.ts`. *Solution:* Changed `rootDir` from `./src` to `./` in `tsconfig.json`.
- **2026-08-20**: Tailwind v4 `@theme` warning in VS Code. *Solution:* Added `.vscode/settings.json` to ignore unknown CSS at-rules.

---

## ❓ Open Items & Placeholders (Require User Input)
*The following items from the V1 Product Document need to be defined:*
- [ ] Business and revenue targets for 6-month mark and Year 1.
- [ ] Final list of service categories at launch (Section 5.3).
- [ ] Pricing model: base visit charges per service category (Section 10.2).
- [ ] Urgency tier definitions for dealer booking cards.
- [ ] Assignment SLA: max minutes before unassigned booking triggers an alert.
- [ ] Physical hosting location of the local server in Suri.
- [ ] Commission percentage per booking (e.g., 15–20%).
- [ ] Marketing strategies for Phase 1 (Foundation) and Phase 2 (Public Launch).
- [ ] Target booking volume by the end of Month 6.
