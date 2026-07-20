import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

let webllmEngine: MLCEngine | null = null;
export let webllmInitProgress = 0;
export let webllmInitText = "";

export async function getWebLLMEngine(): Promise<MLCEngine> {
  if (webllmEngine) return webllmEngine;
  
  const initProgressCallback = (initProgress: any) => {
    webllmInitProgress = initProgress.progress;
    webllmInitText = initProgress.text;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('webllm-progress', { detail: initProgress }));
    }
  };

  const selectedModel = "Phi-3-mini-4k-instruct-q4f16_1-MLC";
  
  webllmEngine = await CreateMLCEngine(
    selectedModel,
    { initProgressCallback }
  );
  
  return webllmEngine;
}

/**
 * Core AI interaction utility that supports multiple providers.
 */
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  provider: string,
  apiKey: string
): Promise<string> {
  if (!apiKey.trim() && provider !== 'ollama' && provider !== 'webllm') {
    throw new Error(`Please provide your ${provider.toUpperCase()} API key in the configuration.`);
  }

  if (provider === 'webllm') {
    if (typeof window === 'undefined') {
      throw new Error("WebLLM can only run in the browser.");
    }
    const engine = await getWebLLMEngine();
    const reply = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
    });
    return reply.choices[0]?.message.content || '{}';
  }

  let endpoint = '';
  let headers: any = { 'Content-Type': 'application/json' };
  let body: any = {};
  
  if (provider === 'openai' || provider === 'grok' || provider === 'openrouter' || provider === 'ollama') {
    if (provider === 'openai') {
      endpoint = 'https://api.openai.com/v1/chat/completions';
      body.model = 'gpt-4o';
    } else if (provider === 'grok') {
      endpoint = 'https://api.x.ai/v1/chat/completions';
      body.model = 'grok-2-latest';
    } else if (provider === 'openrouter') {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      body.model = 'anthropic/claude-3.5-sonnet'; // Default openrouter model
    } else if (provider === 'ollama') {
      // For Ollama we use the OpenAI-compatible endpoint
      endpoint = localStorage.getItem('ollama_endpoint') || 'http://localhost:11434/v1/chat/completions';
      body.model = localStorage.getItem('ollama_model') || 'llama3';
    }
    
    if (provider !== 'ollama') {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    }
    
    body.messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    // Reduce temperature for Ollama for better formatting
    body.temperature = provider === 'ollama' ? 0.3 : 0.7;
  } else if (provider === 'google') {
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey.trim()}`;
    body.contents = [
      { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
    ];
  } else if (provider === 'anthropic') {
    endpoint = 'https://api.anthropic.com/v1/messages';
    headers['x-api-key'] = apiKey.trim();
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerously-allow-browser'] = 'true';
    body.model = 'claude-3-5-sonnet-20241022';
    body.max_tokens = 4000;
    body.system = systemPrompt;
    body.messages = [{ role: 'user', content: userPrompt }];
  }

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    if (provider === 'ollama') {
      throw new Error('Failed to connect to Ollama. Ensure it is running and OLLAMA_ORIGINS="*" is set.');
    }
    throw new Error(`Connection failed: ${err.message}`);
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `API Error: Status ${response.status}`);
  }

  const data = await response.json();
  let content = '';
  
  if (provider === 'google') {
    content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  } else if (provider === 'anthropic') {
    content = data.content?.[0]?.text || '{}';
  } else {
    content = data.choices?.[0]?.message?.content || '{}';
  }

  return content;
}

/**
 * Rewrites a bullet point to use strong action verbs and quantifiers.
 */
export async function rewriteBulletPoint(
  text: string,
  context: string,
  provider: string,
  apiKey: string,
  fullResume?: any
): Promise<string> {
  const systemPrompt = `You are an expert resume writer and ATS (Applicant Tracking System) optimizer. The user will provide a resume bullet point, some context (like job title and company), and optionally their entire current resume for background context.
Your task is to rewrite the bullet point to be much stronger. 

