# Resume Builder

[![Version](https://img.shields.io/badge/Version-Beta%200.3-blue?style=for-the-badge)](https://github.com/shiva-kar/resume-builder/releases)
[![Status](https://img.shields.io/badge/Status-Beta-orange?style=for-the-badge)](https://github.com/shiva-kar/resume-builder/releases)
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
| 🖥️ **Windows Installer** | [Resume-Builder-Beta-0.3-win.exe](https://github.com/shiva-kar/resume-builder/releases/latest) | Full installation with uninstaller |
| 🖥️ **Windows Portable** | [Resume-Builder-Beta-0.3-Portable.exe](https://github.com/shiva-kar/resume-builder/releases/latest) | No installation, run anywhere |
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

# Quick patch release (Beta 0.3 → Beta 0.4)
npm run release:quick

# Minor release (Beta 0.2 → Beta 0.3)
npm run release:minor

# Major release (Beta → Stable 1.0)
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

## � Release Status

This project is currently in **Beta**.

| Phase | Versions | Status |
|-------|----------|--------|
| **Alpha** | Alpha 0.1 - Alpha 0.7 | ✅ Completed |
| **Beta** | Beta 0.1 - Beta 0.3 | 🚧 Current |
| **Stable** | 1.0+ | ⏳ Planned |

Earlier versions were released as **Alpha** builds for testing and experimentation.

The first public Beta release is **Beta 0.1**.

No stable (1.0) release yet.

---

## 📜 Changelog

See [CHANGELOG.md](CHANGELOG.md) for full version history.

### Recent Releases

#### [Beta 0.3] - 2026-01-10
- Multi-LLM support with 40+ AI models across 4 providers
- OpenAI, Anthropic, Groq, and Mistral integration
- Corrected model names with verified API model IDs

#### [Beta 0.2] - 2026-01-10
- Improved template consistency between Preview and PDF
- Auto-generate resume feature for HR teams
- Fixed rendering across all 10 templates

#### [Beta 0.1] - 2026-01-09
- First Beta release
- Electron desktop app support
- MIT License added

#### [Alpha 0.7] - 2024-12-19
- SVG Icons in PDF Export
- 10 Unique Template Renderers
- Dark Mode Theme Selector

---

## 🖼️ Screenshots
<img width="1932" height="1221" alt="Screenshot 2026-01-10 014416" src="https://github.com/user-attachments/assets/01a5a361-7ff5-42e4-85b4-652de4283540" />
<img width="989" height="1067" alt="Screenshot 2026-01-10 014921" src="https://github.com/user-attachments/assets/02015fd5-bec5-4ddb-8f3d-ef9123b6e081" />
<img width="1490" height="733" alt="Screenshot 2026-01-10 014946" src="https://github.com/user-attachments/assets/048fae29-7e7f-4648-b035-a87545778353" />
<img width="1034" height="623" alt="Screenshot 2026-01-10 014938" src="https://github.com/user-attachments/assets/4df718f7-0601-4e03-900f-f37f8b6d2961" />
<img width="882" height="297" alt="Screenshot 2026-01-10 014930" src="https://github.com/user-attachments/assets/3e8e33e0-d023-4997-bf2c-c8303381b7bc" />
<img width="1744" height="985" alt="Screenshot 2026-01-10 015052" src="https://github.com/user-attachments/assets/9dde9437-39e8-46a3-9b62-29131cdd289e" />
<img width="896" height="436" alt="Screenshot 2026-01-10 015044" src="https://github.com/user-attachments/assets/1eca8a89-e3b8-400a-8c47-7b691259b07c" />
<img width="917" height="668" alt="Screenshot 2026-01-10 015026" src="https://github.com/user-attachments/assets/82e71cba-8f51-457e-a60c-9802d9454fb4" />
<img width="521" height="511" alt="Screenshot 2026-01-10 015021" src="https://github.com/user-attachments/assets/c864878d-074c-402b-8ba4-2352563af899" />
<img width="1118" height="1080" alt="Screenshot 2026-01-10 015004" src="https://github.com/user-attachments/assets/0b38cb8a-fb79-4e5b-be2d-2725ae2b38f2" />


---

## ⚠️ Known Issues (Beta)

| Issue | Description |
|-------|-------------|
| **PDF Export Formatting** | PDF export formatting does not fully match preview in some edge cases |
| **Font Styles** | Font styles and sizes may differ slightly between Preview and PDF |
| **Markdown Formatting** | Markdown and bullet formatting may be inconsistent in certain templates |
| **Theme Differences** | Some themes have minor layout differences between Preview and PDF |

We are actively working on improving these areas and welcome community contributions.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Priority Areas for Contribution

We especially welcome contributions for:

- 🔧 **Fixing PDF export formatting** - Help match PDF output to Preview
- 🎨 **Matching Preview and PDF layouts** - Ensure visual consistency
- 📝 **Improving font consistency** - Unified typography across exports
- ✍️ **Preserving markdown styling** - Bold, italic, and bullet support
- 🎯 **Stabilizing theme exports** - Template-specific fixes

### How to Contribute

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
