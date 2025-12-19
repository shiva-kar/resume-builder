# Resume Builder - Changelog

All notable changes to this project will be documented in this file.

---

## [2.5.0] - 2024-12-19

### Added
- **SVG Icons in PDF Export**: Replaced text labels (Email:, Phone:, etc.) with actual SVG icons in exported PDF using @react-pdf/renderer's Svg and Path components
- **Professional Icon Set**: Added 7 custom SVG icon components for PDF:
  - EmailIcon (envelope)
  - PhoneIcon (phone)
  - LocationIcon (map pin)
  - LinkedInIcon (LinkedIn logo)
  - GitHubIcon (GitHub logo)
  - GlobeIcon (globe for websites)
  - LinkIcon (chain link for additional links)

### Changed
- PDF contact section now displays icons inline with clickable links for a cleaner, more professional appearance
- Icon size scales dynamically with font size settings for visual consistency

---
## [2.4.0] - 2024-12-19

### Fixed
- **PDF Contact Labels**: Added text-based labels (Email:, Phone:, LinkedIn:, GitHub:, Web:, Location:, Link:) before contact info in exported PDF since @react-pdf/renderer doesn't support SVG icons
- **PDF Clickable Links**: All contact links (email, phone, LinkedIn, GitHub, website) are now clickable in the exported PDF with proper protocols (mailto:, tel:, https://)
- **Custom Section Dropdown Positioning**: Fixed "Use Template" dropdown going off-screen by implementing smart positioning that opens upward when near the bottom of the viewport

### Changed
- Contact section in PDF now displays with bold labels before each item for better readability
- Additional links in PDF now also show "Link:" prefix for consistency

---
## [2.3.0] - 2024-12-19

### Added
- **Custom Section Field Types**: Custom sections now support multiple field types:
  - `text` - Single line text input
  - `textarea` - Multi-line text with bullet helper
  - `date` - Single date picker (month/year)
  - `dateRange` - Start and end date range
  - `link` - URL input with link icon
  - `tags` - Tag/bubble input (type and press Enter to add)
- **Field Templates**: Quick-setup templates for common section types:
  - Basic (Title + Description)
  - Project (Name, URL, Duration, Technologies, Description)
  - Certification (Name, Issuer, Date, Credential URL)
  - Publication (Title, Publisher, Date, Link, Abstract)
  - Award (Name, Issuer, Date, Description)
  - Volunteer (Role, Organization, Duration, Description)
- **More Page Sizes**: Added additional resume-standard page sizes:
  - A4 (210 x 297 mm) - International standard
  - US Letter (8.5 x 11 in) - US standard
  - US Legal (8.5 x 14 in) - Longer format
  - Executive (7.25 x 10.5 in) - Compact professional
  - B5 (176 x 250 mm) - European alternative
  - A5 (148 x 210 mm) - Compact format

### Fixed
- **Drag-to-Pan Text Selection**: Fixed issue where text would get selected while dragging to pan in the preview area (added `select-none` class)
- **Icon Selector Visual Bug**: Fixed the icon selector in Additional Links showing text behind the icon overlay (made select text transparent)

### Changed
- Page size selector changed from toggle buttons to dropdown for better UX with 6 options
- Custom section form completely redesigned with configurable fields panel
- LivePreview and ResumePDF updated to render custom field types properly

---

## [2.2.0] - 2024-12-18

### Added
- **Zoom & Pan Controls**: Added zoom in/out buttons, percentage display, and reset button to preview
- **Drag-to-Pan**: Click and drag to pan around the preview when zoomed
- **Ctrl+Scroll Zoom**: Hold Ctrl/Cmd and scroll to zoom in/out
- **Section Manager Panel**: Smart add/remove sections based on active state
- **Link Support for Projects/Certifications**: Added optional link field with external link icon

### Fixed
- **Template Literal Date Format**: Fixed `${startFormatted} - ${endFormatted}` not rendering properly
- **Education Field Order**: Degree now displays before Institution (was reversed)
- **Font Size Consistency**: Unified font sizes across all section items

### Removed
- **AI Enhance Button**: Removed AI enhance functionality from Experience and Education forms

---

## [2.1.0] - 2024-12-17

### Added
- **Dark Mode Toggle**: System-wide dark mode support with toggle button
- **Typography Controls**: Granular control over Name, Headers, and Body text sizes (sm/md/lg/xl)
- **Skill Levels**: Skills can now have proficiency levels (Beginner, Intermediate, Advanced, Expert)
- **Accent Color Presets**: Quick-select accent colors (Black, Blue, Red, Green, Purple, Orange, Cyan, Pink) plus custom color picker
- **Collapsible Sections**: All form sections can be collapsed/expanded for better organization
- **Dedicated Social Fields**: LinkedIn, GitHub, and Website fields in Personal Info
- **Summary/Job Title Field**: Added job title/headline field below name

### Changed
- Personal Info form reorganized with dedicated social media fields
- Design & Layout panel expanded with more customization options

---

## [2.0.0] - 2024-12-16

### Added
- **Link Icon Auto-Detection**: Automatically detects platform from URL and shows appropriate icon
- **Custom Links Section**: Add unlimited custom links with icon selection
- **Icon Library**: Support for LinkedIn, GitHub, Twitter/X, Facebook, Instagram, YouTube, Dribbble, Behance, Medium, Stack Overflow, Portfolio, Website icons

### Fixed
- PDF preview rendering errors
- PDF download functionality
- Various TypeScript type errors

### Changed
- Migrated to storage key `resume-builder-storage-v2` for clean state
- Updated link schema to include icon field

---

## [1.0.0] - 2024-12-15

### Initial Release
- **Three Templates**: Harvard (classic serif), Tech (modern sans-serif), Minimal (clean centered)
- **Drag & Drop Sections**: Reorder resume sections via drag and drop
- **Section Types**: Experience, Education, Skills, Projects, Certifications, Custom
- **Live Preview**: Real-time preview updates as you type
- **PDF Export**: Download resume as PDF with proper formatting
- **Responsive Design**: Works on desktop and tablet devices
- **Local Storage**: Auto-saves progress to browser storage
- **Theme Customization**: Accent color and global font size controls
- **Page Size Options**: A4 and US Letter support

### Tech Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Shadcn/UI components
- Zustand for state management
- @dnd-kit for drag and drop
- @react-pdf/renderer for PDF generation

---

## Roadmap

### Planned Features
- [ ] Multiple resume profiles
- [ ] Import from LinkedIn
- [ ] ATS compatibility checker
- [ ] Resume templates marketplace
- [ ] Cloud sync with authentication
- [ ] Resume sharing with public links
- [ ] Multi-page resume support
- [ ] Auto page size adjustment based on content

---

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for personal or commercial purposes.

