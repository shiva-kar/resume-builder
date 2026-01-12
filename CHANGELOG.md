# Changelog

All notable changes to Resume Builder will be documented in this file.

> **Note**: This project uses Alpha/Beta versioning. Earlier versions were Alpha builds for testing. The first public Beta release is **Beta 0.1**. No stable (1.0) release yet.

---

## [Beta 0.3] - 2026-01-10

### Added
- Multi-LLM support with 40+ AI models across 4 providers
- OpenAI models: GPT-5.2, GPT-5.2 Pro, GPT-5.1, GPT-5, GPT-5 Mini/Nano, GPT-4.1, GPT-4o, o3, o4-mini, o1
- Anthropic models: Claude Opus 4.5, Claude Sonnet 4.5, Claude Haiku 4.5, Claude 4, Claude 3.5/3
- Groq models: Groq Compound, GPT-OSS 120B/20B, Llama 4, Llama 3.3, Qwen3, Kimi K2
- Mistral models: Mistral Large 3, Medium 3.1, Small 3.2, Magistral, Codestral, Devstral 2

### Fixed
- Corrected all LLM model names with verified API model IDs from official documentation
- Model selector now shows grouped models by provider with accurate naming

---

## [Beta 0.2] - 2026-01-10

### Added
- Improved resume preview experience with enhanced template consistency
- Multiple professional templates with unified Preview/PDF rendering
- OpenAI-based PDF scanning (AI enhancement integration)
- YouTube integration features
- Auto-generate resume feature for HR teams (community contribution)

### Fixed
- Preview and PDF section title styling now consistent across all 10 templates
- Bold template accent bar rendering
- Neo template geometric square sizing
- Elegant template decorative elements (lines and dots)
- Modern template vertical bar dimensions
- Creative template accent block sizing
- Harvard template skills rendering (now matches PDF comma-separated format)
- Tech, Minimal, Corporate section title typography

### Known Issues
- PDF export does not fully match preview layout in some edge cases
- Font families and weights may differ slightly between Preview and PDF
- Markdown formatting (bold/italic) may not export correctly in all scenarios
- Bullet lists may lose formatting in certain templates
- Some templates have minor layout mismatches

### Notes
This release is open for community contributions to improve PDF export accuracy, typography consistency, and layout reliability.

---

## [Beta 0.1] - 2026-01-09

### Added
- Add MIT License to the project
- Add screenshots section to README
- feat: Add Electron desktop app support

### Changed
- Update README with badges and live demo links
- Update README with images and complete MIT License

---

## [Alpha 0.7] - 2024-12-19

### Added
- **SVG Icons in PDF Export**: Professional icon set with 7 custom SVG components
- **Dark Mode Theme Selector**: Redesigned template selector with unique visual identities
- **10 Unique Template Renderers**: Harvard, Tech, Minimal, Bold, Neo, Portfolio, Corporate, Creative, Elegant, Modern

### Changed
- Template tiles now feature dual-mode gradient backgrounds
- Icons use vibrant template-specific colors
- Selected state includes glow effects in dark mode
- Improved hover states and contrast

### Fixed
- PDF contact labels with proper text formatting
- Custom section dropdown positioning
- ESLint quote escaping issues

---

## [Alpha 0.6] - 2024-12-19

### Fixed
- PDF Contact Labels: Added text-based labels before contact info
- PDF Clickable Links: All contact links are now clickable with proper protocols
- Custom Section Dropdown: Fixed off-screen positioning

### Changed
- Contact section displays with bold labels for better readability

---

## [Alpha 0.5] - 2024-12-19

### Added
- Custom Section Field Types: text, textarea, date, dateRange, link, tags
- Field Templates: Basic, Project, Certification templates

---

## [Alpha 0.4] - 2024-12-18

### Added
- Drag & Drop section reordering with @dnd-kit
- Per-section font controls
- Multiple page size options (A4, Letter, Legal)

---

## [Alpha 0.3] - 2024-12-17

### Added
- Real-time PDF preview with @react-pdf/renderer
- Dark/Light mode theme support
- Persistent state with Zustand

---

## [Alpha 0.2] - 2024-12-16

### Added
- Complete UI redesign with bento grid layout
- Glassmorphism effects
- Multiple professional templates

---

## [Alpha 0.1] - 2024-12-15

### Added
- Initial release
- Basic resume builder functionality
- Personal info, experience, education sections
- PDF export capability

---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
