import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvService } from './cv.service';
import { AiService } from '../ai/ai.service';

@Controller('cv')
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly aiService: AiService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('cv'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const text = await this.cvService.extractText(file);
    return { filename: file.originalname, textPreview: text.slice(0, 300) };
  }

  @Post('enhance')
  @UseInterceptors(FileInterceptor('cv'))
  async enhanceCv(@UploadedFile() file: Express.Multer.File) {
    const text = await this.cvService.extractText(file);
    const improved = await this.aiService.improveCv(text);
    return { filename: file.originalname, improvedCv: improved };
  }
}