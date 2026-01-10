// ============================================================================
// AI SERVICE - Multi-LLM Integration
// ============================================================================

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { Mistral } from '@mistralai/mistralai';
import { ResumeData } from './schema';

// Supported LLM Models
export type LLMProvider = 'openai' | 'anthropic' | 'groq' | 'mistral';

export interface LLMModel {
  id: string;
  name: string;
  provider: LLMProvider;
  modelId: string;
}

export const LLM_MODELS: LLMModel[] = [
  // OpenAI Models
  { id: 'gpt-5', name: 'GPT-5', provider: 'openai', modelId: 'gpt-5' },
  { id: 'gpt-5.2', name: 'GPT-5.2 Turbo', provider: 'openai', modelId: 'gpt-5.2-turbo' },
  { id: 'gpt-5.1', name: 'GPT-5.1', provider: 'openai', modelId: 'gpt-5.1' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', modelId: 'gpt-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', modelId: 'gpt-4o-mini' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', modelId: 'gpt-4-turbo' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai', modelId: 'gpt-4' },
  { id: 'o1', name: 'OpenAI o1', provider: 'openai', modelId: 'o1' },
  { id: 'o1-mini', name: 'OpenAI o1-mini', provider: 'openai', modelId: 'o1-mini' },
  { id: 'o3-mini', name: 'OpenAI o3-mini', provider: 'openai', modelId: 'o3-mini' },

  // Anthropic Claude Models
  { id: 'claude-4-opus', name: 'Claude 4 Opus', provider: 'anthropic', modelId: 'claude-4-opus-20260101' },
  { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', provider: 'anthropic', modelId: 'claude-4-sonnet-20260101' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', modelId: 'claude-3-opus-20240229' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic', modelId: 'claude-3-haiku-20240307' },

  // Groq Models (Fast inference)
  { id: 'groq-llama-3.3-70b', name: 'Llama 3.3 70B (Groq)', provider: 'groq', modelId: 'llama-3.3-70b-versatile' },
  { id: 'groq-llama-3.1-70b', name: 'Llama 3.1 70B (Groq)', provider: 'groq', modelId: 'llama-3.1-70b-versatile' },
  { id: 'groq-llama-3.1-8b', name: 'Llama 3.1 8B (Groq)', provider: 'groq', modelId: 'llama-3.1-8b-instant' },
  { id: 'groq-mixtral', name: 'Mixtral 8x7B (Groq)', provider: 'groq', modelId: 'mixtral-8x7b-32768' },
  { id: 'groq-gemma2', name: 'Gemma 2 9B (Groq)', provider: 'groq', modelId: 'gemma2-9b-it' },

  // Mistral Models
  { id: 'mistral-large', name: 'Mistral Large', provider: 'mistral', modelId: 'mistral-large-latest' },
  { id: 'mistral-medium', name: 'Mistral Medium', provider: 'mistral', modelId: 'mistral-medium-latest' },
  { id: 'mistral-small', name: 'Mistral Small', provider: 'mistral', modelId: 'mistral-small-latest' },
  { id: 'codestral', name: 'Codestral', provider: 'mistral', modelId: 'codestral-latest' },
];

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
  modelId: string; // e.g., 'gpt-5', 'claude-4-opus', 'groq-llama-3.3-70b'
}

export async function generateResumeFromJobReq(request: AutoGenerateRequest): Promise<ResumeData> {
  const { jobReq, deiTraits, apiKey, modelId } = request;

  const selectedModel = LLM_MODELS.find(m => m.id === modelId);
  if (!selectedModel) {
    throw new Error(`Unknown model: ${modelId}`);
  }

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

    switch (selectedModel.provider) {
      case 'openai': {
        const openai = new OpenAI({
          apiKey,
          dangerouslyAllowBrowser: true,
        });
        const completion = await openai.chat.completions.create({
          model: selectedModel.modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: jobReq },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });
        response = completion.choices[0]?.message?.content || '{}';
        break;
      }

      case 'anthropic': {
        const anthropic = new Anthropic({
          apiKey,
        });
        const message = await anthropic.messages.create({
          model: selectedModel.modelId,
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            { role: 'user', content: jobReq },
          ],
        });
        response = message.content[0]?.type === 'text' ? message.content[0].text : '{}';
        break;
      }

      case 'groq': {
        const groq = new Groq({
          apiKey,
          dangerouslyAllowBrowser: true,
        });
        const completion = await groq.chat.completions.create({
          model: selectedModel.modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: jobReq },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });
        response = completion.choices[0]?.message?.content || '{}';
        break;
      }

      case 'mistral': {
        const mistral = new Mistral({ apiKey });
        const completion = await mistral.chat.complete({
          model: selectedModel.modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: jobReq },
          ],
          temperature: 0.7,
          maxTokens: 4000,
        });
        const choice = completion.choices?.[0];
        response = (choice?.message?.content as string) || '{}';
        break;
      }

      default:
        throw new Error(`Unsupported provider: ${selectedModel.provider}`);
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response;
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // Parse and validate JSON
    const parsed = JSON.parse(jsonStr);
    // Basic validation - in real app, use Zod
    if (!parsed.personalInfo || !parsed.sections) {
      throw new Error('Invalid response format');
    }
    return parsed as ResumeData;
  } catch (error) {
    console.error('Resume generation failed:', error);
    throw new Error(`Failed to generate resume with ${selectedModel.name} - check API key and try again!`);
  }
}
