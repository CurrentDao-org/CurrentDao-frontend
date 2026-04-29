'use client';

import { useState, useEffect } from 'react';
import { RichTextEditor } from './RichTextEditor';
import {
  FileText,
  Upload,
  Calendar,
  Tag,
  User,
  ChevronRight,
  ChevronLeft,
  Save,
  Eye,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Info
} from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';
import { Proposal, ProposalTemplate } from '@/types/proposals';
import { ProposalHelpers } from '@/utils/proposalHelpers';
import { cn } from '@/lib/utils';

interface ProposalCreationProps {
  className?: string;
  initialTemplate?: ProposalTemplate;
  onSave?: (proposal: Proposal) => void;
  onCancel?: () => void;
}

type CreationStep = 'template' | 'basic' | 'content' | 'review' | 'success';

export function ProposalCreation({ 
  className, 
  initialTemplate, 
  onSave, 
  onCancel 
}: ProposalCreationProps) {
  const { createProposal, getTemplates, applyTemplate } = useProposals();
  const [currentStep, setCurrentStep] = useState<CreationStep>('template');
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'governance' as Proposal['category'],
    tags: [] as string[],
    author: {
      id: '0x123...',
      name: 'Current User',
      address: '0x1234567890123456789012345678901234567890',
      reputation: 95
    },
    attachments: [] as any[],
    budget: {
      requested: 0,
      currency: 'USD'
    }
  });

  // Template variables
  const [templateVariables, setTemplateVariables] = useState<Record<string, any>>({});
  const [newTag, setNewTag] = useState('');

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templatesData = await getTemplates();
        setTemplates(templatesData);
      } catch (err) {
        console.error('Failed to load templates:', err);
      }
    };

    loadTemplates();
  }, [getTemplates]);

  // Handle template selection
  const handleTemplateSelect = async (template: ProposalTemplate) => {
    setSelectedTemplate(template);
    
    // Initialize template variables with default values
    const variables: Record<string, any> = {};
    Object.entries(template.variables).forEach(([key, config]) => {
      if (config.type === 'number') {
        variables[key] = 0;
      } else if (config.type === 'date') {
        variables[key] = new Date().toISOString().split('T')[0];
      } else if (config.type === 'select') {
        variables[key] = '';
      } else {
        variables[key] = '';
      }
    });
    
    setTemplateVariables(variables);
    setCurrentStep('basic');
  };

  // Apply template
  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const proposal = await applyTemplate(selectedTemplate.id, templateVariables);
      setFormData(prev => ({
        ...prev,
        title: proposal.title,
        description: proposal.description,
        content: proposal.content,
        category: proposal.category,
        tags: proposal.tags
      }));
      setCurrentStep('content');
    } catch (err) {
      setError('Failed to apply template');
    }
  };

  // Form validation
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 'basic':
        return formData.title.trim().length >= 5 && 
               formData.description.trim().length >= 20 &&
               formData.category;
      case 'content':
        return formData.content.trim().length >= 50;
      default:
        return true;
    }
  };

  // Navigation
  const nextStep = () => {
    if (!validateCurrentStep()) {
      setError('Please complete all required fields');
      return;
    }

    setError(null);
    
    switch (currentStep) {
      case 'template':
        setCurrentStep('basic');
        break;
      case 'basic':
        setCurrentStep('content');
        break;
      case 'content':
        setCurrentStep('review');
        break;
      case 'review':
        handleSave();
        break;
    }
  };

  const prevStep = () => {
    setError(null);
    
    switch (currentStep) {
      case 'basic':
        setCurrentStep('template');
        break;
      case 'content':
        setCurrentStep('basic');
        break;
      case 'review':
        setCurrentStep('content');
        break;
    }
  };

  // Save proposal
  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const validation = ProposalHelpers.validateProposal(formData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return;
      }

      const proposal = await createProposal(formData);
      setCurrentStep('success');
      onSave?.(proposal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // File upload
  const handleFileUpload = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const validation = ProposalHelpers.validateAttachment(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      return await ProposalHelpers.uploadAttachment(file);
    });

    try {
      const attachments = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...attachments]
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    }
  };

  // Remove attachment
  const removeAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  // Step components
  const TemplateStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose a Template</h2>
        <p className="text-muted-foreground">
          Start with a template to speed up your proposal creation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="p-6 border rounded-lg text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.description}
                </p>
                <div className="flex gap-2 mt-2">
                  {template.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-muted rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => setCurrentStep('basic')}
        className="w-full py-3 border rounded-lg hover:bg-accent transition-colors"
      >
        Start from Scratch
      </button>
    </div>
  );

  const BasicStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
        <p className="text-muted-foreground">
          Provide the basic details for your proposal
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            placeholder="Enter proposal title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
          {formData.title && (
            <p className="text-sm text-muted-foreground mt-1">
              {formData.title.length}/100 characters
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            className="w-full p-3 border rounded-lg min-h-[100px]"
            placeholder="Enter proposal description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
          {formData.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {formData.description.length}/500 characters
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <select
            className="w-full p-3 border rounded-lg"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Proposal['category'] }))}
          >
            <option value="governance">Governance</option>
            <option value="technical">Technical</option>
            <option value="financial">Financial</option>
            <option value="community">Community</option>
            <option value="marketing">Marketing</option>
            <option value="security">Security</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="flex-1 p-3 border rounded-lg"
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button
              onClick={addTag}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-primary/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Budget Request</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="flex-1 p-3 border rounded-lg"
              placeholder="Amount"
              value={formData.budget.requested || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                budget: { ...prev.budget, requested: parseFloat(e.target.value) || 0 }
              }))}
            />
            <select
              className="p-3 border rounded-lg"
              value={formData.budget.currency}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                budget: { ...prev.budget, currency: e.target.value }
              }))}
            >
              <option value="USD">USD</option>
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const ContentStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Proposal Content</h2>
        <p className="text-muted-foreground">
          Write the detailed content of your proposal
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Content *</label>
              <RichTextEditor
          value={formData.content}
          onChange={(content) => setFormData(prev => ({ ...prev, content }))}
          placeholder="Enter detailed proposal content..."
          maxLength={5000}
          height="400px"
          previewMode="tab"
          autoSaveKey="dao-proposal-content"
          onFileUpload={(files) => handleFileUpload(files)}
        />
        {formData.content && (
          <p className="text-sm text-muted-foreground mt-1">
            {formData.content.length}/5000 characters
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Attachments</label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            className="hidden"
            id="file-upload"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload files or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOC, TXT, images up to 10MB
            </p>
          </label>
        </div>

        {formData.attachments.length > 0 && (
          <div className="space-y-2 mt-4">
            {formData.attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{attachment.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(attachment.size / 1024).toFixed(1)}KB
                  </span>
                </div>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Proposal</h2>
        <p className="text-muted-foreground">
          Review your proposal before submitting
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">{formData.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{formData.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium ml-2">{formData.category}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-medium ml-2">
                {formData.budget.requested} {formData.budget.currency}
              </span>
            </div>
          </div>

          {formData.tags.length > 0 && (
            <div className="mt-4">
              <span className="text-muted-foreground">Tags:</span>
              <div className="flex gap-2 mt-1">
                {formData.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-muted rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {formData.attachments.length > 0 && (
            <div className="mt-4">
              <span className="text-muted-foreground">Attachments:</span>
              <div className="space-y-1 mt-1">
                {formData.attachments.map((attachment) => (
                  <div key={attachment.id} className="text-sm">
                    <FileText className="w-3 h-3 inline mr-1" />
                    {attachment.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Content Preview</h4>
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br>') }} />
          </div>
        </div>
      </div>
    </div>
  );

  const SuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">Proposal Created Successfully!</h2>
        <p className="text-muted-foreground">
          Your proposal has been submitted and is now in the discussion phase.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg text-left">
          <h3 className="font-semibold mb-2">Next Steps:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">1</span>
              <span>Community discussion period (5 days)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">2</span>
              <span>Voting period (7 days)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">3</span>
              <span>Execution if approved</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => window.location.href = '/proposals'}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          View All Proposals
        </button>
      </div>
    </div>
  );

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'template':
        return <TemplateStep />;
      case 'basic':
        return <BasicStep />;
      case 'content':
        return <ContentStep />;
      case 'review':
        return <ReviewStep />;
      case 'success':
        return <SuccessStep />;
      default:
        return <TemplateStep />;
    }
  };

  // Progress indicator
  const steps = [
    { id: 'template', name: 'Template', icon: FileText },
    { id: 'basic', name: 'Basic Info', icon: User },
    { id: 'content', name: 'Content', icon: FileText },
    { id: 'review', name: 'Review', icon: Eye }
  ];

  const getStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  return (
    <div className={cn("bg-card rounded-lg border p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Proposal</h1>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress */}
      {currentStep !== 'success' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  index <= getStepIndex() 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <step.icon className="w-4 h-4" />
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-1 mx-2",
                    index < getStepIndex() ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            {steps.map((step, index) => (
              <span key={step.id} className={cn(
                index <= getStepIndex() ? "text-primary font-medium" : ""
              )}>
                {step.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      {currentStep !== 'success' && (
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 'template'}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {currentStep === 'template' && (
              <button
                onClick={() => setCurrentStep('basic')}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent"
              >
                Skip Template
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={nextStep}
              disabled={loading || !validateCurrentStep()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : currentStep === 'review' ? (
                <>
                  <Save className="w-4 h-4" />
                  Submit Proposal
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProposalCreation;
