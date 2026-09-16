# 🌐 Krishnasankar - Senior Software Engineer, Drummer & Portfolio

A modern, responsive portfolio website for **Krishnasankar** ([@krishnasankar](https://github.com/krishnasankar)), Senior Software Engineer at **Oracle (OFSS)** with 10+ years of experience based in Bengaluru, India, and an avid drummer uploading drum covers at **[@KrishnaDrums](https://www.youtube.com/@KrishnaDrums)**.

Showcases enterprise engineering in **Core Java**, **Spring Boot**, **Oracle SQL**, and **UI**, alongside creative passion projects built for fun including **[MonthlyExpenseTracker](https://github.com/krishnasankar/MonthlyExpenseTracker)** (Android/Room), **[NotePilot](https://github.com/krishnasankar/NotePilot)** (Android/AI Assistant), and embedded **YouTube Drum Covers**!

Zero build dependencies required — ready to be hosted immediately on **GitHub Pages** with free HTTPS!

---

## ✨ Features

- 🌓 **Dark / Light Mode**: One-click theme toggle with persistent storage and OS preference detection.
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile with an interactive navigation drawer.
- ⚡ **Zero-Build Architecture**: Pure semantic HTML5, modern CSS3 variables, and vanilla JavaScript.
- 💼 **Enterprise Background**: 10+ years of software engineering at Oracle Financial Services Software (OFSS).
- 🥁 **Interactive Drum Pad & Beat Machine**: Playable Web Audio API synthesized drum kit (Kick, Snare, Hi-Hat, Tom, Crash) in the hero section with keyboard triggers (`1`-`5` / `K`, `S`, `H`, `T`, `C`), visual pad hit animations, and an autoplay groove demo.
- 🥁 **Drumming & Music Showcase**: Responsive embedded YouTube playlist of drum covers from [@KrishnaDrums](https://www.youtube.com/@KrishnaDrums).
- 🎲 **Hobbies & Lifestyle**: Board games, simulator gaming, poi spinning (flow arts), and scenic long drives.
- 🚀 **Passion Projects Showcased**:
  - **MonthlyExpenseTracker** (Flagship): Offline-first Android Java application with Jetpack Room persistence, category budgeting v2.0, interactive Canvas donut analytics, and home screen widget.
  - **NotePilot** (Flagship): Private AI notes assistant Android app integrating OpenRouter LLM completions, note context injection, autonomous function calling (`addOrUpdateNote`), safety confirmation diffs, voice recognition, and encrypted BYOK storage.
  - **Developer Portfolio** (`krishnasankar.github.io`): Fast, responsive personal portfolio website hosted on GitHub Pages.
  - **ghost** (Minor / Arcade): 2D retro arcade game and reusable extension built with Microsoft MakeCode Arcade and TypeScript.
- 📬 **Direct Contact & Socials**:
  - Email: `krishnasankar15@gmail.com`
  - GitHub: [github.com/krishnasankar](https://github.com/krishnasankar)
  - YouTube: [@KrishnaDrums](https://www.youtube.com/@KrishnaDrums)
  - Instagram: [@krishna.sankar](https://www.instagram.com/krishna.sankar)
  - Location: Bengaluru, India

---

## 💻 Local Preview

Double-click `index.html` to view it in your browser, or start a local server:
```powershell
# Using Python (if installed)
python -m http.server 8000

# Or simply open index.html in your browser
Start-Process "index.html"
```

---

## 🚢 Deploy to GitHub Pages (Step-by-Step)

### Step 1: Create the Repository on GitHub
1. Go to **[github.com/new](https://github.com/new)**.
2. Under **Repository name**:
   - **Recommended**: Name it `krishnasankar.github.io`. Your site will be published at `https://krishnasankar.github.io`.
   - *Or*: Name it `MyWebPage` (your site will be at `https://krishnasankar.github.io/MyWebPage/`).
3. Set visibility to **Public**.
4. Leave "Add a README file" **unchecked** (we already have one).
5. Click **Create repository**.

---

### Step 2: Push Your Local Code
In your PowerShell terminal inside this folder (`MyWebPage`), run the following commands:

#### If you chose `krishnasankar.github.io`:
```powershell
git remote add origin https://github.com/krishnasankar/krishnasankar.github.io.git
git branch -M main
git push -u origin main
```

#### If you chose `MyWebPage`:
```powershell
git remote add origin https://github.com/krishnasankar/MyWebPage.git
git branch -M main
git push -u origin main
```

---

### Step 3: Activate GitHub Pages
1. Go to your repository on GitHub.
2. Click **Settings** (tab at the top).
3. Click **Pages** (in the left navigation under "Code and automation").
4. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Select `main` and keep folder as `/(root)`.
5. Click **Save**.
6. Within 1 to 2 minutes, GitHub will show:
   > 🚀 **Your site is live at https://krishnasankar.github.io**
