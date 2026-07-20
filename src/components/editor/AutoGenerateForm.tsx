import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Key, Info } from 'lucide-react';
import { FormTextarea } from './FormInput';
import { useResumeStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { callAI } from '@/lib/ai';

export const AutoGenerateForm: React.FC = () => {
  const [jobReq, setJobReq] = useState('');
  const [context, setContext] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [webllmProgress, setWebllmProgress] = useState<{ progress: number, text: string } | null>(null);
  const { autoGenerateResume } = useResumeStore();

  useEffect(() => {
    const handleProgress = (e: any) => setWebllmProgress(e.detail);
    if (typeof window !== 'undefined') {
      window.addEventListener('webllm-progress', handleProgress);
      return () => window.removeEventListener('webllm-progress', handleProgress);
    }
  }, []);

  useEffect(() => {
    const storedProvider = localStorage.getItem('ai_provider') || 'openai';
    const storedKey = localStorage.getItem(`${storedProvider}_key`);
    setProvider(storedProvider);
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setProvider(val);
    localStorage.setItem('ai_provider', val);
    const storedKey = localStorage.getItem(`${val}_key`);
    setApiKey(storedKey || '');
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem(`${provider}_key`, val);
  };

  const generatePrompt = () => {
    return `You are a professional resume writer assisting a user. Write a well-structured, realistic resume tailored to the given job description. Incorporate the provided optional context where appropriate. Output ONLY valid JSON matching this schema exactly:
    {
      "personalInfo": { "fullName": "Name", "title": "Job Title", "email": "", "phone": "", "location": "", "summary": "Short professional headline", "website": "", "linkedin": "", "github": "", "links": [] },
      "sections": [
        {
          "id": "exp", "type": "experience", "title": "Experience", "isVisible": true,
          "items": [
            { "id": "1", "position": "Job Title", "company": "Company", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "description": "Bullet points", "location": "", "skills": [] }
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
      ],
      "theme": { "template": "modern", "accentColor": "#000000", "fontSize": "medium", "pageSize": "A4", "typography": { "name": "lg", "headers": "md", "body": "sm", "experience": "sm", "skills": "sm" } }
    }`;
  };

  const handleGenerate = async () => {
    if (!apiKey.trim() && provider !== 'ollama' && provider !== 'webllm') {
      setError(`Please provide your ${provider.toUpperCase()} API key.`);
      return;
    }
    if (!jobReq.trim()) {
      setError('Please paste a job description.');
      return;
    }

    setError('');
    setIsGenerating(true);

    const systemPrompt = generatePrompt();
    const userPrompt = `Job Description: ${jobReq}\n\nOptional Context: ${context || 'None'}`;
    
    try {
      const content = await callAI(systemPrompt, userPrompt, provider, apiKey);

      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      } else {
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = content.slice(firstBrace, lastBrace + 1);
        }
      }

      const parsedResume = JSON.parse(jsonStr);
      if (!parsedResume.personalInfo || !parsedResume.sections) {
        throw new Error('Received malformed response from the AI.');
      }

      autoGenerateResume(parsedResume);
      alert('Resume customized successfully! Review the output thoroughly before use.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass rounded-lg bento-card overflow-hidden mb-4">
      <div className="bg-muted/50 px-4 py-3 border-b border-border/50">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI Resume Generator
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Paste a job description to generate a customized resume draft aligned with the role.
          Use responsibly. This tool is intended for practice, testing, and personalization—not for misrepresentation.
        </p>
      </div>
      <div className="p-4 space-y-5">
        <div>
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <Key className="w-4 h-4" />
            AI Configuration
          </h4>
          <div className="space-y-3 relative">
            <div>
              <label htmlFor="ai-provider" className="text-sm font-medium text-muted-foreground mb-1 block">
                AI Provider
              </label>
              <select
                id="ai-provider"
                value={provider}
                onChange={handleProviderChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="grok">Grok (xAI)</option>
                <option value="google">Google (Gemini 1.5 Pro)</option>
                <option value="anthropic">Claude (Anthropic) *May require CORS proxy</option>
                <option value="openrouter">OpenRouter</option>
                <option value="ollama">Ollama (Local LLM)</option>
                <option value="webllm">WebLLM (In-Browser Free)</option>
              </select>
            </div>
            
            {provider === 'ollama' ? (
              <div className="space-y-3">
                <div>
                  <label htmlFor="ollama-endpoint" className="text-sm font-medium text-muted-foreground mb-1 block">Ollama Endpoint</label>
                  <input
                    id="ollama-endpoint"
                    type="text"
                    placeholder="http://localhost:11434/v1/chat/completions"
                    defaultValue={localStorage.getItem('ollama_endpoint') || 'http://localhost:11434/v1/chat/completions'}
                    onChange={(e) => localStorage.setItem('ollama_endpoint', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div>
                  <label htmlFor="ollama-model" className="text-sm font-medium text-muted-foreground mb-1 block">Ollama Model</label>
                  <input
                    id="ollama-model"
                    type="text"
                    placeholder="llama3"
                    defaultValue={localStorage.getItem('ollama_model') || 'llama3'}
                    onChange={(e) => localStorage.setItem('ollama_model', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            ) : provider === 'webllm' ? (
              <div className="bg-primary/5 text-primary text-xs p-3 rounded flex gap-2 items-start border border-primary/20">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  <strong>WebLLM</strong> downloads an AI model directly into your browser cache (requires ~2GB download on first use). 
                  It runs entirely offline on your GPU!
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="api-key-input" className="text-sm font-medium text-muted-foreground mb-1 block">
                  {provider === 'openai' && 'OpenAI API Key'}
                  {provider === 'grok' && 'xAI API Key'}
                  {provider === 'google' && 'Google Studio API Key'}
                  {provider === 'anthropic' && 'Anthropic API Key'}
                  {provider === 'openrouter' && 'OpenRouter API Key'}
                </label>
                <input
                  id="api-key-input"
                  type="password"
                  placeholder={provider === 'google' ? "AIza..." : "sk-..."}
                  value={apiKey}
                  onChange={handleKeyChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}
            
            {provider === 'anthropic' && (
              <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] p-2 rounded flex gap-1.5 items-start">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Anthropic blocks browser requests by default. If it fails with a CORS error, use OpenRouter or a browser extension.</span>
              </div>
            )}
            
            <p className="text-[11px] text-muted-foreground">
              Your API key is used only in your browser and is never stored on any server.<br/>
              Do not share your API key. You are responsible for usage and associated costs.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50 space-y-4">
          <FormTextarea
            label="Job Description"
            placeholder="Paste the target job description here..."
            value={jobReq}
            onChange={(e) => setJobReq(e.target.value)}
            rows={5}
            maxLength={10000}
          />

          <div>
            <FormTextarea
              label="Optional Context (for testing and personalization)"
              placeholder="e.g., Target tone, prior background constraints, preferred skills to emphasize..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              maxLength={2000}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Avoid using sensitive or protected attributes unless necessary for legitimate use.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || (!apiKey.trim() && provider !== 'ollama' && provider !== 'webllm') || !jobReq.trim()}
          className={cn(
            'w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          )}
        >
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Resume Draft...</span>
              </div>
              {provider === 'webllm' && webllmProgress && (
                <div className="w-full mt-2 text-xs opacity-90 text-center">
                  <div className="w-full bg-primary-foreground/20 rounded-full h-1.5 mb-1">
                    <div className="bg-primary-foreground h-1.5 rounded-full transition-all duration-300" style={{ width: `${(webllmProgress.progress * 100).toFixed(0)}%` }}></div>
                  </div>
                  {webllmProgress.text}
                </div>
              )}
            </div>
          ) : (
            'Generate Resume'
          )}
        </button>
      </div>
    </div>
  );
};
