# 🌐 Krishnasankar - Personal Portfolio Website

A sleek, responsive developer portfolio website designed for **Krishnasankar** ([@krishnasankar](https://github.com/krishnasankar)), featuring real projects including **[MonthlyExpenseTracker](https://github.com/krishnasankar/MonthlyExpenseTracker)**, mobile applications, and web tools.

Zero build dependencies required — ready to be hosted immediately on **GitHub Pages** with free HTTPS!

---

## ✨ Features

- 🌓 **Dark / Light Mode**: One-click theme toggle with persistent storage and OS preference detection.
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile with an interactive navigation drawer.
- ⚡ **Zero-Build Architecture**: Pure semantic HTML5, modern CSS3 variables, and vanilla JavaScript.
- 🚀 **Projects Showcased**:
  - **MonthlyExpenseTracker**: Android Java application with Room database persistence, category budgeting, and analytics dashboard.
  - **Developer Portfolio**: This responsive website hosted on GitHub Pages.
  - **2048 Game**: Interactive tile-sliding puzzle game implementation.
- 📬 **Direct Contact Info**: Reachable at `krishnasankar15@gmail.com` and `github.com/krishnasankar`.

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
