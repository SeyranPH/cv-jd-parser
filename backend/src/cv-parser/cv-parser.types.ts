export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications?: string[];
  languages?: string[];
  projects?: Project[];
  rawText: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  location?: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  location?: string;
}

export interface Project {
  name: string;
  description?: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
}

export interface ParsedSection {
  type: 'experience' | 'education' | 'skills' | 'summary' | 'projects' | 'certifications' | 'languages' | 'other';
  content: string;
  lines: string[];
}

export interface ParsedLine {
  text: string;
  isHeading: boolean;
  isContact: boolean;
  isDate: boolean;
  isLocation: boolean;
  isEmail: boolean;
  isPhone: boolean;
  isUrl: boolean;
}
