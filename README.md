# 🌌 3D Life OS & Digital Universe

An interactive, client-encrypted personal dashboard, memory vault, and portfolio built with **React 19**, **TypeScript**, **Three.js**, **Tailwind CSS**, and **Vite**.

![Project Preview](https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80)

---

## 🔑 Access Credentials

The application is protected by a client-side cryptographic passkey screen:

- **Default Passkey / Password**: `demopass`

---

## ✨ Features

- **🔐 Client-Side Security**: SHA-256 hashed authentication, session timeouts, and configurable auto-lock.
- **🌌 Interactive 3D Cosmic Background**: Real-time Three.js starfield, particle nebula, and orbiting nodes.
- **🗂️ Multi-Layout Dimensions**:
  - **Notebook View**: Clean markdown-inspired reader with favorite badges.
  - **Interactive Timeline**: Chronological milestones for career and education journeys.
  - **Dynamic Card Grid**: Media-rich cards with tag filtering, search, and image previews.
- **💾 Local-First Persistence**: Full CRUD backed by browser **IndexedDB**, ensuring total data privacy with zero server dependency.
- **📦 Data Portability**: Export your entire vault as JSON or restore backups at any time.
- **🎨 Glassmorphic Aesthetic**: Curated dark themes (Midnight, Cyberpunk Neon, Obsidian, Emerald) with ambient glow and smooth Framer Motion animations.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Vanilla CSS glassmorphism
- **3D Graphics**: Three.js
- **Animation**: Framer Motion, Canvas Confetti
- **Storage**: IndexedDB (`idb`)
- **Icons**: Lucide React
- **Build Tool**: Vite 8

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Deploying to GitHub Pages

This project is pre-configured with automated GitHub Actions deployment.

### Step 1: Initialize Git and Push to GitHub

If you haven't pushed this project to GitHub yet, run the following commands in your terminal:

```bash
# 1. Initialize git (if not already initialized)
git init -b main

# 2. Stage and commit all files
git add .
git commit -m "Initial commit: 3D Life OS Dashboard"

# 3. Link to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git

# 4. Push to main branch
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Open your repository on GitHub.
2. Go to **Settings** > **Pages** (in the left sidebar).
3. Under **Build and deployment** > **Source**, select **`GitHub Actions`**.
4. GitHub Actions will automatically run the deployment workflow (`.github/workflows/deploy.yml`).
5. Once the action finishes (typically 1–2 minutes), your live site will be accessible at:
   ```
   https://<YOUR_USERNAME>.github.io/<YOUR_REPOSITORY>/
   ```

---

## 📄 License

MIT License. Free to use, customize, and explore.
