import { ApiProperty } from '@nestjs/swagger';

export class ParseJobDescriptionDto {
  @ApiProperty({ 
    description: 'Job description text to parse',
    example: 'Software Engineer at TechCorp - Remote\n\nWe are looking for a talented Software Engineer to join our team. You will be responsible for developing web applications using React and Node.js.\n\nRequirements:\n- 3+ years of experience with JavaScript\n- Experience with React and Node.js\n- Knowledge of databases (PostgreSQL, MongoDB)\n- Strong problem-solving skills\n\nBenefits:\n- Competitive salary: $80,000 - $120,000\n- Health insurance\n- Remote work flexibility\n- Professional development opportunities'
  })
  text: string;
}

export class JobDescriptionDataDto {
  @ApiProperty({ description: 'Job title' })
  title: string;

  @ApiProperty({ description: 'Company name' })
  company: string;

  @ApiProperty({ description: 'Job location' })
  location: string;

  @ApiProperty({ description: 'Remote work type (remote|hybrid|onsite)' })
  remoteWork: string;

  @ApiProperty({ description: 'Employment type (full-time|part-time|contract|internship)' })
  employmentType: string;

  @ApiProperty({ description: 'Experience level (entry|mid|senior|executive|other-value)' })
  experienceLevel: string;

  @ApiProperty({ description: 'Required skills', type: [String] })
  skills: string[];

  @ApiProperty({ description: 'Key responsibilities', type: [String] })
  responsibilities: string[];

  @ApiProperty({ description: 'Job requirements', type: [String] })
  requirements: string[];

  @ApiProperty({ description: 'Benefits offered', type: [String] })
  benefits: string[];

  @ApiProperty({ description: 'Full job description text' })
  description: string;

  @ApiProperty({ description: 'Industry sector', required: false })
  industry: string;

  @ApiProperty({ description: 'Department or team', required: false })
  department: string;
}

export class JobDescriptionResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Original input text' })
  originalText: string;

  @ApiProperty({ description: 'Parsed job description data', type: JobDescriptionDataDto })
  data: JobDescriptionDataDto;
}
