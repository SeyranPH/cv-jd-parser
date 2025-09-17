import { ApiProperty } from '@nestjs/swagger';

export class WorkExperienceDto {
  @ApiProperty({ description: 'Company name' })
  company: string;

  @ApiProperty({ description: 'Job position/title' })
  position: string;

  @ApiProperty({ description: 'Start date', required: false })
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  endDate?: string;

  @ApiProperty({ description: 'Whether currently employed', required: false })
  current?: boolean;

  @ApiProperty({ description: 'Job description', required: false })
  description?: string;

  @ApiProperty({ description: 'Job location', required: false })
  location?: string;
}

export class EducationDto {
  @ApiProperty({ description: 'Institution name' })
  institution: string;

  @ApiProperty({ description: 'Degree obtained' })
  degree: string;

  @ApiProperty({ description: 'Field of study', required: false })
  fieldOfStudy?: string;

  @ApiProperty({ description: 'Start date', required: false })
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  endDate?: string;

  @ApiProperty({ description: 'GPA', required: false })
  gpa?: string;

  @ApiProperty({ description: 'Location', required: false })
  location?: string;
}

export class ProjectDto {
  @ApiProperty({ description: 'Project name' })
  name: string;

  @ApiProperty({ description: 'Project description', required: false })
  description?: string;

  @ApiProperty({ description: 'Technologies used', required: false, type: [String] })
  technologies?: string[];

  @ApiProperty({ description: 'Start date', required: false })
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  endDate?: string;

  @ApiProperty({ description: 'Project URL', required: false })
  url?: string;
}

export class ParsedResumeResponseDto {
  @ApiProperty({ description: 'Full name', required: false })
  name?: string;

  @ApiProperty({ description: 'Email address', required: false })
  email?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'Location', required: false })
  location?: string;

  @ApiProperty({ description: 'Professional summary', required: false })
  summary?: string;

  @ApiProperty({ description: 'Work experience', type: [WorkExperienceDto] })
  experience: WorkExperienceDto[];

  @ApiProperty({ description: 'Education history', type: [EducationDto] })
  education: EducationDto[];

  @ApiProperty({ description: 'Skills list', type: [String] })
  skills: string[];

  @ApiProperty({ description: 'Certifications', required: false, type: [String] })
  certifications?: string[];

  @ApiProperty({ description: 'Languages', required: false, type: [String] })
  languages?: string[];

  @ApiProperty({ description: 'Projects', required: false, type: [ProjectDto] })
  projects?: ProjectDto[];

  @ApiProperty({ description: 'Raw extracted text' })
  rawText: string;
}
