import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Key, Info } from 'lucide-react';
import { FormTextarea } from './FormInput';
import { useResumeStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export const AutoGenerateForm: React.FC = () => {
  const [jobReq, setJobReq] = useState('');
  const [context, setContext] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const { autoGenerateResume } = useResumeStore();

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
    return `You are a professional resume writer assisting a user. Write a well-structured, realistic resume tailored to the given job description. Incorporate the provided optional context where appropriate. Output ONLY valid JSON matching this schema:
    {
      "personalInfo": { "name": "", "email": "", "phone": "", "location": "", "summary": "", "links": [] },
      "sections": [
        {
          "id": "", "type": "experience", "title": "", "visible": true,
          "items": [
            { "id": "", "title": "", "subtitle": "", "startDate": "", "endDate": "", "description": "", "location": "", "link": "", "customFields": {}, "skills": [] }
          ],
          "customFields": []
        }
      ],
      "theme": { "template": "modern", "accentColor": "#000000", "fontSize": "medium", "pageSize": "A4", "typography": { "heading": "large", "body": "medium", "caption": "small" } }
    }`;
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
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
    
    let endpoint = '';
    let headers: any = { 'Content-Type': 'application/json' };
    let body: any = {};
    
    if (provider === 'openai' || provider === 'grok' || provider === 'openrouter') {
      if (provider === 'openai') {
        endpoint = 'https://api.openai.com/v1/chat/completions';
        body.model = 'gpt-4o';
      } else if (provider === 'grok') {
        endpoint = 'https://api.x.ai/v1/chat/completions';
        body.model = 'grok-2-latest';
      } else if (provider === 'openrouter') {
        endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        body.model = 'anthropic/claude-3.5-sonnet'; // Default openrouter model
      }
      
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      body.messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];
      body.temperature = 0.7;
    } else if (provider === 'google') {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey.trim()}`;
      body.contents = [
        { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
      ];
      body.generationConfig = { responseMimeType: "application/json" };
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

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

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

      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();

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
              </select>
            </div>
            
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
          disabled={isGenerating || !apiKey.trim() || !jobReq.trim()}
          className={cn(
            'w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Resume Draft...
            </>
          ) : (
            'Generate Resume'
          )}
        </button>
      </div>
    </div>
  );
};
