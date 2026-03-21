# 📄 Personal CV Website

A clean, responsive, single-page CV website for **Panagiotis (Panos) Dimitrakopoulos** — built with vanilla HTML, CSS, and JavaScript. No build step required. All CV content is stored in a single `cv.yaml` file, making updates effortless.

🔗 **Live site:** [panosdimitrakopoulos.github.io/cv](https://panosdimitrakopoulos.github.io/cv/)

---

## ✨ Features

- **YAML-driven content** — edit `cv.yaml` to update your CV; no touching HTML needed
- **Dark / Light mode** — toggle with a single click, preference saved across sessions
- **PDF download** — generates a print-friendly PDF directly from the browser
- **Share button** — uses the native Web Share API where supported
- **Fully responsive** — looks great on desktop and mobile
- **No build step** — runs with a simple local HTTP server; zero bundler required
- **Fast & lightweight** — self-hosted Inter font, minimal dependencies

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (for the helper scripts)
- Python 3 (for the local dev server) — or any static file server

### Run Locally

```bash
# Clone the repo
git clone https://github.com/PanosDimitrakopoulos/cv.git
cd cv

# Serve with Python (simplest)
npm run serve
# → Opens at http://localhost:8000

# Or with VS Code: right-click index.html → "Open with Live Server"
```

> ⚠️ Opening `index.html` directly as a `file://` URL **will not work** — browsers block local YAML fetches for security reasons. Always use a local server.

---

## ✏️ Updating Your CV

All content lives in **`cv.yaml`**. Just open it, edit the relevant section, and refresh your browser.

```yaml
personal:
  name: "Panagiotis Dimitrakopoulos"
  title: "Software Engineer in Test | ISTQB Certified"
  location: "Athens, Greece"

experience:
  - title: "Software QA & Test Automation Engineer"
    company: "..."
    dates: "Nov 2019 - Present"
    bullets:
      - "..."
```

Sections available in `cv.yaml`:

| Section | Description |
|---|---|
| `personal` | Name, title, tagline, photo, site URL |
| `seo` | Meta description and keywords |
| `contact` | Email, phone, GitHub, LinkedIn |
| `about` | Short bio paragraph |
| `experience` | Work history with clients and bullet points |
| `education` | Degrees and institutions |
| `certifications` | List of certifications |
| `skills` | Grouped skill categories |
| `languages` | Spoken languages |

---

## 🛠️ Helper Scripts

| Command | Description |
|---|---|
| `npm run serve` | Starts a local Python HTTP server at `http://localhost:8000` |
| `npm run crop-photo` | Crops your photo to a square format using `sharp` |
| `npm run test-header` | Tests the CV header rendering via Playwright |

### Install script dependencies

```bash
npm install
```

---

## 📁 Project Structure

```
cv/
├── index.html          # Main entry point
├── style.css           # All styles (light & dark mode)
├── script.js           # YAML parsing, rendering, theme & PDF logic
├── cv.yaml             # ← Your CV content lives here
├── favicon.svg         # Site favicon
├── 404.html            # Custom 404 page
├── crop-photo.js       # Photo cropping utility (Node.js)
├── test-header.js      # Header test script (Playwright)
├── assets/
│   ├── photo-square.png
│   └── photo-square.webp
└── fonts/
    ├── inter-regular.woff2
    ├── inter-medium.woff2
    ├── inter-semibold.woff2
    └── inter-bold.woff2
```

---

## 🌐 Deployment

This site is deployed via **GitHub Pages**. Any push to the `main` branch automatically updates the live site.

To deploy your own fork:
1. Fork this repository
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Your site will be live at `https://<your-username>.github.io/cv/`

---

## 🧰 Tech Stack

- **HTML / CSS / JavaScript** — no frameworks
- **[js-yaml](https://github.com/nodeca/js-yaml)** — parses `cv.yaml` in the browser
- **[sharp](https://sharp.pixelplumbing.com/)** — image processing for the profile photo
- **[Playwright](https://playwright.dev/)** — header rendering tests

---

## 📝 License

This project is personal and not under an open-source license. Feel free to use it as inspiration for your own CV site — just swap out the content.

---

*Built with ❤️ by [Panos Dimitrakopoulos](https://github.com/PanosDimitrakopoulos)*
