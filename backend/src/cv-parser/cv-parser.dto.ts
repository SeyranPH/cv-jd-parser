import { ApiProperty } from '@nestjs/swagger';
import { WorkExperience, Education, Project, ParsedResume } from '../ai/ai.schemas';

export class WorkExperienceDto implements WorkExperience {
  @ApiProperty({ description: 'Company name' })
  company: string;

  @ApiProperty({ description: 'Job position/title' })
  position: string;

  @ApiProperty({ description: 'Start date', nullable: true })
  startDate: string | null;

  @ApiProperty({ description: 'End date', nullable: true })
  endDate: string | null;

  @ApiProperty({ description: 'Whether currently employed' })
  current: boolean;

  @ApiProperty({ description: 'Job description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Job location', nullable: true })
  location: string | null;
}

export class EducationDto implements Education {
  @ApiProperty({ description: 'Institution name' })
  institution: string;

  @ApiProperty({ description: 'Degree obtained' })
  degree: string;

  @ApiProperty({ description: 'Field of study', nullable: true })
  fieldOfStudy: string | null;

  @ApiProperty({ description: 'Start date', nullable: true })
  startDate: string | null;

  @ApiProperty({ description: 'End date', nullable: true })
  endDate: string | null;

  @ApiProperty({ description: 'GPA', nullable: true })
  gpa: string | null;

  @ApiProperty({ description: 'Location', nullable: true })
  location: string | null;
}

export class ProjectDto implements Project {
  @ApiProperty({ description: 'Project name' })
  name: string;

  @ApiProperty({ description: 'Project description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Technologies used', type: [String] })
  technologies: string[];

  @ApiProperty({ description: 'Start date', nullable: true })
  startDate: string | null;

  @ApiProperty({ description: 'End date', nullable: true })
  endDate: string | null;

  @ApiProperty({ description: 'Project URL', nullable: true })
  url: string | null;
}

export class ParsedResumeDataDto implements ParsedResume {
  @ApiProperty({ description: 'Full name', nullable: true })
  name: string | null;

  @ApiProperty({ description: 'Email address', nullable: true })
  email: string | null;

  @ApiProperty({ description: 'Phone number', nullable: true })
  phone: string | null;

  @ApiProperty({ description: 'Location', nullable: true })
  location: string | null;

  @ApiProperty({ description: 'Professional summary', nullable: true })
  summary: string | null;

  @ApiProperty({ description: 'Work experience', type: [WorkExperienceDto] })
  experience: WorkExperienceDto[];

  @ApiProperty({ description: 'Education history', type: [EducationDto] })
  education: EducationDto[];

  @ApiProperty({ description: 'Skills list', type: [String] })
  skills: string[];

  @ApiProperty({ description: 'Certifications', nullable: true, type: [String] })
  certifications: string[] | null;

  @ApiProperty({ description: 'Languages', nullable: true, type: [String] })
  languages: string[] | null;

  @ApiProperty({ description: 'Projects', nullable: true, type: [ProjectDto] })
  projects: ProjectDto[] | null;

  @ApiProperty({ description: 'Raw extracted text' })
  rawText: string;
}

export class ParsedResumeResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Original filename' })
  filename: string;

  @ApiProperty({ description: 'Parsed resume data', type: ParsedResumeDataDto })
  data: ParsedResumeDataDto;
}
