import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { AiService } from '../ai/ai.service';
import * as fs from 'fs';
import * as crypto from 'crypto';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { ParsedResume } from '../ai/ai.schemas';

@Injectable()
export class CvParserService {
  private readonly logger = new Logger(CvParserService.name);

  constructor(
    private readonly ai: AiService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

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

    this.logger.log('Cache miss - extracting text and calling AI service');
    const rawText = await this.extractText(file);
    const parsedResume = await this.ai.parseResume(rawText);

    this.logger.log('CV parsing completed, caching result');
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


  private getCachedCVKey(hash: string): string {
    return `cv:${hash}`;
  }
}
