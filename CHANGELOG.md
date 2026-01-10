# Changelog

## [3.1.0] - 2026-01-10

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

## [3.0.0] - 2026-01-09

### Added
- Add MIT License to the project
- Add screenshots section to README
- feat: Add Electron desktop app support

### Changed
- Update README with badges and live demo links
- Update README with images and complete MIT License

---


All notable changes to Resume Builder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.5.0] - 2024-12-19

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

## [2.4.0] - 2024-12-19

### Fixed
- PDF Contact Labels: Added text-based labels before contact info
- PDF Clickable Links: All contact links are now clickable with proper protocols
- Custom Section Dropdown: Fixed off-screen positioning

### Changed
- Contact section displays with bold labels for better readability

---

## [2.3.0] - 2024-12-19

### Added
- Custom Section Field Types: text, textarea, date, dateRange, link, tags
- Field Templates: Basic, Project, Certification templates

---

## [2.2.0] - 2024-12-18

### Added
- Drag & Drop section reordering with @dnd-kit
- Per-section font controls
- Multiple page size options (A4, Letter, Legal)

---

## [2.1.0] - 2024-12-17

### Added
- Real-time PDF preview with @react-pdf/renderer
- Dark/Light mode theme support
- Persistent state with Zustand

---

## [2.0.0] - 2024-12-16

### Added
- Complete UI redesign with bento grid layout
- Glassmorphism effects
- Multiple professional templates

---

## [1.0.0] - 2024-12-15

### Added
- Initial release
- Basic resume builder functionality
- Personal info, experience, education sections
- PDF export capability
