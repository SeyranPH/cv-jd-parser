import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { 
  JobDescriptionDataSchema, 
  ParsedResumeSchema,
  JobDescriptionData,
  ParsedResume
} from './ai.schemas';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor() {
    this.logger.log('Initializing AI service');
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
    this.logger.log('AI service initialized successfully');
  }


  async parseJobDescription(jobDescriptionText: string): Promise<JobDescriptionData> {
    this.logger.log(`Starting JD parse, text length: ${jobDescriptionText.length}`);
    
    try {
      const response = await this.openai.responses.parse({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'system',
            content: `You are an expert HR analyst. Extract structured data from job descriptions.

Extract the following information from the job description:
- Job title
- Company name
- Job location
- Remote work type (remote, hybrid, or onsite)
- Employment type (full-time, part-time, contract, or internship)
- Experience level (entry, mid, senior, or executive)
- Required skills
- Key responsibilities
- Job requirements
- Benefits offered
- Industry sector
- Department or team

If any field cannot be determined from the text, use null for single values or empty array for arrays.`,
          },
          {
            role: 'user',
            content: `Please parse this job description:\n\n${jobDescriptionText}`,
          },
        ],
        text: {
          format: zodTextFormat(JobDescriptionDataSchema, 'jobDescription'),
        },
      });

      if (!response.output_parsed) {
        throw new Error('No parsed output received from OpenAI');
      }

      this.logger.log('Successfully parsed and validated AI response');
      return response.output_parsed;
    } catch (error) {
      this.logger.error(`AI service error: ${error.message}`, error.stack);
      throw new Error(`Failed to parse job description: ${error.message}`);
    }
  }

  async parseResume(resumeText: string): Promise<ParsedResume> {
    this.logger.log(`Starting CV parse, text length: ${resumeText.length}`);
    
    try {
      const response = await this.openai.responses.parse({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'system',
            content: `You are an expert HR analyst. Extract structured data from CV/Resume text.

Extract the following information from the CV/Resume:
- Personal information (name, email, phone, location)
- Professional summary or objective
- Work experience (company, position, dates, description, location)
- Education (institution, degree, field of study, dates, GPA, location)
- Skills and technologies
- Certifications
- Languages
- Projects (name, description, technologies, dates, URL)

For dates, use YYYY-MM format when possible. If any field cannot be determined from the text, use null for single values or empty array for arrays.`,
          },
          {
            role: 'user',
            content: `Please parse this CV/Resume:\n\n${resumeText}`,
          },
        ],
        text: {
          format: zodTextFormat(ParsedResumeSchema, 'resume'),
        },
      });

      if (!response.output_parsed) {
        throw new Error('No parsed output received from OpenAI');
      }

      this.logger.log('Successfully parsed and validated AI response');
      return response.output_parsed;
    } catch (error) {
      this.logger.error(`AI service error: ${error.message}`, error.stack);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }
}