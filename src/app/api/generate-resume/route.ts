import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { Mistral } from '@mistralai/mistralai';
import { LLM_MODELS } from '@/lib/ai';

export const maxDuration = 60; // Allow enough time for LLM generation on Vercel

// Basic rate limiting implementation (in-memory, for demonstration)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_TOKENS = 10; // 10 requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RESPONSE_CODE_BLOCK_PATTERN = /```(?:json)?\s*([\s\S]*?)```/;

interface GenerateRequestBody {
  jobReq: string;
  deiTraits: string[];
  modelId: string;
}

type ValidationResult =
  | { ok: true; value: GenerateRequestBody }
  | { ok: false; response: NextResponse };

const isObjectRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (!forwardedFor) {
    return 'anonymous';
  }
  return forwardedFor.split(',')[0].trim() || 'anonymous';
};

const sanitizeTraits = (traits: unknown): string[] => {
  if (!Array.isArray(traits)) {
    return [];
  }
  return traits
    .map((trait) => String(trait).substring(0, 50))
    .slice(0, 20);
};

const validateRequestBody = (body: unknown): ValidationResult => {
  if (!isObjectRecord(body)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid request body' }, { status: 400 }),
    };
  }

  const rawJobReq = body.jobReq;
  if (typeof rawJobReq !== 'string' || !rawJobReq.trim()) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Job requirement is required and must be text' }, { status: 400 }),
    };
  }

  if (rawJobReq.length > 5000) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Job requirement is too long. Please limit to 5000 characters.' }, { status: 400 }),
    };
  }

  const rawModelId = body.modelId;
  if (typeof rawModelId !== 'string' || !rawModelId.trim()) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Model ID is required' }, { status: 400 }),
    };
  }

  return {
    ok: true,
    value: {
      jobReq: rawJobReq,
      deiTraits: sanitizeTraits(body.deiTraits),
      modelId: rawModelId,
    },
  };
};

const getPromptWithTraits = (traits: string[]): string => {
  if (traits.length === 0) {
    return 'No specific DEI traits required.';
  }
  return `Incorporate these DEI traits naturally: ${traits.join(', ')}. Make the persona embody these traits (e.g., name, pronouns, affiliations).`;
};

const buildSystemPrompt = (traits: string[]): string => {
  const deiString = getPromptWithTraits(traits);
  return `You are a resume writer for authorized pentesting of HR systems. Based on the job requirement below, create a fake but highly realistic resume that maximizes qualifications, skills, extracurriculars, and achievements to appear overqualified. ${deiString} Exaggerate subtly for testing purposes - make it plausible but impressive. Ensure ATS-friendliness. Output ONLY valid JSON matching this exact schema:

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
}`;
};

const parseResponseJsonString = (responseStr: string): string => {
  const match = RESPONSE_CODE_BLOCK_PATTERN.exec(responseStr);
  if (!match?.[1]) {
    return responseStr;
  }
  return match[1].trim();
};

const isTimeoutError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.name === 'AbortError' || error.message === 'Request Timeout';
  }
  return false;
};

const ensureConfiguredKey = (envKey: string | undefined, providerName: string): string | NextResponse => {
  if (!envKey) {
    return NextResponse.json({ error: `${providerName} API key not configured on server` }, { status: 500 });
  }
  return envKey;
};

const getMistralContent = (completion: unknown): string => {
  if (!isObjectRecord(completion) || !Array.isArray(completion.choices)) {
    return '{}';
  }

  const firstChoice = completion.choices[0];
  if (!isObjectRecord(firstChoice) || !isObjectRecord(firstChoice.message)) {
    return '{}';
  }

  const content = firstChoice.message.content;
  return typeof content === 'string' ? content : '{}';
};

const callModelProvider = async (
  provider: string,
  modelId: string,
  systemPrompt: string,
  jobReq: string,
  signal: AbortSignal
): Promise<string | NextResponse> => {
  switch (provider) {
    case 'openai': {
      const key = ensureConfiguredKey(process.env.OPENAI_API_KEY, 'OpenAI');
      if (key instanceof NextResponse) {
        return key;
      }

      const openai = new OpenAI({ apiKey: key });
      const completion = await openai.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: jobReq },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }, { signal });
      return completion.choices[0]?.message?.content || '{}';
    }

    case 'anthropic': {
      const key = ensureConfiguredKey(process.env.ANTHROPIC_API_KEY, 'Anthropic');
      if (key instanceof NextResponse) {
        return key;
      }

      const anthropic = new Anthropic({ apiKey: key });
      const message = await anthropic.messages.create({
        model: modelId,
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: jobReq }],
      }, { signal });
      return message.content[0]?.type === 'text' ? message.content[0].text : '{}';
    }

    case 'groq': {
      const key = ensureConfiguredKey(process.env.GROQ_API_KEY, 'Groq');
      if (key instanceof NextResponse) {
        return key;
      }

      const groq = new Groq({ apiKey: key });
      const completion = await groq.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: jobReq },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }, { signal });
      return completion.choices[0]?.message?.content || '{}';
    }

    case 'mistral': {
      const key = ensureConfiguredKey(process.env.MISTRAL_API_KEY, 'Mistral');
      if (key instanceof NextResponse) {
        return key;
      }

      const mistral = new Mistral({ apiKey: key });
      const completion = await Promise.race([
        mistral.chat.complete({
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: jobReq },
          ],
          temperature: 0.7,
          maxTokens: 3000,
        }),
        new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(new Error('Request Timeout')), { once: true });
        }),
      ]);

      return getMistralContent(completion);
    }

    default:
      return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
  }
};

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);
  // Clean up old entries periodically or rely on resetTime
  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT_TOKENS) {
    return false;
  }
  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = validateRequestBody(body);
    if (!validation.ok) {
      return validation.response;
    }

    const { jobReq, deiTraits, modelId } = validation.value;

    const selectedModel = LLM_MODELS.find((model) => model.id === modelId);
    if (!selectedModel) {
      return NextResponse.json({ error: `Unknown model: ${modelId}` }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(deiTraits);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    const providerResponse = await callModelProvider(
      selectedModel.provider,
      selectedModel.modelId,
      systemPrompt,
      jobReq,
      controller.signal
    );

    try {
      if (providerResponse instanceof NextResponse) {
        return providerResponse;
      }

      const jsonStr = parseResponseJsonString(providerResponse);
      const parsed = JSON.parse(jsonStr);

      if (!parsed.personalInfo || !parsed.sections) {
        return NextResponse.json({ error: 'LLM returned an invalid response format' }, { status: 502 });
      }

      return NextResponse.json(parsed);
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error: unknown) {
    console.error('Resume generation API error:', error);

    if (isTimeoutError(error)) {
      return NextResponse.json({ error: 'Request timed out. The model took too long to respond.' }, { status: 504 });
    }

    return NextResponse.json(
      { error: 'An error occurred while generating the resume. Please try again.' },
      { status: 500 }
    );
  }
}
