# Resume Builder - Professional Portfolio Creator

[![Version](https://img.shields.io/badge/Version-3.0.0-blue?style=for-the-badge)](https://github.com/shiva-kar/resume-builder/releases)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://shiva-kar.github.io/resume-builder/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

A sophisticated, SaaS-level resume and portfolio builder built with Next.js 14, featuring real-time PDF preview, drag-and-drop section reordering, and multiple professional templates.

🔗 **[Live Demo](https://shiva-kar.github.io/resume-builder/)** | 📥 **[Download](https://github.com/shiva-kar/resume-builder/releases/latest)** | 📖 **[Documentation](#usage)** | 💻 **[Source Code](https://github.com/shiva-kar/resume-builder)**

---

## 📥 Downloads

| Platform | Download |
|----------|----------|
| 🌐 **Web App** | [Launch Online](https://shiva-kar.github.io/resume-builder/) |
| 🖥️ **Windows** | [Download .exe](https://github.com/shiva-kar/resume-builder/releases/latest) |
| 📱 **Android** | [Download APK](https://github.com/shiva-kar/resume-builder/releases/latest) |
| 📦 **Source** | [GitHub Repository](https://github.com/shiva-kar/resume-builder) |

---

## Features

### Core Functionality
- **Real-time PDF Preview**: See changes instantly with @react-pdf/renderer
- **Drag & Drop Sections**: Reorder sections using @dnd-kit
- **Multiple Templates**: Harvard (Classic), Tech (Modern), Minimal (Clean)
- **Page Size Options**: A4 (default), Letter, Legal
- **Per-Section Font Controls**: Customize heading, subheading, and body text sizes
- **AI Enhancement**: Structure ready for OpenAI integration
- **Dark/Light Mode**: Full theme support
- **Persistent State**: Data saved to localStorage via Zustand

### Section Types
- Experience
- Education
- Skills (Tag-based input)
- Projects
- Certifications
- Custom Sections

### UI/UX
- Bento grid design with glassmorphism effects
- Responsive design (mobile/desktop)
- Optimistic UI updates
- Split-screen editor layout

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + clsx + tailwind-merge
- **UI Library**: Shadcn/UI patterns (Radix Primitives)
- **Icons**: Lucide React
- **State Management**: Zustand with persist middleware
- **Drag & Drop**: @dnd-kit/core and @dnd-kit/sortable
- **PDF Engine**: @react-pdf/renderer (Client-side)
- **Validation**: Zod schemas
- **AI Ready**: OpenAI SDK structure

## Getting Started

### Installation

```bash
# Navigate to the project directory
cd resume-builder

# Install dependencies
npm install

# Run development server
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
resume-builder/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
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
│   │       ├── PDFViewer.tsx
│   │       ├── ResumePDF.tsx
│   │       └── index.ts
│   └── lib/
│       ├── ai.ts
│       ├── schema.ts
│       ├── store.ts
│       └── utils.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Usage

### Adding Content
1. Fill in your personal information in the top section
2. Add sections using the buttons at the bottom
3. Drag sections to reorder them
4. Use the settings icon (gear) to customize font sizes per section
5. Toggle visibility with the eye icon

### Customization
- **Template**: Choose from Harvard, Tech, or Minimal
- **Page Size**: Select A4, Letter, or Legal
- **Global Font Size**: Small, Medium, or Large
- **Theme Color**: Click the color picker to change accent color
- **Per-Section Fonts**: Click the gear icon on any section

### AI Enhancement
Click the "AI Enhance" button next to any description to improve the text (mock implementation - connect to OpenAI for production use).

### Export
Click "Export PDF" to download your resume as a PDF file.

## Customization

### Adding New Templates
Edit `src/components/pdf/ResumePDF.tsx` and add new template styles in the `createStyles` function.

### Enabling AI Integration
1. Add your OpenAI API key to environment variables
2. Uncomment the production implementation in `src/lib/ai.ts`
3. Create an API route for secure server-side calls

## Environment Variables

```env
# For production AI integration
NEXT_PUBLIC_OPENAI_API_KEY=your-api-key
```
### Screenshots
<img width="1754" height="1117" alt="Screenshot 2025-12-19 145310" src="https://github.com/user-attachments/assets/c7725e36-2abc-4679-bf64-9e190f2c7f20" />
<img width="1249" height="661" alt="Screenshot 2025-12-19 145318" src="https://github.com/user-attachments/assets/f6e08b36-35fe-44a2-8ddf-ed1f59a8465b" />
<img width="1844" height="1096" alt="Screenshot 2025-12-19 145356" src="https://github.com/user-attachments/assets/dfa81931-fa07-472f-b88c-61771ba27655" />
<img width="1910" height="1271" alt="Screenshot 2025-12-19 145407" src="https://github.com/user-attachments/assets/891a8e93-2f60-4d62-a84b-86bde0e7bfdc" />
<img width="1129" height="703" alt="Screenshot 2025-12-19 145412" src="https://github.com/user-attachments/assets/87223103-e208-417d-b599-48048b9f1c1f" />
<img width="1456" height="847" alt="Screenshot 2025-12-19 145428" src="https://github.com/user-attachments/assets/dc722149-615e-49bb-b45f-761db882760b" />
<img width="2173" height="1359" alt="Screenshot 2025-12-19 145450" src="https://github.com/user-attachments/assets/7951504d-83fa-44f7-99ad-94efa93e8d54" />

## License

MIT License

Copyright (c) 2025 Shiva Kar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