ATS-Friendly Rules:
- Keep the bullet point concise and impactful. Do not make it too long (max 2 lines when rendered) or too short.
- Use powerful action verbs.
- Incorporate metrics and quantifiers where possible (if they make sense).
- Focus on accomplishments and impact, not just responsibilities.
- Ensure the tone is highly professional. Avoid flowery or "stupid" sounding buzzwords.
- DO NOT invent fake numbers if the original text doesn't imply a metric, but you can suggest a placeholder like "[X]%" if it fits. 
- Return ONLY the rewritten text, with no introductory text, no quotes, and no formatting (except a single bullet point if it's multi-line, but prefer a single cohesive sentence).`;

  let userPrompt = `Context: ${context}\nOriginal Bullet Point:\n${text}`;
  if (fullResume) {
    userPrompt += `\n\nFull Resume Context (For reference only, DO NOT summarize this, ONLY rewrite the Original Bullet Point above):\n${JSON.stringify(fullResume, null, 2)}`;
  }
  
  const content = await callAI(systemPrompt, userPrompt, provider, apiKey);
  return content.trim().replace(/^[-*•]\s*/, ''); // Remove bullet characters if AI adds them
}

/**
 * Extracts structured ResumeData from raw text (e.g., from a PDF import).
 */
export async function extractResumeData(
  rawText: string,
  provider: string,
  apiKey: string
): Promise<any> {
  const systemPrompt = `You are a professional resume parser. You will be provided with the raw text extracted from a resume or LinkedIn PDF.
Your task is to parse this text and structure it into a specific JSON schema.
Output ONLY valid JSON matching this schema exactly, and nothing else (no markdown wrappers like \`\`\`json):
{
  "personalInfo": { "fullName": "Name", "title": "Job Title", "email": "", "phone": "", "location": "", "summary": "Short summary", "website": "", "linkedin": "", "github": "", "links": [] },
  "sections": [
    {
      "id": "exp", "type": "experience", "title": "Experience", "isVisible": true,
      "items": [
        { "id": "1", "position": "Job Title", "company": "Company", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "description": "", "location": "", "skills": [] }
      ]
    },
    {
      "id": "edu", "type": "education", "title": "Education", "isVisible": true,
      "items": [
        { "id": "2", "degree": "Degree", "institution": "School", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "description": "" }
      ]
    },
    {
      "id": "skills", "type": "skills", "title": "Skills", "isVisible": true,
      "items": [
        { "id": "4", "skills": ["Skill 1", "Skill 2"] }
      ]
    }
    // Also include 'projects' sections as appropriate.
    // Ensure all items have a unique string id (e.g., "item-1").
  ],
  "theme": { "template": "modern", "accentColor": "#000000", "fontSize": "medium", "pageSize": "A4", "typography": { "name": "lg", "headers": "md", "body": "sm", "experience": "sm", "skills": "sm" } }
}

Important Rules:
1. Infer the section types carefully (experience, education, projects, skills).
2. For skills, if there are a lot, group them under a single section of type "skills".
3. For dates, standardize them to "YYYY-MM" or "Present".
4. Make sure "items" arrays contain objects with the EXACT fields from the schema (e.g. position, company, degree, institution).
5. If some information is missing, leave the strings empty. Do not invent data.
6. CRITICAL: NEVER output raw newlines or unescaped control characters inside string values. Always use "\\n" for newlines inside strings.`;

  const userPrompt = `Raw Resume Text:\n${rawText}`;
  
  const content = await callAI(systemPrompt, userPrompt, provider, apiKey);
  
  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  } else {
    // Attempt to extract just the JSON object if there's conversational filler
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = content.slice(firstBrace, lastBrace + 1);
    }
  }
  
  // Sanitize: replace unescaped control characters (like raw newlines/tabs) with a space.
  // This prevents "Bad control character in string literal" JSON.parse errors.
  // Escaped newlines like "\\n" are not affected because they are literal backslash+n.
  jsonStr = jsonStr.replace(/[\u0000-\u001F]+/g, ' ');
  
  return JSON.parse(jsonStr);
}
