import { ResumeData, Section, SectionItem, CustomFieldValue } from './schema';

export interface AtsFeedback {
  type: 'success' | 'warning' | 'error';
  message: string;
}

export interface AtsScore {
  score: number;
  feedback: AtsFeedback[];
}

// A comprehensive dictionary of strong action verbs
const STRONG_VERBS = new Set([
  'achieved', 'administered', 'analyzed', 'architected', 'built', 'calculated',
  'collaborated', 'communicated', 'completed', 'conceived', 'conducted', 'coordinated',
  'created', 'delegated', 'designed', 'developed', 'directed', 'discovered',
  'engineered', 'established', 'evaluated', 'executed', 'facilitated', 'formulated',
  'generated', 'guided', 'implemented', 'improved', 'increased', 'initiated',
  'innovated', 'instituted', 'introduced', 'investigated', 'led', 'managed',
  'mentored', 'negotiated', 'operated', 'orchestrated', 'organized', 'oversaw',
  'performed', 'pioneered', 'planned', 'presented', 'produced', 'programmed',
  'promoted', 'proposed', 'reduced', 'resolved', 'restructured', 'revamped',
  'saved', 'spearheaded', 'streamlined', 'strengthened', 'supervised', 'transformed',
  'upgraded', 'won', 'wrote', 'authored', 'built', 'deployed', 'shipped'
]);

// Words that recruiters and ATS systems often flag as unprofessional exaggerations
const BUZZWORDS = new Set([
  'ninja', 'guru', 'rockstar', 'wizard', 'superstar', 'jedi', 
  'magician', 'unicorn', 'mastermind'
]);

