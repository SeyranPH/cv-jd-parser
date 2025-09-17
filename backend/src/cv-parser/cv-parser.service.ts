import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import * as fs from 'fs';
import * as crypto from 'crypto';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { ParsedResume, ParsedSection, ParsedLine, WorkExperience, Education, Project } from './cv-parser.types';

@Injectable()
export class CvParserService {
  private readonly logger = new Logger(CvParserService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
  ) {}

  private readonly sectionKeywords = {
    experience: ['experience', 'work history', 'employment', 'career', 'professional experience', 'work experience'],
    education: ['education', 'academic', 'qualifications', 'degrees', 'university', 'college'],
    skills: ['skills', 'technical skills', 'competencies', 'expertise', 'technologies'],
    summary: ['summary', 'profile', 'objective', 'about', 'overview', 'personal statement'],
    projects: ['projects', 'portfolio', 'key projects', 'selected projects'],
    certifications: ['certifications', 'certificates', 'licenses', 'credentials'],
    languages: ['languages', 'language skills', 'linguistic skills']
  };

  async parseResume(file: Express.Multer.File): Promise<ParsedResume> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Create hash from file content for caching
    const buffer = file.buffer || fs.readFileSync(file.path);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const cacheKey = this.getCachedCVKey(hash);

    this.logger.log(`Checking cache for CV key: ${cacheKey}`);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.log('Cache hit - returning cached CV data');
      return JSON.parse(cached);
    }

    this.logger.log('Cache miss - parsing CV file');
    const rawText = await this.extractText(file);
    const lines = this.parseLines(rawText);
    const sections = this.groupIntoSections(lines);
    const parsedResume = this.extractStructuredData(sections, rawText);

    this.logger.log('CV parsing completed, caching result');
    // Cache for 30 days (30*86400 seconds)
    await this.redis.setex(cacheKey, 30*86400, JSON.stringify(parsedResume));
    
    return parsedResume;
  }

  private async extractText(file: Express.Multer.File): Promise<string> {
    const buffer = file.buffer || fs.readFileSync(file.path);

    switch (true) {
      case file.mimetype === 'application/pdf':
        const pdfData = await pdfParse(buffer);
        return pdfData.text;

      case file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
           file.originalname.endsWith('.docx'):
        const docxResult = await mammoth.extractRawText({ buffer });
        return docxResult.value;

      default:
        throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }
  }

  private parseLines(text: string): ParsedLine[] {
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => ({
        text: line,
        isHeading: this.isHeading(line),
        isContact: this.isContactInfo(line),
        isDate: this.isDate(line),
        isLocation: this.isLocation(line),
        isEmail: this.isEmail(line),
        isPhone: this.isPhone(line),
        isUrl: this.isUrl(line)
      }));
  }

  private groupIntoSections(lines: ParsedLine[]): ParsedSection[] {
    const sections: ParsedSection[] = [];
    let currentSection: ParsedSection | null = null;

    for (const line of lines) {
      const sectionType = this.identifySectionType(line.text);
      
      if (sectionType && sectionType !== 'other') {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          type: sectionType,
          content: line.text,
          lines: [line.text]
        };
      } else if (currentSection) {
        currentSection.lines.push(line.text);
        currentSection.content += '\n' + line.text;
      } else {
        // Create a general section for content before any identified sections
        if (sections.length === 0 || sections[sections.length - 1].type !== 'other') {
          sections.push({
            type: 'other',
            content: line.text,
            lines: [line.text]
          });
        } else {
          sections[sections.length - 1].lines.push(line.text);
          sections[sections.length - 1].content += '\n' + line.text;
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  private extractStructuredData(sections: ParsedSection[], rawText: string): ParsedResume {
    const resume: ParsedResume = {
      experience: [],
      education: [],
      skills: [],
      rawText
    };

    // Extract contact information from the beginning of the document
    const contactInfo = this.extractContactInfo(rawText);
    resume.name = contactInfo.name;
    resume.email = contactInfo.email;
    resume.phone = contactInfo.phone;
    resume.location = contactInfo.location;

    // Process each section
    for (const section of sections) {
      switch (section.type) {
        case 'experience':
          resume.experience.push(...this.parseExperienceSection(section));
          break;
        case 'education':
          resume.education.push(...this.parseEducationSection(section));
          break;
        case 'skills':
          resume.skills.push(...this.parseSkillsSection(section));
          break;
        case 'summary':
          resume.summary = section.content;
          break;
        case 'projects':
          resume.projects = this.parseProjectsSection(section);
          break;
        case 'certifications':
          resume.certifications = this.parseCertificationsSection(section);
          break;
        case 'languages':
          resume.languages = this.parseLanguagesSection(section);
          break;
      }
    }

    return resume;
  }

  private identifySectionType(text: string): 'experience' | 'education' | 'skills' | 'summary' | 'projects' | 'certifications' | 'languages' | 'other' | null {
    const lowerText = text.toLowerCase();
    
    for (const [type, keywords] of Object.entries(this.sectionKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return type as any;
      }
    }
    
    return null;
  }

  private isHeading(line: string): boolean {
    // Check if line is likely a heading (short, all caps, or has specific patterns)
    return line.length < 50 && (
      line === line.toUpperCase() ||
      /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(line) ||
      line.endsWith(':')
    );
  }

  private isContactInfo(line: string): boolean {
    return this.isEmail(line) || this.isPhone(line) || this.isUrl(line);
  }

  private isDate(line: string): boolean {
    // Match various date formats
    const datePatterns = [
      /^\d{4}$/, // Year only
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}$/i, // Month Year
      /^\d{1,2}\/\d{4}$/, // MM/YYYY
      /^\d{4}\s*-\s*\d{4}$/, // YYYY - YYYY
      /^(Present|Current|Now)$/i
    ];
    
    return datePatterns.some(pattern => pattern.test(line.trim()));
  }

  private isLocation(line: string): boolean {
    // Simple location detection (city, state, country patterns)
    const locationPatterns = [
      /^[A-Z][a-z]+,\s*[A-Z]{2}$/, // City, State
      /^[A-Z][a-z]+,\s*[A-Z][a-z]+$/, // City, Country
      /^[A-Z][a-z]+$/, // City only
    ];
    
    return locationPatterns.some(pattern => pattern.test(line.trim()));
  }

  private isEmail(line: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(line.trim());
  }

  private isPhone(line: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanLine = line.replace(/[\s\-\(\)\.]/g, '');
    return phoneRegex.test(cleanLine) && cleanLine.length >= 10;
  }

  private isUrl(line: string): boolean {
    const urlRegex = /^https?:\/\/.+/;
    return urlRegex.test(line.trim());
  }

  private extractContactInfo(text: string): { name?: string; email?: string; phone?: string; location?: string } {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const contactInfo: any = {};

    // Extract name (usually the first line or first non-empty line)
    if (lines.length > 0) {
      contactInfo.name = lines[0];
    }

    // Extract email
    const emailMatch = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    if (emailMatch) {
      contactInfo.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = text.match(/[\+]?[1-9][\d\s\-\(\)\.]{8,}/);
    if (phoneMatch) {
      contactInfo.phone = phoneMatch[0].trim();
    }

    // Extract location (look for city, state patterns)
    const locationMatch = text.match(/[A-Z][a-z]+,\s*[A-Z]{2}/);
    if (locationMatch) {
      contactInfo.location = locationMatch[0];
    }

    return contactInfo;
  }

  private parseExperienceSection(section: ParsedSection): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    const lines = section.lines;
    
    let currentExperience: Partial<WorkExperience> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line looks like a job title/company
      if (this.isJobTitle(line)) {
        if (currentExperience.company && currentExperience.position) {
          experiences.push(currentExperience as WorkExperience);
        }
        currentExperience = { company: line };
      } else if (this.isDate(line) && currentExperience.company) {
        // This might be a date range for the current job
        const dates = this.parseDateRange(line);
        currentExperience.startDate = dates.start;
        currentExperience.endDate = dates.end;
        currentExperience.current = dates.current;
      } else if (currentExperience.company && !currentExperience.position) {
        // This might be the position title
        currentExperience.position = line;
      } else if (currentExperience.company && currentExperience.position) {
        // This might be a description
        if (!currentExperience.description) {
          currentExperience.description = line;
        } else {
          currentExperience.description += ' ' + line;
        }
      }
    }
    
    if (currentExperience.company && currentExperience.position) {
      experiences.push(currentExperience as WorkExperience);
    }
    
    return experiences;
  }

  private parseEducationSection(section: ParsedSection): Education[] {
    const educations: Education[] = [];
    const lines = section.lines;
    
    let currentEducation: Partial<Education> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (this.isInstitutionName(line)) {
        if (currentEducation.institution && currentEducation.degree) {
          educations.push(currentEducation as Education);
        }
        currentEducation = { institution: line };
      } else if (this.isDate(line) && currentEducation.institution) {
        const dates = this.parseDateRange(line);
        currentEducation.startDate = dates.start;
        currentEducation.endDate = dates.end;
      } else if (currentEducation.institution && !currentEducation.degree) {
        currentEducation.degree = line;
      }
    }
    
    if (currentEducation.institution && currentEducation.degree) {
      educations.push(currentEducation as Education);
    }
    
    return educations;
  }

  private parseSkillsSection(section: ParsedSection): string[] {
    const skills: string[] = [];
    const content = section.content.toLowerCase();
    
    // Common skill keywords
    const skillKeywords = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
      'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
      'machine learning', 'ai', 'data science', 'analytics'
    ];
    
    for (const keyword of skillKeywords) {
      if (content.includes(keyword)) {
        skills.push(keyword);
      }
    }
    
    // Also extract skills from bullet points or comma-separated lists
    const lines = section.lines;
    for (const line of lines) {
      if (line.includes(',') || line.includes('•') || line.includes('-')) {
        const items = line.split(/[,•\-]/).map(item => item.trim()).filter(item => item.length > 0);
        skills.push(...items);
      }
    }
    
    return [...new Set(skills)]; // Remove duplicates
  }

  private parseProjectsSection(section: ParsedSection): Project[] {
    const projects: Project[] = [];
    const lines = section.lines;
    
    let currentProject: Partial<Project> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (this.isProjectTitle(line)) {
        if (currentProject.name) {
          projects.push(currentProject as Project);
        }
        currentProject = { name: line };
      } else if (currentProject.name && !currentProject.description) {
        currentProject.description = line;
      } else if (currentProject.name && currentProject.description) {
        currentProject.description += ' ' + line;
      }
    }
    
    if (currentProject.name) {
      projects.push(currentProject as Project);
    }
    
    return projects;
  }

  private parseCertificationsSection(section: ParsedSection): string[] {
    return section.lines.filter(line => line.trim().length > 0);
  }

  private parseLanguagesSection(section: ParsedSection): string[] {
    const content = section.content.toLowerCase();
    const languages: string[] = [];
    
    const commonLanguages = [
      'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'chinese', 'japanese',
      'korean', 'arabic', 'russian', 'hindi', 'dutch', 'swedish', 'norwegian', 'danish'
    ];
    
    for (const language of commonLanguages) {
      if (content.includes(language)) {
        languages.push(language);
      }
    }
    
    return languages;
  }

  private isJobTitle(line: string): boolean {
    // Simple heuristic: lines that are not dates, emails, or very long
    return line.length < 100 && 
           !this.isDate(line) && 
           !this.isEmail(line) && 
           !this.isPhone(line) &&
           !line.includes('@');
  }

  private isInstitutionName(line: string): boolean {
    // Look for university/college patterns
    const institutionKeywords = ['university', 'college', 'institute', 'school', 'academy'];
    return institutionKeywords.some(keyword => line.toLowerCase().includes(keyword));
  }

  private isProjectTitle(line: string): boolean {
    // Simple heuristic for project titles
    return line.length < 100 && 
           !this.isDate(line) && 
           !this.isEmail(line) && 
           !this.isPhone(line);
  }

  private parseDateRange(dateString: string): { start?: string; end?: string; current: boolean } {
    const cleanDate = dateString.trim();
    
    if (cleanDate.toLowerCase().includes('present') || cleanDate.toLowerCase().includes('current')) {
      return { current: true };
    }
    
    // Handle YYYY - YYYY format
    const rangeMatch = cleanDate.match(/(\d{4})\s*-\s*(\d{4})/);
    if (rangeMatch) {
      return { start: rangeMatch[1], end: rangeMatch[2], current: false };
    }
    
    // Handle single year
    const yearMatch = cleanDate.match(/(\d{4})/);
    if (yearMatch) {
      return { start: yearMatch[1], current: true };
    }
    
    return { current: false };
  }

  private getCachedCVKey(hash: string): string {
    return `cv:${hash}`;
  }
}
