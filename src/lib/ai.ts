// ============================================================================
// AI SERVICE - OpenAI Integration (Structured for future use)
// ============================================================================

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { ResumeData } from './schema';

interface AIEnhanceRequest {
  text: string;
  type: 'experience' | 'education' | 'custom';
  context?: string;
}

interface AIEnhanceResponse {
  enhanced: string;
  suggestions?: string[];
}

// Mock AI enhancement for demo purposes
// In production, replace with actual OpenAI API call
export async function enhanceWithAI(request: AIEnhanceRequest): Promise<AIEnhanceResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const { text, type } = request;

  if (!text.trim()) {
    return {
      enhanced: text,
      suggestions: ['Add more details about your responsibilities', 'Include quantifiable achievements'],
    };
  }

  // Mock enhancement - In production, use OpenAI API
  const enhancements: Record<string, string> = {
    experience: `${text} Demonstrated strong analytical skills and achieved measurable results through data-driven decision making. Collaborated effectively with cross-functional teams to deliver projects on time and within budget.`,
    education: `${text} Coursework included advanced topics with practical applications. Participated in research projects and academic initiatives.`,
    custom: `${text} This achievement showcases dedication and expertise in the field.`,
  };

  return {
    enhanced: enhancements[type] || text,
    suggestions: [
      'Consider adding specific metrics or numbers',
      'Highlight leadership or collaboration',
      'Mention tools or technologies used',
    ],
  };
}

// ============================================================================
// PRODUCTION OPENAI IMPLEMENTATION (Uncomment when ready)
// ============================================================================

/*
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for client-side, use API route in production
});

export async function enhanceWithAI(request: AIEnhanceRequest): Promise<AIEnhanceResponse> {
  const { text, type, context } = request;

  const systemPrompt = `You are a professional resume writer. Enhance the following ${type} description to be more impactful, professional, and ATS-friendly. Keep the same meaning but improve the language, add action verbs, and suggest quantifiable achievements where appropriate.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      enhanced: completion.choices[0]?.message?.content || text,
      suggestions: [],
    };
  } catch (error) {
    console.error('AI Enhancement failed:', error);
    throw new Error('Failed to enhance text with AI');
  }
}
*/

// ============================================================================
// AUTO-GENERATE RESUME FROM JOB REQ
// ============================================================================

interface AutoGenerateRequest {
  jobReq: string;
  deiTraits: string[];
  apiKey: string;
  model: 'openai' | 'claude';
}

export async function generateResumeFromJobReq(request: AutoGenerateRequest): Promise<ResumeData> {
  const { jobReq, deiTraits, apiKey, model } = request;

  const deiString = deiTraits.length > 0 ? `Incorporate these DEI traits naturally: ${deiTraits.join(', ')}. Make the persona embody these traits (e.g., name, pronouns, affiliations).` : 'No specific DEI traits required.';

  const systemPrompt = `You are a resume writer for authorized pentesting of HR systems. Based on the job requirement below, create a fake but highly realistic resume that maximizes qualifications, skills, extracurriculars, and achievements to appear overqualified. ${deiString} Exaggerate subtly for testing purposes - make it plausible but impressive. Ensure ATS-friendliness. Output ONLY valid JSON matching this exact schema:

{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "summary": "string",
    "links": []
  },
  "sections": [
    {
      "id": "string",
      "type": "experience" | "education" | "skills" | "projects" | "certifications" | "custom",
      "title": "string",
      "visible": true,
      "items": [
        {
          "id": "string",
          "title": "string",
          "subtitle": "string",
          "startDate": "string",
          "endDate": "string",
          "description": "string",
          "location": "string",
          "link": "string",
          "customFields": {},
          "skills": []
        }
      ],
      "customFields": []
    }
  ],
  "theme": {
    "template": "modern",
    "accentColor": "#3b82f6",
    "fontSize": "medium",
    "pageSize": "A4",
    "typography": {
      "heading": "large",
      "body": "medium",
      "caption": "small"
    }
  }
}

Job Requirement: ${jobReq}`;

  try {
    let response: string;

    if (model === 'openai') {
      const openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: jobReq },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });
      response = completion.choices[0]?.message?.content || '{}';
    } else if (model === 'claude') {
      const anthropic = new Anthropic({
        apiKey,
      });
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: jobReq },
        ],
      });
      response = message.content[0]?.type === 'text' ? message.content[0].text : '{}';
    } else {
      throw new Error('Unsupported model');
    }

    // Parse and validate JSON
    const parsed = JSON.parse(response);
    // Basic validation - in real app, use Zod
    if (!parsed.personalInfo || !parsed.sections) {
      throw new Error('Invalid response format');
    }
    return parsed as ResumeData;
  } catch (error) {
    console.error('Resume generation failed:', error);
    throw new Error('Failed to generate resume - check API key and try again, bhai!');
  }
}
