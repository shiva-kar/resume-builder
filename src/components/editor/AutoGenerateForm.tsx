import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Key } from 'lucide-react';
import { FormTextarea } from './FormInput';
import { useResumeStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export const AutoGenerateForm: React.FC = () => {
  const [jobReq, setJobReq] = useState('');
  const [context, setContext] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const { autoGenerateResume } = useResumeStore();

  useEffect(() => {
    const storedKey = localStorage.getItem('openai_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('openai_key', val);
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setError('Please provide an OpenAI API key.');
      return;
    }
    if (!jobReq.trim()) {
      setError('Please paste a job description.');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a professional resume writer assisting a user. Write a well-structured, realistic resume tailored to the given job description. Incorporate the provided optional context where appropriate. Output ONLY valid JSON matching this schema:
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
              }`
            },
            {
              role: 'user',
              content: `Job Description: ${jobReq}\n\nOptional Context: ${context || 'None'}`
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API Error: Status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';

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
          <div className="space-y-2 relative">
            <label htmlFor="openai-api-key-input" className="text-sm font-medium text-muted-foreground">
              OpenAI API Key (stored locally in your browser)
            </label>
            <input
              id="openai-api-key-input"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={handleKeyChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
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
