# 🌐 Personal Portfolio & Website

A sleek, modern, fully responsive personal portfolio website built with semantic **HTML5**, modern **CSS3** (custom properties & Grid/Flexbox), and vanilla **JavaScript**.

Zero build dependencies required — ready to be hosted directly on **GitHub Pages** for free with automated HTTPS!

---

## ✨ Features

- 🌓 **Dark / Light Mode**: One-click theme toggle with automatic system preference detection and `localStorage` persistence.
- 📱 **Fully Responsive**: Flawless layout on desktops, tablets, and mobile screens with a mobile hamburger navigation drawer.
- ⚡ **Zero-Build Architecture**: Pure web standards. No `npm install`, Node.js, or complex build setups required.
- 🎯 **Portfolio Sections**:
  - **Hero**: Eye-catching greeting, role badges, live status indicator, and CTA buttons.
  - **About Me**: Personal bio and core philosophy cards.
  - **Skills Grid**: Categorized technologies (Frontend, Backend, Tools & DevOps).
  - **Featured Projects**: Interactive cards with browser mockups, tags, and direct links to code and demos.
  - **Experience / Timeline**: Clean milestone journey.
  - **Contact Section**: Social reach-out links and an interactive contact form.
- 🔒 **GitHub Pages Ready**: Host for free under `https://<your-username>.github.io` or `https://<your-username>.github.io/<repo-name>`.

---

## 🚀 Quick Local Preview

You can preview the site immediately on your computer:

### Option 1: Direct File Opening
Double-click `index.html` or right-click `index.html` -> **Open with** -> Your favorite browser (Chrome, Edge, Firefox, Brave, etc.).

### Option 2: Local HTTP Server (Recommended)
If you have Python installed, open terminal in this folder and run:
```bash
python -m http.server 8000
```
Then visit: [http://localhost:8000](http://localhost:8000)

---

## 🛠️ How to Customize

1. **Your Details**: Open `index.html` and search for `Your Name` or `YourName` and replace with your real name.
2. **Social Links**: Update the GitHub, LinkedIn, and email address URLs in `index.html` under the `#home` and `#contact` sections.
3. **Projects**: Edit the titles, descriptions, and links inside `<div class="projects__grid">`.
4. **Skills**: Add or remove tags under `<div class="skills__grid">`.
5. **Contact Form**: The current form demonstrates client-side submission with instant feedback. To receive real emails from visitors, you can connect it for free to services like [Formspree](https://formspree.io/) or [Web3Forms](https://web3forms.com/) by updating the `<form action="...">` attribute.

---

## 🚢 How to Push to GitHub & Host on GitHub Pages

Follow these simple steps to deploy your site live to the web:

### Step 1: Create a Repository on GitHub
1. Log in to [GitHub](https://github.com).
2. Click the **+** (plus) icon at the top right and select **New repository**.
3. Repository name options:
   - **Option A (User site - recommended)**: Name it `<your-github-username>.github.io`. Your site URL will be `https://<your-github-username>.github.io`.
   - **Option B (Project site)**: Name it anything you like (e.g. `MyWebPage` or `portfolio`). Your site URL will be `https://<your-github-username>.github.io/<repo-name>`.
4. Keep it **Public** (GitHub Pages is free for public repositories).
5. Leave "Add a README file" **unchecked** (we already have one!).
6. Click **Create repository**.

### Step 2: Push Your Code from Your Computer
Open PowerShell or Terminal in this folder (`MyWebPage`) and run:

```bash
# 1. Initialize git if not already initialized
git init -b main

# 2. Add all files and make the initial commit
git add .
git commit -m "Initial commit: personal website for GitHub Pages"

# 3. Link your local project to your GitHub repository
# (Replace USERNAME and REPO-NAME with your real GitHub username and repo name)
git remote add origin https://github.com/USERNAME/REPO-NAME.git

# 4. Push to GitHub
git push -u origin main
```

---

### Step 3: Enable GitHub Pages

Once your code is on GitHub:
1. In your GitHub repository, click on **Settings** (tab near the top right).
2. In the left sidebar, click on **Pages** (under the "Code and automation" section).
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Select `main` and keep folder as `/(root)`.
4. Click **Save**.
5. Wait 1 to 2 minutes. Refresh the page, and GitHub will provide your live website link at the top (e.g., `https://<your-username>.github.io`).

🎉 **Your website is now live on the internet!**
