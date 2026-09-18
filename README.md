# 🌌 3D Life OS & Digital Universe

An interactive, client-encrypted personal dashboard, memory vault, and portfolio built with **React 19**, **TypeScript**, **Three.js**, **Tailwind CSS**, and **Vite**.

![Project Preview](https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80)

[![Download Android APK](https://img.shields.io/badge/Download-Android%20APK%20(.apk)-emerald?style=for-the-badge&logo=android&logoColor=white)](https://github.com/Saif-AlSaad/Perosonal_Dashboard/releases/latest/download/LifeOS.apk)
[![Web App](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-indigo?style=for-the-badge&logo=github&logoColor=white)](https://saif-alsaad.github.io/Perosonal_Dashboard/)

---

## 📱 Android Direct Download & PWA

- **Auto-Detection**: When opening this web app on an Android device, an emerald **"📥 Download Android App (.apk)"** button appears directly in the header for 1-tap APK downloading.
- **Direct Download Link**: [Download LifeOS.apk](https://github.com/Saif-AlSaad/Perosonal_Dashboard/releases/latest/download/LifeOS.apk)
- **Publishing APK to GitHub Releases**:
  1. Generate your APK using [PWABuilder](https://www.pwabuilder.com/) (enter your GitHub Pages URL: `https://saif-alsaad.github.io/Perosonal_Dashboard/` and download the signed Android package) or Bubblewrap CLI.
  2. In your GitHub repo, go to **Releases** > **Draft a new release**.
  3. Tag it as `v1.0.0` and attach `LifeOS.apk` to the release assets.
  4. Publish the release. Any visitor clicking **"📥 Download Android App (.apk)"** will instantly receive the latest file!

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

<<<<<<< HEAD
## Password
Password : [demopass]


## Author 
*Saif Al Saad* <br>
*Software Engineering* <br>
*Daffodil International University* 
=======
### Author
*Saif Al Saad* <br>
*Software Engineering* <br>
*Daffodil International University*

>>>>>>> 6b268c2d7b1926d62c4c465338c8d7091e9032d5
