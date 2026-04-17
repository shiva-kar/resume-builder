// ============================================================================
// AI SERVICE - Multi-LLM Integration
// ============================================================================

// Supported LLM Models
export type LLMProvider = 'openai' | 'anthropic' | 'groq' | 'mistral';

export interface LLMModel {
  id: string;
  name: string;
  provider: LLMProvider;
  modelId: string;
}

export const LLM_MODELS: LLMModel[] = [
  // ==========================================
  // OpenAI Models (Frontier & Reasoning)
  // ==========================================
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'openai', modelId: 'gpt-5.2' },
  { id: 'gpt-5.2-pro', name: 'GPT-5.2 Pro', provider: 'openai', modelId: 'gpt-5.2-pro' },
  { id: 'gpt-5.1', name: 'GPT-5.1', provider: 'openai', modelId: 'gpt-5.1' },
  { id: 'gpt-5', name: 'GPT-5', provider: 'openai', modelId: 'gpt-5' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'openai', modelId: 'gpt-5-mini' },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai', modelId: 'gpt-5-nano' },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai', modelId: 'gpt-4.1' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'openai', modelId: 'gpt-4.1-mini' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'openai', modelId: 'gpt-4.1-nano' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', modelId: 'gpt-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', modelId: 'gpt-4o-mini' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', modelId: 'gpt-4-turbo' },
  { id: 'o3', name: 'o3', provider: 'openai', modelId: 'o3' },
  { id: 'o3-pro', name: 'o3 Pro', provider: 'openai', modelId: 'o3-pro' },
  { id: 'o3-mini', name: 'o3 Mini', provider: 'openai', modelId: 'o3-mini' },
  { id: 'o4-mini', name: 'o4 Mini', provider: 'openai', modelId: 'o4-mini' },
  { id: 'o1', name: 'o1', provider: 'openai', modelId: 'o1' },

  // ==========================================
  // Anthropic Claude Models
  // ==========================================
  { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'anthropic', modelId: 'claude-opus-4-5-20250514' },
  { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'anthropic', modelId: 'claude-sonnet-4-5-20250514' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'anthropic', modelId: 'claude-haiku-4-5-20250514' },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'anthropic', modelId: 'claude-sonnet-4-20250514' },
  { id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'anthropic', modelId: 'claude-opus-4-20250514' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', modelId: 'claude-3-opus-20240229' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic', modelId: 'claude-3-haiku-20240307' },

  // ==========================================
  // Groq Models (Fast Inference)
  // ==========================================
  { id: 'groq-compound', name: 'Groq Compound', provider: 'groq', modelId: 'groq/compound' },
  { id: 'groq-gpt-oss-120b', name: 'GPT-OSS 120B (Groq)', provider: 'groq', modelId: 'openai/gpt-oss-120b' },
  { id: 'groq-gpt-oss-20b', name: 'GPT-OSS 20B (Groq)', provider: 'groq', modelId: 'openai/gpt-oss-20b' },
  { id: 'groq-llama-4-maverick', name: 'Llama 4 Maverick 17B (Groq)', provider: 'groq', modelId: 'meta-llama/llama-4-maverick-17b-128e-instruct' },
  { id: 'groq-llama-4-scout', name: 'Llama 4 Scout 17B (Groq)', provider: 'groq', modelId: 'meta-llama/llama-4-scout-17b-16e-instruct' },
  { id: 'groq-llama-3.3-70b', name: 'Llama 3.3 70B (Groq)', provider: 'groq', modelId: 'llama-3.3-70b-versatile' },
  { id: 'groq-llama-3.1-8b', name: 'Llama 3.1 8B (Groq)', provider: 'groq', modelId: 'llama-3.1-8b-instant' },
  { id: 'groq-qwen3-32b', name: 'Qwen3 32B (Groq)', provider: 'groq', modelId: 'qwen/qwen3-32b' },
  { id: 'groq-kimi-k2', name: 'Kimi K2 (Groq)', provider: 'groq', modelId: 'moonshotai/kimi-k2-instruct-0905' },

  // ==========================================
  // Mistral AI Models
  // ==========================================
  { id: 'mistral-large-3', name: 'Mistral Large 3', provider: 'mistral', modelId: 'mistral-large-latest' },
  { id: 'mistral-medium-3.1', name: 'Mistral Medium 3.1', provider: 'mistral', modelId: 'mistral-medium-latest' },
  { id: 'mistral-small-3.2', name: 'Mistral Small 3.2', provider: 'mistral', modelId: 'mistral-small-latest' },
  { id: 'magistral-medium', name: 'Magistral Medium 1.2', provider: 'mistral', modelId: 'magistral-medium-latest' },
  { id: 'magistral-small', name: 'Magistral Small 1.2', provider: 'mistral', modelId: 'magistral-small-latest' },
  { id: 'codestral', name: 'Codestral', provider: 'mistral', modelId: 'codestral-latest' },
  { id: 'devstral-2', name: 'Devstral 2', provider: 'mistral', modelId: 'devstral-latest' },
  { id: 'ministral-8b', name: 'Ministral 8B', provider: 'mistral', modelId: 'ministral-8b-latest' },
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


