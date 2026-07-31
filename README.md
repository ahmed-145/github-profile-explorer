# GitExplorer — AI-Powered GitHub Profile & Repository Explorer

A full-stack web application built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS** that enables users to search GitHub profiles, compare developer metrics with visual charts, generate AI profile summaries, chat with an AI model grounded in repository data, and save persistent notes.

🚀 **Live Demo**: [https://github-profile-explorer-dun.vercel.app/](https://github-profile-explorer-dun.vercel.app/)

---

## 🌟 Key Features

### 1. 🔍 GitHub Profile & Repository Search
- Search any public GitHub username to instantly load user metadata (avatar, bio, followers, location, company, account age).
- View a breakdown of public repositories with sorting by **Stars**, **Forks**, **Update Date**, and **Name**.
- Filter repositories by programming language or toggle forks visibility.
- Visual language breakdown bar based on repository distribution.

### 2. 🤖 AI Profile Analysis (Streaming)
- Generates an AI summary for any GitHub developer using **Groq Llama-3**.
- Provides a detailed breakdown:
  - **Developer Archetype** (e.g. Open Source Champion, Polyglot Engineer)
  - **Key Technical Strengths**
  - **Contribution & Impact Assessment**
  - **Growth Trajectory & Ideal Role Fit**
- Features real-time **Server-Sent Events (SSE) streaming** for a smooth typing response.

### 3. 💬 Grounded AI Repository Chat
- Select any repository to enter an interactive AI chat interface.
- **Retrieval-Augmented Prompting (RAG)**: Answers are strictly grounded in actual repository context (README contents, root file tree, and recent commit history).
- Responses stream live with full conversation history persisted per repository.

### 4. ⚔️ Developer Comparison Tool
- Compare any two GitHub developers side-by-side.
- Interactive visual charts powered by **Recharts**:
  - **Bar Chart**: Head-to-head metrics comparison (Stars, Followers, Repos, Active Repos).
  - **Radar Chart**: Developer skill profile across 6 key dimensions.
- Comparative metric table highlighting category winners.

### 5. 📝 Persistent Smart Notes
- Attach custom notes to specific user profiles or repositories.
- Notes automatically persist in **LocalStorage** and are displayed across individual profile/repo pages and summarized on the main dashboard.
- Full CRUD support (Create, Read, Update, Delete) with inline editing.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS (Custom Dark Space Theme) |
| **AI Provider** | Groq SDK (`llama-3.1-8b-instant`) |
| **Data Visualization** | Recharts (Bar & Radar Charts) |
| **Icons** | Lucide React |
| **State & Storage** | React State & Client LocalStorage |

---

## 📁 Project Architecture

```text
github-profile-explorer/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Home page (Hero search + features + notes)
│   │   ├── user/[username]/page.tsx      # User profile route (SSR)
│   │   ├── compare/                      # Developer comparison route with Recharts
│   │   │   ├── page.tsx                  # Suspense boundary wrapper
│   │   │   └── ComparePage.tsx           # Compare UI & charts
│   │   ├── repo/[owner]/[repo]/page.tsx  # Repo detail & AI Chat interface
│   │   └── api/
│   │       ├── github/                   # Server-side GitHub API proxy handlers
│   │       ├── ai/analyze/route.ts       # Streaming AI profile analysis
│   │       └── ai/chat/route.ts          # Grounded streaming AI repo chat
│   ├── components/
│   │   ├── Navbar.tsx                    # Top navigation bar
│   │   ├── SearchBar.tsx                 # Search input with recent searches
│   │   ├── UserCard.tsx                  # Profile summary card & language bar
│   │   ├── RepoCard.tsx                  # Repository card component
│   │   ├── RepoFilters.tsx               # Sort, search, and language filter controls
│   │   ├── AISummary.tsx                 # Streaming AI analysis component
│   │   ├── RepoChat.tsx                  # Streaming AI repo chat component
│   │   └── NotesPanel.tsx                # Notes CRUD component
│   └── lib/
│       ├── github.ts                     # GitHub REST API client & helpers
│       └── notes.ts                      # LocalStorage persistence manager
├── package.json
└── tailwind.config.js
```

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js 18.x or 20.x installed
- npm or yarn

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ahmed-145/github-profile-explorer.git
   cd github-profile-explorer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   GROQ_API_KEY=your_groq_api_key
   ```
   > - **GitHub Token**: Optional but recommended to avoid the 60 req/hr rate limit ([Get a GitHub Token](https://github.com/settings/tokens)).
   > - **Groq API Key**: Required for AI features ([Get a free Groq Key](https://console.groq.com)).

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🔒 Security & Privacy

- All GitHub API requests are routed through Next.js server-side Route Handlers to ensure personal access tokens remain secret and are never exposed to the client browser.
- Secrets are managed using environment variables (`.env.local`) which are strictly excluded from version control via `.gitignore`.
