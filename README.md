# BotDash - Auto Crypto Bot UI

A robust, production-ready React dashboard for monitoring and controlling the Auto Crypto Bot.

## 🚀 Features

- **Real-time Monitoring**: Live updates of portfolio value, asset allocation, and bot status via Supabase Realtime.
- **Granular Control**: Start, Stop, and Restart the bot service directly from the UI.
- **Strategy Management**: Configure grid levels, price limits, and risk parameters visually.
- **System Health**: Monitor CPU, logic logs, and API latency.
- **Responsive Design**: Built with a mobile-first, glass-morphism aesthetic.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite
- **State Management**: React Hooks + Supabase Realtime
- **UI Components**: Custom Glass-morphism components (no external UI lib bloat)
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📂 Project Structure

\`\`\`
src/
├── components/         # Shared UI components
│   ├── common/         # Global providers (ErrorBoundary, Toast)
│   └── ui/             # Generic atoms (Button, Card, Badge)
├── features/           # Feature-specific components
│   ├── dashboard/      # Home page widgets
│   └── settings/       # Settings forms & visualization
├── hooks/              # Custom logic hooks (Data fetching)
├── lib/                # Supabase client setup
├── pages/              # Route views (Home, Settings, etc.)
└── _legacy/            # Old static files (reference)
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Local Development

1.  **Clone & Install**
    \`\`\`bash
    cd UI
    npm install
    \`\`\`

2.  **Environment Setup**
    Create a \`.env\` file in the \`UI/\` directory:
    \`\`\`env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    \`\`\`

3.  **Run Locally**
    \`\`\`bash
    npm run dev
    \`\`\`
    Access at \`http://localhost:5173\` (or \`http://0.0.0.0:5173\`).

### 📦 Deployment (GitHub Pages)

This project is configured to deploy automatically to GitHub Pages via GitHub Actions.

1.  Go to your GitHub Repository **Settings** > **Secrets and variables** > **Actions**.
2.  Add the following Repository Secrets:
    - \`VITE_SUPABASE_URL\`
    - \`VITE_SUPABASE_ANON_KEY\`
3.  Push to \`main\` or \`master\`.
4.  The workflow in \`.github/workflows/deploy.yml\` will build and deploy the site.

## 🔒 Security

- **Client-Side Only**: This is a static SPA. **Never** put service keys or admin secrets in the code or `.env`.
- **Row Level Security (RLS)**: Ensure your Supabase tables (`bot_control`, `strategy_stats`) have RLS policies that allow `SELECT` for authenticated users (or public if intended).
- **Control Logic**: The UI only updates the `bot_control` table. The Python bot service listens to this table. The UI does not execute commands directly.

## 🤝 Contributing

1.  Run `npm run lint` before committing.
2.  Follow the Atomic Design pattern in `src/features/`.
