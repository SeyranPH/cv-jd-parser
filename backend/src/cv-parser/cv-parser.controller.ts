import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvParserService } from './cv-parser.service';
import { ParsedResume } from './cv-parser.types';

@Controller('cv-parser')
export class CvParserController {
  constructor(private readonly cvParserService: CvParserService) {}

  @Post('parse')
  @UseInterceptors(FileInterceptor('file'))
  async parseResume(@UploadedFile() file: Express.Multer.File): Promise<ParsedResume> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type. Please upload a PDF or DOCX file. Received: ${file.mimetype}`
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB.');
    }

    try {
      const parsedResume = await this.cvParserService.parseResume(file);
      return parsedResume;
    } catch (error) {
      throw new BadRequestException(`Failed to parse resume: ${error.message}`);
    }
  }

  @Post('parse-text')
  async parseResumeFromText(@Body('text') text: string): Promise<ParsedResume> {
    if (!text || text.trim().length === 0) {
      throw new BadRequestException('No text provided');
    }

    try {
      // Create a mock file object for text parsing
      const mockFile: Express.Multer.File = {
        fieldname: 'text',
        originalname: 'resume.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: text.length,
        buffer: Buffer.from(text),
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      };

      const parsedResume = await this.cvParserService.parseResume(mockFile);
      return parsedResume;
    } catch (error) {
      throw new BadRequestException(`Failed to parse resume text: ${error.message}`);
    }
  }
}
