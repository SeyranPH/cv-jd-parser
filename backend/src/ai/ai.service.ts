import { Injectable, Logger } from '@nestjs/common';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private model;

  constructor() {
    this.logger.log('Initializing AI service');
    const client = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    this.model = client.chat('gpt-4o-mini');
    this.logger.log('AI service initialized successfully');
  }


  async parseJobDescription(jobDescriptionText: string): Promise<any> {
    this.logger.log(`Starting JD parse, text length: ${jobDescriptionText.length}`);
    
    try {
      const { text } = await generateText({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert HR analyst. Extract structured data from job descriptions and return it as valid JSON.

Return a JSON object with the following structure:
{
  "title": "Job title",
  "company": "Company name",
  "location": "Job location",
  "remoteWork": "remote|hybrid|onsite",
  "employmentType": "full-time|part-time|contract|internship",
  "experienceLevel": "entry|mid|senior|executive|other-value",
  "skills": ["array", "of", "required", "skills"],
  "responsibilities": ["array", "of", "key", "responsibilities"],
  "requirements": ["array", "of", "requirements"],
  "benefits": ["array", "of", "benefits"],
  "description": "Full job description text",
  "industry": "Industry sector",
  "department": "Department or team"
}

If any field cannot be determined from the text, use null for single values or empty array for arrays.`,
          },
          {
            role: 'user',
            content: `Please parse this job description:\n\n${jobDescriptionText}`,
          },
        ],
      });

      this.logger.log(`AI response received, length: ${text.length}`);
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      this.logger.log(`Cleaned response length: ${cleanedText.length}`);
      const parsed = JSON.parse(cleanedText);
      this.logger.log('Successfully parsed AI response as JSON');
      return parsed;
    } catch (error) {
      this.logger.error(`AI service error: ${error.message}`, error.stack);
      throw new Error(`Failed to parse job description: ${error.message}`);
    }
  }
}