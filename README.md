# Resume Builder - Professional Portfolio Creator

A sophisticated, SaaS-level resume and portfolio builder built with Next.js 14, featuring real-time PDF preview, drag-and-drop section reordering, and multiple professional templates.

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

## License

MIT License
