# Resume Builder

[![Version](https://img.shields.io/badge/Version-3.0.0-blue?style=for-the-badge)](https://github.com/shiva-kar/resume-builder/releases)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-green?style=for-the-badge&logo=github)](https://shiva-kar.github.io/resume-builder/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Electron](https://img.shields.io/badge/Electron-39-47848F?style=for-the-badge&logo=electron)](https://www.electronjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

A sophisticated, SaaS-level resume and portfolio builder featuring real-time DOM preview, 10 professional templates, drag-and-drop sections, and cross-platform desktop support.

---

## 🔗 Quick Links

| | |
|---|---|
| 🌐 **Live Demo** | [shiva-kar.github.io/resume-builder](https://shiva-kar.github.io/resume-builder/) |
| 📥 **Downloads** | [Latest Release](https://github.com/shiva-kar/resume-builder/releases/latest) |
| 💻 **Source Code** | [GitHub Repository](https://github.com/shiva-kar/resume-builder) |
| 📖 **Documentation** | [See Below](#usage) |

---

## 📥 Downloads

| Platform | Download | Description |
|----------|----------|-------------|
| 🌐 **Web App** | [Launch Online](https://shiva-kar.github.io/resume-builder/) | No installation required |
| 🖥️ **Windows Installer** | [Resume-Builder-3.0.0-win.exe](https://github.com/shiva-kar/resume-builder/releases/latest) | Full installation with uninstaller |
| 🖥️ **Windows Portable** | [Resume-Builder-3.0.0-Portable.exe](https://github.com/shiva-kar/resume-builder/releases/latest) | No installation, run anywhere |
| 📦 **Source Code** | [Clone Repository](https://github.com/shiva-kar/resume-builder) | Build from source |

---

## ✨ Features

### 🎨 10 Professional Templates

| Template | Style | Best For |
|----------|-------|----------|
| **Harvard** | Classic academic | Academia, research, traditional industries |
| **Tech** | Modern with accent bar | Software, engineering, tech startups |
| **Minimal** | Clean typography | Design, writing, consulting |
| **Bold** | Strong contrast | Leadership, executive roles |
| **Neo** | Grid-based modern | Creative tech, product design |
| **Portfolio** | Sidebar layout | Designers, artists, creatives |
| **Corporate** | Professional cards | Finance, consulting, enterprise |
| **Creative** | Asymmetric design | Marketing, advertising, media |
| **Elegant** | Refined serif | Legal, executive, luxury brands |
| **Modern** | Two-column sidebar | General professional use |

### 📝 Core Functionality

- **Real-time DOM Preview** - See changes instantly without PDF regeneration
- **Drag & Drop Sections** - Reorder sections using @dnd-kit
- **Page Size Options** - A4 (default), Letter, Legal
- **Per-Section Font Controls** - Customize heading, subheading, and body text sizes
- **SVG Icons in PDF** - Professional icons for contact info
- **Dark/Light Mode** - Full theme support with unique template visuals
- **Persistent State** - Data saved to localStorage via Zustand
- **AI Enhancement Ready** - Structure ready for OpenAI integration

### 📋 Section Types

- ✅ Personal Information (with contact icons)
- ✅ Experience (with date ranges)
- ✅ Education
- ✅ Skills (tag-based input)
- ✅ Projects
- ✅ Certifications
- ✅ Custom Sections (with field templates)

### 🖥️ Desktop App (Electron)

- Native Windows application
- Offline functionality
- Fast startup
- Portable version available

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router, Static Export) |
| **Language** | TypeScript 5 (Strict mode) |
| **Styling** | Tailwind CSS 3 + clsx + tailwind-merge |
| **UI Components** | Radix Primitives (Shadcn/UI patterns) |
| **Icons** | Lucide React |
| **State Management** | Zustand with persist middleware |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable |
| **PDF Engine** | @react-pdf/renderer |
| **Desktop** | Electron 39 + electron-builder |
| **Validation** | Zod schemas |
| **Deployment** | GitHub Pages (gh-pages) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/shiva-kar/resume-builder.git
cd resume-builder

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build Commands

```bash
# Web build (static export)
npm run build

# Deploy to GitHub Pages
npm run deploy

# Windows desktop app
npm run electron:build

# Portable Windows app
npm run electron:build:portable
```

### Release Commands

```bash
# Full release (prompts for confirmation)
npm run release

# Quick patch release (3.0.0 → 3.0.1)
npm run release:quick

# Minor release (3.0.0 → 3.1.0)
npm run release:minor

# Major release (3.0.0 → 4.0.0)
npm run release:major
```

---

## 📁 Project Structure

```
resume-builder/
├── .github/
│   └── workflows/
│       └── release.yml          # CI/CD automation
├── electron/
│   └── main.js                  # Electron main process
├── public/
│   └── icon.png                 # App icon
├── scripts/
│   └── release.js               # Release automation script
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles + dark mode
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Main application
│   ├── components/
│   │   ├── editor/
│   │   │   ├── CustomSectionForm.tsx
│   │   │   ├── EducationForm.tsx
│   │   │   ├── ExperienceForm.tsx
│   │   │   ├── FormInput.tsx
│   │   │   ├── PersonalInfoForm.tsx
│   │   │   ├── SectionWrapper.tsx
│   │   │   ├── SkillsForm.tsx
│   │   │   └── index.ts
│   │   └── pdf/
│   │       ├── LivePreview.tsx   # DOM-based preview
│   │       ├── PDFViewer.tsx     # PDF generation
│   │       ├── PreviewCanvas.tsx # Template renderers
│   │       ├── ResumePDF.tsx     # PDF document structure
│   │       └── index.ts
│   └── lib/
│       ├── ai.ts                # AI enhancement (OpenAI ready)
│       ├── schema.ts            # Zod schemas + types
│       ├── store.ts             # Zustand state management
│       └── utils.ts             # Utility functions
├── CHANGELOG.md                 # Version history
├── LICENSE                      # MIT License
├── package.json
├── release.bat                  # Windows release helper
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📖 Usage

### Creating Your Resume

1. **Personal Info** - Fill in your name, title, contact details
2. **Add Sections** - Click section buttons (Experience, Education, Skills, etc.)
3. **Drag to Reorder** - Drag section headers to rearrange
4. **Customize Fonts** - Click ⚙️ gear icon on any section
5. **Toggle Visibility** - Click 👁️ eye icon to hide/show sections
6. **Export PDF** - Click "Export PDF" button to download

### Customization Options

| Option | Description |
|--------|-------------|
| **Template** | Choose from 10 unique professional designs |
| **Page Size** | A4 (default), Letter, Legal |
| **Accent Color** | Pick from preset colors or custom hex |
| **Font Sizes** | Global + per-section controls |
| **Dark Mode** | Toggle with sun/moon icon |

### Custom Sections

Create custom sections with various field types:

- `text` - Single line text input
- `textarea` - Multi-line with bullet helper
- `date` - Single date (month/year)
- `dateRange` - Start and end date
- `link` - URL input with icon
- `tags` - Tag bubbles (press Enter to add)

**Quick Templates:**
- Basic (Title + Description)
- Project (Name, URL, Duration, Technologies, Description)
- Certification (Name, Issuer, Date, Credential URL)

---

## 📜 Changelog

### [3.0.0] - 2026-01-10

#### 🎉 Major Release

- **10 Unique Template Renderers** - Harvard, Tech, Minimal, Bold, Neo, Portfolio, Corporate, Creative, Elegant, Modern
- **Dark Mode Theme Selector** - Redesigned with unique visual identities per template
- **Release Automation** - Fully automated CI/CD pipeline with GitHub Actions
- **Source Code Link** - Added to app footer
- **Windows Desktop App** - Electron-based with installer and portable versions

### [2.5.0] - 2024-12-19

- **SVG Icons in PDF Export** - Professional icon set with 7 custom SVG components
- **Dark Mode Theme Selector** - Template-specific colors and glow effects
- **PDF Contact Improvements** - Clickable links with proper protocols

### [2.4.0] - 2024-12-19

- **PDF Contact Labels** - Text labels before contact info
- **Custom Section Dropdown** - Fixed off-screen positioning

### [2.3.0] - 2024-12-19

- **Custom Section Field Types** - text, textarea, date, dateRange, link, tags
- **Field Templates** - Basic, Project, Certification presets

### [2.2.0] - 2024-12-18

- **Drag & Drop** - Section reordering with @dnd-kit
- **Per-Section Font Controls** - Individual typography settings
- **Page Sizes** - A4, Letter, Legal options

### [2.1.0] - 2024-12-17

- **Real-time Preview** - @react-pdf/renderer integration
- **Dark/Light Mode** - Theme support
- **Persistent State** - Zustand with localStorage

### [2.0.0] - 2024-12-16

- **UI Redesign** - Bento grid layout with glassmorphism
- **Multiple Templates** - Professional template options

### [1.0.0] - 2024-12-15

- **Initial Release** - Basic resume builder with PDF export

---

## 🖼️ Screenshots

<img width="1754" alt="Main Editor" src="https://github.com/user-attachments/assets/c7725e36-2abc-4679-bf64-9e190f2c7f20" />

<img width="1249" alt="Template Selection" src="https://github.com/user-attachments/assets/f6e08b36-35fe-44a2-8ddf-ed1f59a8465b" />

<img width="1844" alt="Dark Mode" src="https://github.com/user-attachments/assets/dfa81931-fa07-472f-b88c-61771ba27655" />

<img width="1910" alt="PDF Export" src="https://github.com/user-attachments/assets/891a8e93-2f60-4d62-a84b-86bde0e7bfdc" />

<img width="1129" alt="Mobile View" src="https://github.com/user-attachments/assets/87223103-e208-417d-b599-48048b9f1c1f" />

<img width="1456" alt="Custom Sections" src="https://github.com/user-attachments/assets/dc722149-615e-49bb-b45f-761db882760b" />

<img width="2173" alt="Full Preview" src="https://github.com/user-attachments/assets/7951504d-83fa-44f7-99ad-94efa93e8d54" />

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025-2026 **Shiva Kar**

---

## 👤 Author

**Shiva Kar**

- GitHub: [@shiva-kar](https://github.com/shiva-kar)
- Repository: [resume-builder](https://github.com/shiva-kar/resume-builder)

---

<p align="center">
  <strong>⭐ Star this repo if you find it useful!</strong>
</p>

<p align="center">
  Made with ❤️ by <a href="https://github.com/shiva-kar">Shiva Kar</a>
</p>
