#!/usr/bin/env node

/**
 * Resume Builder - Automated Release Script
 * Author: Shiva Kar
 * Repository: https://github.com/shiva-kar/resume-builder
 *
 * This script automates the entire release process:
 * 1. Version bumping (auto-increment PATCH by default)
 * 2. Changelog generation from git commits
 * 3. README.md version sync
 * 4. Build process (Web, Windows, Android)
 * 5. Git commit and push
 * 6. GitHub release creation with artifacts
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const readline = require('readline');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');
const README_FILE = path.join(ROOT_DIR, 'README.md');
const CHANGELOG_FILE = path.join(ROOT_DIR, 'CHANGELOG.md');
const UPDATES_FILE = path.join(ROOT_DIR, 'UPDATES.md');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.cyan}[${step}]${colors.reset} ${colors.bright}${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function exec(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
    return result;
  } catch (error) {
    if (!options.ignoreError) {
      logError(`Command failed: ${command}`);
      throw error;
    }
    return null;
  }
}

function execOutput(command) {
  try {
    return execSync(command, {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: 'pipe',
    }).trim();
  } catch {
    return '';
  }
}

// Read package.json
function readPackageJson() {
  return JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
}

// Write package.json
function writePackageJson(data) {
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(data, null, 2) + '\n');
}

// Parse semantic version
function parseVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
}

// Increment version
function incrementVersion(version, type = 'patch') {
  const { major, minor, patch } = parseVersion(version);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

// Get git commits since last tag
function getCommitsSinceLastTag() {
  try {
    const lastTag = execOutput('git describe --tags --abbrev=0 2>nul') || '';
    let commits;

    if (lastTag) {
      commits = execOutput(`git log ${lastTag}..HEAD --pretty=format:"- %s" --no-merges`);
    } else {
      // If no tags, get last 10 commits
      commits = execOutput('git log -10 --pretty=format:"- %s" --no-merges');
    }

    return commits.split('\n').filter(c => c.trim());
  } catch {
    return ['- Various improvements and bug fixes'];
  }
}

// Categorize commits
function categorizeCommits(commits) {
  const categories = {
    features: [],
    fixes: [],
    improvements: [],
    other: [],
  };

  commits.forEach(commit => {
    const lower = commit.toLowerCase();
    if (lower.includes('feat') || lower.includes('add') || lower.includes('new')) {
      categories.features.push(commit);
    } else if (lower.includes('fix') || lower.includes('bug') || lower.includes('patch')) {
      categories.fixes.push(commit);
    } else if (lower.includes('improve') || lower.includes('update') || lower.includes('refactor') || lower.includes('optimize')) {
      categories.improvements.push(commit);
    } else {
      categories.other.push(commit);
    }
  });

  return categories;
}

// Generate changelog entry
function generateChangelogEntry(version, commits) {
  const date = new Date().toISOString().split('T')[0];
  const categories = categorizeCommits(commits);

  let entry = `## [${version}] - ${date}\n\n`;

  if (categories.features.length) {
    entry += `### Added\n${categories.features.join('\n')}\n\n`;
  }

  if (categories.improvements.length) {
    entry += `### Changed\n${categories.improvements.join('\n')}\n\n`;
  }

  if (categories.fixes.length) {
    entry += `### Fixed\n${categories.fixes.join('\n')}\n\n`;
  }

  if (categories.other.length) {
    entry += `### Other\n${categories.other.join('\n')}\n\n`;
  }

  // Default entry if no categorized commits
  if (!entry.includes('###')) {
    entry += `### Changed\n- Template renderer improvements\n- UI/UX refinements\n- Performance optimizations\n- Bug fixes\n- Build updates\n\n`;
  }

  entry += '---\n\n';

  return entry;
}

// Update CHANGELOG.md (or UPDATES.md)
function updateChangelog(version, commits) {
  const changelogEntry = generateChangelogEntry(version, commits);

  // Update UPDATES.md (existing changelog file)
  if (fs.existsSync(UPDATES_FILE)) {
    let content = fs.readFileSync(UPDATES_FILE, 'utf8');

    // Find where to insert (after the header)
    const headerEnd = content.indexOf('---');
    if (headerEnd !== -1) {
      const beforeHeader = content.substring(0, headerEnd + 3);
      const afterHeader = content.substring(headerEnd + 3);
      content = beforeHeader + '\n\n' + changelogEntry + afterHeader.trim();
    } else {
      // Just prepend after first line
      const firstNewline = content.indexOf('\n');
      content = content.substring(0, firstNewline + 1) + '\n' + changelogEntry + content.substring(firstNewline + 1);
    }

    fs.writeFileSync(UPDATES_FILE, content);
    logSuccess(`Updated UPDATES.md with v${version} changes`);
  }

  // Also create/update CHANGELOG.md
  let changelogContent = '';
  if (fs.existsSync(CHANGELOG_FILE)) {
    changelogContent = fs.readFileSync(CHANGELOG_FILE, 'utf8');
    // Insert after header
    const headerMatch = changelogContent.match(/^#[^\n]+\n+/);
    if (headerMatch) {
      changelogContent = headerMatch[0] + changelogEntry + changelogContent.substring(headerMatch[0].length);
    } else {
      changelogContent = changelogEntry + changelogContent;
    }
  } else {
    changelogContent = `# Changelog\n\nAll notable changes to Resume Builder will be documented in this file.\n\n${changelogEntry}`;
  }

  fs.writeFileSync(CHANGELOG_FILE, changelogContent);
  logSuccess(`Updated CHANGELOG.md with v${version} changes`);
}

// Update README.md with version info
function updateReadme(version) {
  if (!fs.existsSync(README_FILE)) return;

  let content = fs.readFileSync(README_FILE, 'utf8');

  // Update version badge if exists
  content = content.replace(
    /!\[Version\]\([^)]+\)/g,
    `![Version](https://img.shields.io/badge/Version-${version}-blue?style=for-the-badge)`
  );

  // Add version badge if not exists (after first badge line)
  if (!content.includes('![Version]')) {
    content = content.replace(
      /(!\[Live Demo\][^\n]+\n)/,
      `$1[![Version](https://img.shields.io/badge/Version-${version}-blue?style=for-the-badge)](https://github.com/shiva-kar/resume-builder/releases)\n`
    );
  }

  // Update any hardcoded version references
  content = content.replace(
    /Current Version:\s*[\d.]+/g,
    `Current Version: ${version}`
  );

  fs.writeFileSync(README_FILE, content);
  logSuccess(`Updated README.md with version ${version}`);
}

// Build web version
function buildWeb() {
  logStep('BUILD', 'Building web version...');
  exec('npm run build');
  logSuccess('Web build completed');
}

// Build Windows app
function buildWindows() {
  logStep('BUILD', 'Building Windows application...');

  // Ensure out directory exists (required for electron)
  if (!fs.existsSync(path.join(ROOT_DIR, 'out'))) {
    log('Building Next.js static export first...', 'yellow');
    exec('npm run build');
  }

  // Build with electron-builder
  exec('npx electron-builder --win --publish never');
  logSuccess('Windows build completed');

  // List output files
  if (fs.existsSync(DIST_DIR)) {
    const files = fs.readdirSync(DIST_DIR);
    log('Build artifacts:', 'blue');
    files.forEach(f => log(`  - ${f}`));
  }
}

// Check if gh CLI is available
function checkGitHubCLI() {
  try {
    execOutput('gh --version');
    return true;
  } catch {
    return false;
  }
}

// Create GitHub release
function createGitHubRelease(version, notes) {
  logStep('RELEASE', 'Creating GitHub release...');

  if (!checkGitHubCLI()) {
    logError('GitHub CLI (gh) not found. Please install it: https://cli.github.com/');
    log('You can manually create a release at: https://github.com/shiva-kar/resume-builder/releases/new', 'yellow');
    return false;
  }

  // Check auth
  try {
    execOutput('gh auth status');
  } catch {
    logError('Not authenticated with GitHub CLI. Run: gh auth login');
    return false;
  }

  // Find build artifacts
  const artifacts = [];
  if (fs.existsSync(DIST_DIR)) {
    const files = fs.readdirSync(DIST_DIR);
    files.forEach(f => {
      const filePath = path.join(DIST_DIR, f);
      const stat = fs.statSync(filePath);
      if (stat.isFile() && (f.endsWith('.exe') || f.endsWith('.zip') || f.endsWith('.apk') || f.endsWith('.AppImage'))) {
        artifacts.push(filePath);
      }
    });

    // Also check for win-unpacked
    const winUnpacked = path.join(DIST_DIR, 'win-unpacked');
    if (fs.existsSync(winUnpacked)) {
      // Create a zip of win-unpacked
      const zipName = `Resume-Builder-${version}-Windows.zip`;
      const zipPath = path.join(DIST_DIR, zipName);
      try {
        exec(`powershell Compress-Archive -Path "${winUnpacked}\\*" -DestinationPath "${zipPath}" -Force`, { silent: true });
        artifacts.push(zipPath);
        logSuccess(`Created ${zipName}`);
      } catch {
        log('Could not create zip archive', 'yellow');
      }
    }
  }

  // Write release notes to temp file
  const notesFile = path.join(ROOT_DIR, '.release-notes.md');
  fs.writeFileSync(notesFile, notes);

  // Create release command
  let releaseCmd = `gh release create v${version} --title "v${version}" --notes-file "${notesFile}"`;

  if (artifacts.length) {
    releaseCmd += ' ' + artifacts.map(a => `"${a}"`).join(' ');
  }

  try {
    exec(releaseCmd);
    logSuccess(`Created GitHub release v${version}`);

    // Cleanup
    fs.unlinkSync(notesFile);
    return true;
  } catch (error) {
    logError('Failed to create GitHub release');
    fs.unlinkSync(notesFile);
    return false;
  }
}

// Git operations
function gitCommitAndPush(version) {
  logStep('GIT', 'Committing and pushing changes...');

  // Add all changes
  exec('git add -A');

  // Commit
  try {
    exec(`git commit -m "Release v${version}"`);
    logSuccess('Changes committed');
  } catch {
    log('No changes to commit or commit failed', 'yellow');
  }

  // Push
  try {
    exec('git push');
    logSuccess('Pushed to remote');
  } catch (error) {
    logError('Failed to push. You may need to set upstream or resolve conflicts.');
    return false;
  }

  return true;
}

// Prompt for user input
function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// Main release function
async function release(options = {}) {
  console.log('\n' + '='.repeat(60));
  log('  RESUME BUILDER - AUTOMATED RELEASE', 'bright');
  log('  Repository: https://github.com/shiva-kar/resume-builder', 'cyan');
  console.log('='.repeat(60) + '\n');

  // Read current version
  const pkg = readPackageJson();
  const currentVersion = pkg.version;
  log(`Current version: ${currentVersion}`, 'blue');

  // Determine version bump type
  let bumpType = options.type || 'patch';

  // For major bumps, require confirmation
  if (bumpType === 'major') {
    const confirm = await prompt(`⚠️  Are you sure you want to bump MAJOR version? (y/n): `);
    if (confirm !== 'y' && confirm !== 'yes') {
      log('Aborted.', 'yellow');
      process.exit(0);
    }
  }

  // Calculate new version
  const newVersion = incrementVersion(currentVersion, bumpType);
  log(`New version: ${newVersion}`, 'green');

  // Get commits for changelog
  const commits = getCommitsSinceLastTag();
  log(`\nChanges since last release:`, 'blue');
  commits.slice(0, 5).forEach(c => console.log(`  ${c}`));
  if (commits.length > 5) {
    log(`  ... and ${commits.length - 5} more`, 'cyan');
  }

  // Confirm release
  if (!options.yes) {
    const confirm = await prompt(`\nProceed with release v${newVersion}? (y/n): `);
    if (confirm !== 'y' && confirm !== 'yes') {
      log('Aborted.', 'yellow');
      process.exit(0);
    }
  }

  console.log('\n' + '-'.repeat(60) + '\n');

  // Step 1: Update version in package.json
  logStep('VERSION', `Updating version to ${newVersion}...`);
  pkg.version = newVersion;
  writePackageJson(pkg);
  logSuccess(`Updated package.json to version ${newVersion}`);

  // Step 2: Update changelog
  logStep('CHANGELOG', 'Updating changelog...');
  updateChangelog(newVersion, commits);

  // Step 3: Update README
  logStep('README', 'Updating README...');
  updateReadme(newVersion);

  // Step 4: Build
  if (!options.skipBuild) {
    buildWeb();

    if (!options.skipWindows) {
      buildWindows();
    }
  }

  // Step 5: Git commit and push
  if (!options.skipGit) {
    const gitSuccess = gitCommitAndPush(newVersion);
    if (!gitSuccess && !options.force) {
      logError('Git operations failed. Use --force to continue anyway.');
      process.exit(1);
    }
  }

  // Step 6: Create GitHub release
  if (!options.skipRelease) {
    const releaseNotes = generateChangelogEntry(newVersion, commits);
    createGitHubRelease(newVersion, releaseNotes);
  }

  // Done!
  console.log('\n' + '='.repeat(60));
  log('  ✅ RELEASE COMPLETE!', 'green');
  log(`  Version: ${newVersion}`, 'bright');
  log(`  Repository: https://github.com/shiva-kar/resume-builder`, 'cyan');
  log(`  Release: https://github.com/shiva-kar/resume-builder/releases/tag/v${newVersion}`, 'cyan');
  console.log('='.repeat(60) + '\n');
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: 'patch',
    yes: false,
    skipBuild: false,
    skipWindows: false,
    skipGit: false,
    skipRelease: false,
    force: false,
  };

  args.forEach(arg => {
    if (arg === '--major') options.type = 'major';
    if (arg === '--minor') options.type = 'minor';
    if (arg === '--patch') options.type = 'patch';
    if (arg === '-y' || arg === '--yes') options.yes = true;
    if (arg === '--skip-build') options.skipBuild = true;
    if (arg === '--skip-windows') options.skipWindows = true;
    if (arg === '--skip-git') options.skipGit = true;
    if (arg === '--skip-release') options.skipRelease = true;
    if (arg === '--force') options.force = true;
    if (arg === '--help' || arg === '-h') {
      console.log(`
Resume Builder Release Script

Usage: node scripts/release.js [options]

Options:
  --major         Bump major version (x.0.0)
  --minor         Bump minor version (0.x.0)
  --patch         Bump patch version (0.0.x) [default]
  -y, --yes       Skip confirmation prompts
  --skip-build    Skip build step
  --skip-windows  Skip Windows build
  --skip-git      Skip git commit/push
  --skip-release  Skip GitHub release creation
  --force         Continue even if some steps fail
  -h, --help      Show this help message

Examples:
  node scripts/release.js                    # Patch release with prompts
  node scripts/release.js --minor -y         # Minor release, no prompts
  node scripts/release.js --skip-windows     # Skip Windows build
      `);
      process.exit(0);
    }
  });

  return options;
}

// Run
const options = parseArgs();
release(options).catch(err => {
  logError(err.message);
  process.exit(1);
});