const extractText = (htmlOrMarkdown: string) => {
  if (!htmlOrMarkdown) return '';
  // Basic strip tags/markdown for length checks
  return htmlOrMarkdown
    .replace(/<[^>]*>?/gm, '')
    .replace(/[#*_~`]/g, '')
    .trim();
};

const extractBulletPoints = (text: string): string[] => {
  if (!text) return [];
  // Split by newlines, then look for lines starting with bullet-like chars
  const lines = text.split('\n');
  const bullets = lines
    .map(line => line.trim())
    .filter(line => line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))
    .map(line => line.substring(1).trim());
  return bullets;
};

const getAllDescriptions = (data: ResumeData): string[] => {
  const descriptions: string[] = [];
  
  if (data.personalInfo.summary?.trim()) {
    descriptions.push(data.personalInfo.summary);
  }
  
  data.sections.forEach(section => {
    if (section.type === 'experience' || section.type === 'education') {
      section.items.forEach(item => {
        if (item.description) descriptions.push(item.description);
      });
    } else if (section.type === 'custom') {
      // Find textarea fields
      const textFields = section.fieldDefinitions?.filter(f => f.type === 'textarea') || [];
      section.items.forEach(item => {
        textFields.forEach(field => {
          const val = item.customFields?.find(cf => cf.fieldId === field.id)?.value;
          if (val && typeof val === 'string') {
            descriptions.push(val);
          }
        });
      });
    }
  });
  
  return descriptions;
};

export const calculateAtsScore = (data: ResumeData): AtsScore => {
  let score = 0;
  const feedback: AtsFeedback[] = [];
  const maxScores = {
    contact: 15,
    sections: 15,
    verbs: 35,
    quantifiers: 25,
    length: 10,
  };

  // 1. Contact Info (Max 15)
  let contactScore = 0;
  if (data.personalInfo.fullName?.trim().includes(' ')) contactScore += 5; // Require first and last name
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personalInfo.email || '')) contactScore += 5;
  if (/[\d\+\-\(\)\s]{7,}/.test(data.personalInfo.phone || '') || (data.personalInfo.location?.trim().length >= 4)) contactScore += 5;
  
  score += contactScore;
  if (contactScore === maxScores.contact) {
    feedback.push({ type: 'success', message: 'Contact information is complete.' });
  } else {
    feedback.push({ type: 'error', message: 'Missing contact information. Ensure name, email, and phone/location are filled out.' });
  }

  // 2. Core Sections (Max 15)
  let sectionsScore = 0;
  const hasValidItem = (s: Section) => s.items.some(item => (
    (item.title && item.title.trim().length > 3) || 
    (item.company && item.company.trim().length > 3) || 
    (item.institution && item.institution.trim().length > 3) ||
    (s.type === 'skills' && (item.skills?.length || item.skillsWithLevels?.length))
  ));
  const hasExperience = data.sections.some(s => s.type === 'experience' && hasValidItem(s));
  const hasEducation = data.sections.some(s => s.type === 'education' && hasValidItem(s));
  const hasSkills = data.sections.some(s => s.type === 'skills' && hasValidItem(s));
  
  if (hasExperience) sectionsScore += 6;
  if (hasSkills) sectionsScore += 5;
  if (hasEducation) sectionsScore += 4;
  
  score += sectionsScore;
  if (sectionsScore === maxScores.sections) {
    feedback.push({ type: 'success', message: 'Core sections (Experience, Skills, Education) are present.' });
  } else {
    feedback.push({ type: 'error', message: 'Missing core sections. An ATS expects clear Experience, Skills, and Education sections.' });
  }

  // Extract all descriptions and bullet points
  const descriptions = getAllDescriptions(data);
  let totalBullets = 0;
  let strongBullets = 0;
  let quantifiedBullets = 0;
  let overlongBullets = 0;
  let tooShortBullets = 0;
  let hasGibberish = false;
  let buzzwordsFound = 0;

  // 2.5 Empty Section Penalties
  let emptySectionsCount = 0;
  data.sections.forEach(s => {
    if (!s.isVisible) return;
    
    let isEmpty = false;
    if (s.items.length === 0) {
      isEmpty = true;
    } else {
      const allEmpty = s.items.every(item => {
        if (s.type === 'skills') return !item.skills?.length && !item.skillsWithLevels?.length;
        if (s.type === 'custom' || s.fieldDefinitions) {
          return !item.customFields || item.customFields.every(cf => !cf.value || cf.value.length === 0);
        }
        return !item.title?.trim() && !item.company?.trim() && !item.institution?.trim() && !item.description?.trim();
      });
      if (allEmpty) isEmpty = true;
    }

    if (isEmpty) {
      emptySectionsCount++;
      feedback.push({ type: 'error', message: `You have an empty "${s.title}" section. Please fill it out or remove it.` });
    }

    // Check for missing critical fields within items
    if (!isEmpty) {
      s.items.forEach((item, idx) => {
        let missingFields: string[] = [];
        if (s.type === 'experience' || s.type === 'volunteer') {
          if (!item.position?.trim()) missingFields.push('Role/Position');
          if (!item.company?.trim()) missingFields.push('Organization/Company');
          if (!item.startDate?.trim()) missingFields.push('Start Date');
        } else if (s.type === 'education') {
          if (!item.degree?.trim()) missingFields.push('Degree/Program');
          if (!item.institution?.trim()) missingFields.push('Institution');
        } else if (s.type === 'projects') {
          if (!item.title?.trim()) missingFields.push('Project Name');
          if (!item.description?.trim()) missingFields.push('Description');
        } else if (s.type === 'certifications' || s.type === 'awards') {
          if (!item.title?.trim()) missingFields.push('Title/Name');
          if (!item.institution?.trim() && !item.startDate?.trim()) missingFields.push('Issuer or Date');
        } else if (s.type === 'publications') {
          if (!item.title?.trim()) missingFields.push('Title');
          if (!item.institution?.trim()) missingFields.push('Publisher');
          if (!item.startDate?.trim()) missingFields.push('Date');
        }

        if (missingFields.length > 0) {
          score -= (missingFields.length * 3);
          feedback.push({ type: 'error', message: `Item ${idx + 1} in "${s.title}" is missing critical data: ${missingFields.join(', ')}.` });
        }
      });
    }
  });

  if (emptySectionsCount > 0) {
    score -= (emptySectionsCount * 5);
  }

  // 2.6 Professional Summary Length
  const summaryText = data.personalInfo.summary?.trim();
  if (summaryText) {
    const summaryWords = summaryText.split(/\s+/).length;
    if (summaryWords < 30) {
      score -= 5;
      feedback.push({ type: 'warning', message: 'Your professional summary is too brief. Aim for 30-100 words to highlight your core value.' });
    } else if (summaryWords > 100) {
      score -= 5;
      feedback.push({ type: 'warning', message: 'Your professional summary is too long. Keep it concise (30-100 words) so recruiters can scan it quickly.' });
    } else {
      feedback.push({ type: 'success', message: 'Your professional summary is an optimal length (30-100 words).' });
    }
  } else {
    feedback.push({ type: 'warning', message: 'Add a professional summary to highlight your career objectives and top skills.' });
  }

  // 2.6.5 Headline Length Check
  const headline = data.personalInfo.title?.trim();
  if (headline) {
    const headlineWords = headline.split(/\s+/).length;
    if (headlineWords > 5) {
      score -= 5;
      feedback.push({ type: 'warning', message: 'Your headline (Job Title) is too long. Keep it to a standard professional title (1-5 words) like "Senior Software Engineer".' });
    }
  }

  // 2.7 Bullet Point Counts per Role
  let rolesWithTooFewBullets = 0;
  let rolesWithTooManyBullets = 0;
  data.sections.forEach(s => {
    if (!s.isVisible || (s.type !== 'experience' && s.type !== 'projects' && s.type !== 'custom' && !s.fieldDefinitions)) return;
    s.items.forEach(item => {
      let desc = '';
      if (item.description) desc = item.description;
      else if (item.customFields) {
        const textFields = s.fieldDefinitions?.filter(f => f.type === 'textarea') || [];
        textFields.forEach(field => {
          const val = item.customFields?.find(cf => cf.fieldId === field.id)?.value;
          if (val && typeof val === 'string') desc += val + '\n';
        });
      }
      
      if (desc.trim()) {
        const bullets = extractBulletPoints(desc);
        if (bullets.length > 0) {
          if (bullets.length < 2) rolesWithTooFewBullets++;
          if (bullets.length > 6) rolesWithTooManyBullets++;
        }
      }
    });
  });

  if (rolesWithTooFewBullets > 0) {
    score -= (rolesWithTooFewBullets * 3);
    feedback.push({ type: 'warning', message: 'Some roles have too few bullet points. Aim for 2-6 bullets per role to show impact.' });
  }
  if (rolesWithTooManyBullets > 0) {
    score -= (rolesWithTooManyBullets * 3);
    feedback.push({ type: 'warning', message: 'Some roles have too many bullet points. Keep it concise (max 6) to hold the recruiter\'s attention.' });
  }

  // 2.8 Standard Section Titles
  const STANDARD_TITLES = new Set([
    'experience', 'work experience', 'employment', 'employment history', 'work history', 'professional experience',
    'skills', 'core competencies', 'technical skills', 'expertise', 'technologies',
    'education', 'academic background', 'academic history',
    'projects', 'personal projects', 'academic projects',
    'certifications', 'licenses', 'courses', 'training',
    'volunteer', 'volunteer experience', 'extracurriculars',
    'summary', 'professional summary', 'profile', 'objective', 'about',
    'publications', 'awards', 'honors', 'awards  honors', 'awards and honors', 'languages', 'custom section'
  ]);
  
  let creativeTitles = 0;
  data.sections.forEach(s => {
    if (!s.isVisible) return;
    const normalizedTitle = s.title.toLowerCase().replace(/[^a-z ]/g, '').trim();
    if (!STANDARD_TITLES.has(normalizedTitle) && normalizedTitle.length > 0) {
      creativeTitles++;
      feedback.push({ type: 'warning', message: `The section title "${s.title}" may confuse an ATS. Consider using a standard heading like "Experience" or "Skills".` });
    }
  });
  if (creativeTitles > 0) {
    score -= (creativeTitles * 3);
  }

  // 2.9 Emoji & Formatting Check
  let hasEmojis = false;
  // Basic emoji/symbol detection range (excluding standard punctuation/bullets in 2000-25FF)
  const emojiRegex = /[\u2600-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD10-\uDDFF]/;
  
  if (emojiRegex.test(data.personalInfo.fullName || '') || emojiRegex.test(summaryText || '')) hasEmojis = true;
  data.sections.forEach(s => {
    if (emojiRegex.test(s.title)) hasEmojis = true;
    s.items.forEach(item => {
      if (emojiRegex.test(item.title || '') || emojiRegex.test(item.company || '') || emojiRegex.test(item.description || '')) hasEmojis = true;
    });
  });

  if (hasEmojis) {
    score -= 10;
    feedback.push({ type: 'error', message: 'Emojis or unsupported symbols detected. ATS systems cannot parse graphics; use standard text and bullets.' });
  }

  descriptions.forEach(desc => {
    const textLowerCase = extractText(desc).toLowerCase();
    BUZZWORDS.forEach(word => {
      // Use regex to match whole word to avoid partial matches
      if (new RegExp(`\\b${word}\\b`).test(textLowerCase)) {
        buzzwordsFound++;
      }
    });

    const bullets = extractBulletPoints(desc);
    
    // Check for keyboard mashing (> 20 char words that aren't URLs)
    if (extractText(desc).split(/\s+/).some(w => w.length > 20 && !w.includes('http') && !w.includes('www'))) {
      hasGibberish = true;
    }

    if (bullets.length === 0) {
      // If they didn't use bullet points, we treat the whole description as one chunk for length checks
      // Skip summary from brevity penalty since it's evaluated separately above
      if (desc === summaryText) return;

      const words = extractText(desc).split(/\s+/);
      if (words.length > 60) overlongBullets++;
      else if (words.length < 8) tooShortBullets++;
      return;
    }

    bullets.forEach(bullet => {
      totalBullets++;
      const text = extractText(bullet);
      const words = text.split(/\s+/);
      
      // Check verb strength (first word)
      if (words.length > 0) {
        const firstWord = words[0].toLowerCase().replace(/[^a-z]/g, '');
        if (STRONG_VERBS.has(firstWord) && firstWord.length > 2) {
          strongBullets++;
        }
      }

      // Check quantifiers (numbers, %, $)
      if (/(\d+|%|\$)/.test(text)) {
        quantifiedBullets++;
      }

      // Check length
      if (words.length > 35) {
        overlongBullets++;
      } else if (words.length < 8) {
        tooShortBullets++;
      }
    });
  });

  // 3. Action Verbs (Max 35)
  if (totalBullets === 0) {
    if (hasExperience) {
      feedback.push({ type: 'warning', message: 'Consider using bullet points (* or -) in your descriptions for better ATS readability.' });
    }
  } else {
    const verbRatio = strongBullets / totalBullets;
    const verbScore = Math.round(verbRatio * maxScores.verbs);
    score += verbScore;
    
    if (verbRatio >= 0.8) {
      feedback.push({ type: 'success', message: 'Strong use of action verbs at the start of your bullet points.' });
    } else {
      feedback.push({ type: 'warning', message: 'Many bullet points lack strong action verbs (e.g., "Engineered", "Led", "Developed"). Start your sentences with impact.' });
    }
  }

  // 4. Quantifiers (Max 25)
  if (totalBullets > 0) {
    const quantRatio = quantifiedBullets / totalBullets;
    // We expect at least ~40% of bullets to have numbers to get full score
    const quantScore = Math.min(maxScores.quantifiers, Math.round((quantRatio / 0.4) * maxScores.quantifiers));
    score += quantScore;

    if (quantRatio >= 0.4) {
      feedback.push({ type: 'success', message: 'Great job using metrics and numbers to quantify your achievements.' });
    } else {
      feedback.push({ type: 'warning', message: 'Add more numbers, percentages, or metrics to your experience bullets to prove impact.' });
    }
  }

  // 5. Length/Brevity (Max 10)
  let lengthScore = 0;
  if (descriptions.length > 0) {
    lengthScore = maxScores.length;
    if (overlongBullets > 0) {
      lengthScore = Math.max(0, lengthScore - (overlongBullets * 5));
      feedback.push({ type: 'warning', message: 'Some bullet points or paragraphs are too long (over 35 words). Keep them concise and scannable.' });
    } else if (tooShortBullets > 0) {
      lengthScore = Math.max(0, lengthScore - (tooShortBullets * 5));
      feedback.push({ type: 'warning', message: 'Some bullet points are too short (< 8 words) to be meaningful. Expand on your impact.' });
    } else {
      feedback.push({ type: 'success', message: 'Descriptions and bullet points are concise and readable (8-35 words).' });
    }
  }
  score += lengthScore;

  // Final adjustments
  if (hasGibberish) {
    score -= 30;
    feedback.push({ type: 'error', message: 'Detected extremely long, unrecognized words. Please remove keyboard mashing/gibberish.' });
  }

  if (buzzwordsFound > 0) {
    score -= (buzzwordsFound * 5);
    feedback.push({ type: 'warning', message: 'Avoid using exaggerated buzzwords (e.g., "Ninja", "Guru", "Rockstar"). ATS systems and recruiters prefer professional language.' });
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    feedback: feedback.sort((a, b) => {
      // Errors first, then warnings, then successes
      const order = { error: 0, warning: 1, success: 2 };
      return order[a.type] - order[b.type];
    })
  };
};
