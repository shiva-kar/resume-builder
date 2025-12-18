'use client';

import React from 'react';
import {
  Plus,
  Trash2,
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Dribbble,
  Globe,
  Link2,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { useResumeStore, usePersonalInfo } from '@/lib/store';
import { FormInput } from './FormInput';
import { LINK_ICONS, LinkIconType, detectLinkIcon } from '@/lib/schema';
import { cn } from '@/lib/utils';

// Icon component mapping
const IconComponents: Record<LinkIconType, React.FC<{ className?: string }>> = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  dribbble: Dribbble,
  behance: Layers,
  medium: MessageSquare,
  stackoverflow: Layers,
  portfolio: Globe,
  website: Link2,
};

export const getLinkIcon = (iconType: LinkIconType | string | undefined) => {
  const IconComponent = IconComponents[iconType as LinkIconType] || Link2;
  return IconComponent;
};

export const PersonalInfoForm: React.FC = () => {
  const personalInfo = usePersonalInfo();
  const { updatePersonalInfo, addLink, updateLink, removeLink } = useResumeStore();

  // Auto-detect icon when URL changes
  const handleUrlChange = (linkId: string, url: string) => {
    const detectedIcon = detectLinkIcon(url);
    updateLink(linkId, { url, icon: detectedIcon });
  };

  return (
    <div className="glass rounded-xl shadow-sm bento-card p-6">
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        Personal Information
      </h2>
      
      <div className="space-y-4">
        <FormInput
          label="Full Name"
          placeholder="Your Full Name"
          value={personalInfo.fullName}
          onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            value={personalInfo.email}
            onChange={(e) => updatePersonalInfo({ email: e.target.value })}
          />
          <FormInput
            label="Phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={personalInfo.phone}
            onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
          />
        </div>

        <FormInput
          label="Location"
          placeholder="City, Country"
          value={personalInfo.location}
          onChange={(e) => updatePersonalInfo({ location: e.target.value })}
        />

        {/* Links Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">
              Links
            </label>
            <button
              onClick={() => addLink({ label: '', url: '', icon: 'website' })}
              className={cn(
                'text-xs text-primary hover:text-primary/80',
                'flex items-center gap-1 transition-colors'
              )}
            >
              <Plus className="w-3 h-3" />
              Add Link
            </button>
          </div>

          {personalInfo.links.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">
              No links added. Add LinkedIn, GitHub, portfolio, etc.
            </p>
          )}

          {personalInfo.links.map((link) => {
            const IconComponent = getLinkIcon(link.icon);
            return (
              <div key={link.id} className="space-y-2 p-3 border border-border/50 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  {/* Icon Selector */}
                  <div className="relative">
                    <select
                      value={link.icon || 'website'}
                      onChange={(e) => updateLink(link.id, { icon: e.target.value })}
                      className={cn(
                        'appearance-none w-10 h-10 pl-3 pr-1 rounded-lg',
                        'border border-border bg-background',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20',
                        'cursor-pointer'
                      )}
                      title="Select icon"
                    >
                      {Object.entries(LINK_ICONS).map(([key, { label }]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <IconComponent className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* URL Input */}
                  <FormInput
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={link.url}
                    onChange={(e) => handleUrlChange(link.id, e.target.value)}
                    className="flex-1"
                  />

                  {/* Delete Button */}
                  <button
                    onClick={() => removeLink(link.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Optional Label */}
                <FormInput
                  placeholder="Display label (optional, e.g., 'My Portfolio')"
                  value={link.label}
                  onChange={(e) => updateLink(link.id, { label: e.target.value })}
                  className="text-sm"
                />

                {/* Show detected platform */}
                {link.url && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <IconComponent className="w-3 h-3" />
                    Detected: {LINK_ICONS[link.icon as LinkIconType]?.label || 'Website'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
