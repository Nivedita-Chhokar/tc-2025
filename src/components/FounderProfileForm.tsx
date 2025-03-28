// src/components/FounderProfileForm.tsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Save } from 'lucide-react';
import { FounderProfile, FounderProfileInput, Skill, Industry, WorkStyle, StartupStage } from '../types/cofounder';
import { cofounderService } from '../services/cofounderService';

interface FounderProfileFormProps {
  initialData?: FounderProfile;
  onSubmit: (data: FounderProfileInput) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

const FounderProfileForm: React.FC<FounderProfileFormProps> = ({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  error 
}) => {
  const [formData, setFormData] = useState<FounderProfileInput>({
    skills: [],
    industries: [],
    startup_stage: 'idea',
    work_style: [],
    goals: '',
    experience: '',
    seeking: ''
  });

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [availableIndustries, setAvailableIndustries] = useState<Industry[]>([]);
  const [availableWorkStyles, setAvailableWorkStyles] = useState<WorkStyle[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [skills, industries, workStyles] = await Promise.all([
          cofounderService.getSkills(),
          cofounderService.getIndustries(),
          cofounderService.getWorkStyles()
        ]);
        
        setAvailableSkills(skills);
        setAvailableIndustries(industries);
        setAvailableWorkStyles(workStyles);
      } catch (err) {
        console.error('Error loading form options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        skills: initialData.skills.map(skill => skill.id),
        industries: initialData.industries.map(industry => industry.id),
        startup_stage: initialData.startup_stage,
        work_style: initialData.work_style.map(style => style.id),
        goals: initialData.goals,
        experience: initialData.experience,
        seeking: initialData.seeking
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name } = e.target;
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    
    setFormData(prev => ({
      ...prev,
      [name]: options
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loadingOptions) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-md flex items-start border-l-4 border-red-500">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="skills" className="block text-sm font-medium text-gray-300">
          Skills & Expertise *
        </label>
        <select
          id="skills"
          name="skills"
          multiple
          value={formData.skills}
          onChange={handleMultiSelectChange}
          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
          required
          disabled={isSubmitting}
          size={5}
        >
          {availableSkills.map(skill => (
            <option key={skill.id} value={skill.id}>
              {skill.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Hold Ctrl/Cmd to select multiple skills
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="industries" className="block text-sm font-medium text-gray-300">
          Industries *
        </label>
        <select
          id="industries"
          name="industries"
          multiple
          value={formData.industries}
          onChange={handleMultiSelectChange}
          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
          required
          disabled={isSubmitting}
          size={5}
        >
          {availableIndustries.map(industry => (
            <option key={industry.id} value={industry.id}>
              {industry.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Hold Ctrl/Cmd to select multiple industries
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="startup_stage" className="block text-sm font-medium text-gray-300">
          Startup Stage *
        </label>
        <select
          id="startup_stage"
          name="startup_stage"
          value={formData.startup_stage}
          onChange={handleChange}
          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
          required
          disabled={isSubmitting}
        >
          <option value={StartupStage.IDEA}>Idea Stage</option>
          <option value={StartupStage.PROTOTYPE}>Prototype Stage</option>
          <option value={StartupStage.MVP}>Minimum Viable Product (MVP)</option>
          <option value={StartupStage.GROWTH}>Growth Stage</option>
          <option value={StartupStage.SCALING}>Scaling Stage</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="work_style" className="block text-sm font-medium text-gray-300">
          Work Style *
        </label>
        <select
          id="work_style"
          name="work_style"
          multiple
          value={formData.work_style}
          onChange={handleMultiSelectChange}
          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
          required
          disabled={isSubmitting}
          size={4}
        >
          {availableWorkStyles.map(style => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Hold Ctrl/Cmd to select multiple work styles
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="goals" className="block text-sm font-medium text-gray-300">
          Your Goals *
        </label>
        <textarea
          id="goals"
          name="goals"
          value={formData.goals}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
          placeholder="What are your startup goals and vision?"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="experience" className="block text-sm font-medium text-gray-300">
          Your Experience *
        </label>
        <textarea
          id="experience"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
          placeholder="Describe your relevant experience and background"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="seeking" className="block text-sm font-medium text-gray-300">
          What You're Seeking *
        </label>
        <textarea
          id="seeking"
          name="seeking"
          value={formData.seeking}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
          placeholder="What are you looking for in a co-founder? What skills or qualities would complement yours?"
          required
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        className="w-full md:w-auto bg-gradient-to-r from-primary to-yellow-500 text-secondary px-6 py-3 rounded-md font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center transform hover:-translate-y-1"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 
          <>
            <Save className="mr-2 h-5 w-5" />
            Save Profile
          </>
        }
      </button>
    </form>
  );
};

export default FounderProfileForm;