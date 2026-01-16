'use client';

import React, { useState } from 'react';
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
  ChevronDown,
  ChevronUp,
  Settings2,
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
  const [isOpen, setIsOpen] = useState(true);

  // Auto-detect icon when URL changes
  const handleUrlChange = (linkId: string, url: string) => {
    const detectedIcon = detectLinkIcon(url);
    updateLink(linkId, { url, icon: detectedIcon });
  };

  return (
    <div className="glass rounded-none bento-card overflow-hidden">
      {/* Header */}
      <div
        className="bg-muted px-4 py-3 border-b border-border flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Personal Information</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Name and Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              placeholder="Your Full Name"
              value={personalInfo.fullName}
              onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
              autoComplete="name"
            />
            <FormInput
              label="Job Title / Headline"
              placeholder="e.g. Senior Software Engineer"
              value={personalInfo.summary || ''}
              onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
              autoComplete="organization-title"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              value={personalInfo.email}
              onChange={(e) => updatePersonalInfo({ email: e.target.value })}
              autoComplete="email"
            />
            <FormInput
              label="Phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={personalInfo.phone}
              onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
              autoComplete="tel"
            />
          </div>

          {/* Location and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Location"
              placeholder="City, Country"
              value={personalInfo.location}
              onChange={(e) => updatePersonalInfo({ location: e.target.value })}
              autoComplete="address-level2"
            />
            <FormInput
              label="Website"
              type="url"
              placeholder="yourportfolio.com"
              value={personalInfo.website || ''}
              onChange={(e) => updatePersonalInfo({ website: e.target.value })}
              autoComplete="url"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <FormInput
                placeholder="linkedin.com/in/username"
                value={personalInfo.linkedin || ''}
                onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-foreground flex-shrink-0" />
              <FormInput
                placeholder="github.com/username"
                value={personalInfo.github || ''}
                onChange={(e) => updatePersonalInfo({ github: e.target.value })}
              />
            </div>
          </div>

          {/* Custom Links Section */}
          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Additional Links
              </label>
              <button
                onClick={() => addLink({ label: '', url: '', icon: 'website' })}
                className={cn(
                  'text-xs text-primary hover:text-primary/80',
                  'flex items-center gap-1 transition-colors'
                )}
                aria-label="Add a new link"
              >
                <Plus className="w-3 h-3" />
                Add Link
              </button>
            </div>

            {personalInfo.links.length === 0 && (
              <p className="text-xs text-muted-foreground py-2">
                No additional links. Add Medium, Dribbble, Behance, etc.
              </p>
            )}

            {personalInfo.links.map((link) => {
              const IconComponent = getLinkIcon(link.icon);
              return (
                <div key={link.id} className="space-y-2 p-3 border border-border rounded-none bg-muted">
                  <div className="flex items-center gap-2">
                    {/* Icon Selector */}
                    <div className="relative flex-shrink-0">
                      <select
                        value={link.icon || 'website'}
                        onChange={(e) => updateLink(link.id, { icon: e.target.value })}
                        className={cn(
                          'appearance-none w-10 h-10 rounded-none',
                          'border border-border bg-background',
                          'focus:outline-none focus:ring-2 focus:ring-primary/20',
                          'cursor-pointer text-transparent'
                        )}
                        title="Select icon"
                        aria-label="Select link icon type"
                      >
                        {Object.entries(LINK_ICONS).map(([key, { label }]) => (
                          <option key={key} value={key} className="text-foreground bg-background">
                            {label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                        <IconComponent className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>

                    {/* URL Input */}
                    <FormInput
                      placeholder="https://example.com/profile"
                      value={link.url}
                      onChange={(e) => handleUrlChange(link.id, e.target.value)}
                      className="flex-1"
                      type="url"
                      autoComplete="url"
                    />

                    {/* Delete Button */}
                    <button
                      onClick={() => removeLink(link.id)}
                      className="p-2 hover:bg-destructive/10 rounded-none transition-colors text-destructive"
                      aria-label="Remove this link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Optional Label */}
                  <FormInput
                    placeholder="Display label (optional)"
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
      )}
    </div>
  );
};

export default PersonalInfoForm;
