import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { FormTextarea } from './FormInput';
import { generateResumeFromJobReq } from '@/lib/ai';
import { useResumeStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const DEI_OPTIONS = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'ethnic_asian', label: 'Asian/Ethnic Minority' },
  { id: 'ethnic_black', label: 'Black' },
  { id: 'ethnic_latino', label: 'Latino/Hispanic' },
  { id: 'disabled_physical', label: 'Physically Disabled' },
  { id: 'disabled_mental', label: 'Mentally Disabled' },
  { id: 'lgbt_gay', label: 'Gay/Lesbian' },
  { id: 'lgbt_trans', label: 'Transgender' },
  { id: 'lgbt_bisexual', label: 'Bisexual' },
  { id: 'veteran', label: 'Veteran' },
];

export const AutoGenerateForm: React.FC = () => {
  const [jobReq, setJobReq] = useState('');
  const [deiTraits, setDeiTraits] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState<'openai' | 'claude'>('openai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const { autoGenerateResume } = useResumeStore();

  const handleDeiChange = (id: string, checked: boolean) => {
    if (checked) {
      setDeiTraits([...deiTraits, id]);
    } else {
      setDeiTraits(deiTraits.filter((t: string) => t !== id));
    }
  };

  const handleGenerate = async () => {
    if (!jobReq.trim()) {
      setError('Bhai, paste the job req first!');
      return;
    }
    if (!apiKey.trim()) {
      setError('API key needed, yaar!');
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const data = await generateResumeFromJobReq({ jobReq, deiTraits, apiKey, model });
      autoGenerateResume(data);
      alert('Resume generated successfully! Edit as needed.');
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
          Auto-Generate Resume for Pentesting
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Paste job req, select DEI traits to max checkmarks, and generate a fake but realistic resume. For authorized testing only, bhai!
        </p>
      </div>
      <div className="p-4 space-y-4">
        <FormTextarea
          label="Job Requirement"
          placeholder="Paste the job description here..."
          value={jobReq}
          onChange={(e) => setJobReq(e.target.value)}
          rows={6}
        />
        <div>
          <label className="text-sm font-medium text-muted-foreground">DEI Traits (Maximize for Testing)</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {DEI_OPTIONS.map((option) => (
              <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deiTraits.includes(option.id)}
                  onChange={(e) => handleDeiChange(option.id, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">LLM Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as 'openai' | 'claude')}
              className="w-full px-3 py-2 border border-border rounded-none bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="openai">OpenAI GPT-4</option>
              <option value="claude">Claude 3.5 Sonnet</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">API Key</label>
            <input
              type="password"
              placeholder="Your API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-none bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={cn(
            'w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2'
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Resume'
          )}
        </button>
      </div>
    </div>
  );
};