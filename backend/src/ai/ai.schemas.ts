import { z } from 'zod';

// Job Description Schemas
export const JobDescriptionDataSchema = z.object({
  title: z.string().nullable(),
  company: z.string().nullable(),
  location: z.string().nullable(),
  remoteWork: z.enum(['remote', 'hybrid', 'onsite']).nullable(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']).nullable(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).nullable(),
  skills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  requirements: z.array(z.string()),
  benefits: z.array(z.string()),
  description: z.string(),
  industry: z.string().nullable(),
  department: z.string().nullable(),
});

// CV/Resume Schemas
export const WorkExperienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  current: z.boolean(),
  description: z.string().nullable(),
  location: z.string().nullable(),
});

export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  gpa: z.string().nullable(),
  location: z.string().nullable(),
});

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  technologies: z.array(z.string()),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  url: z.string().nullable(),
});

export const ParsedResumeSchema = z.object({
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  summary: z.string().nullable(),
  experience: z.array(WorkExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(z.string()),
  certifications: z.array(z.string()).nullable(),
  languages: z.array(z.string()).nullable(),
  projects: z.array(ProjectSchema).nullable(),
  rawText: z.string(),
});

// Type exports
export type JobDescriptionData = z.infer<typeof JobDescriptionDataSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ParsedResume = z.infer<typeof ParsedResumeSchema>;
