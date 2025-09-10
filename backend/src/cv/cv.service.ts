import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

@Injectable()
export class CvService {
  async extractText(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const buffer = fs.readFileSync(file.path);

    switch (true) {
      case file.mimetype==='application/pdf': {
        const data = await pdfParse(buffer);
        return data.text;
      }

      case file.mimetype==='application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.originalname.endsWith('.docx'): {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }

      default: {
        throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
      }
    }
  }
}
