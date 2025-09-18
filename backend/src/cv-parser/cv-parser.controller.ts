import { Controller, Post, UploadedFile, UseInterceptors, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CvParserService } from './cv-parser.service';
import { ParsedResumeResponseDto } from './cv-parser.dto';
import { ErrorResponseDto } from '../common/dto/error.dto';

@ApiTags('cv-parser')
@Controller('cv-parser')
export class CvParserController {
  private readonly logger = new Logger(CvParserController.name);

  constructor(private readonly cvParserService: CvParserService) {}

  @Post('parse')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Parse CV/Resume from uploaded file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a PDF or DOCX file containing a CV/Resume',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF or DOCX file (max 10MB)'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'CV successfully parsed',
    type: ParsedResumeResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid file, unsupported format, or file too large',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 413, 
    description: 'Payload too large - File exceeds 10MB limit',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 415, 
    description: 'Unsupported media type - Only PDF and DOCX files are supported',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error - Failed to parse CV',
    type: ErrorResponseDto
  })
  async parseResume(@UploadedFile() file: Express.Multer.File): Promise<ParsedResumeResponseDto> {
    const requestId = Math.random().toString(36).substring(7);
    this.logger.log(`[${requestId}] Starting CV parse request, filename: ${file?.originalname || 'unknown'}, size: ${file?.size || 0} bytes`);

    if (!file) {
      this.logger.warn(`[${requestId}] No file uploaded`);
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(`[${requestId}] Unsupported file type: ${file.mimetype}`);
      throw new HttpException(
        `Unsupported media type. Please upload a PDF or DOCX file. Received: ${file.mimetype}`,
        HttpStatus.UNSUPPORTED_MEDIA_TYPE
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.logger.warn(`[${requestId}] File too large: ${file.size} bytes`);
      throw new HttpException('File size too large. Maximum size is 10MB.', HttpStatus.PAYLOAD_TOO_LARGE);
    }

    try {
      this.logger.log(`[${requestId}] Calling CV parser service`);
      const parsedResume = await this.cvParserService.parseResume(file);
      this.logger.log(`[${requestId}] CV parse completed successfully`);
      
      return {
        success: true,
        filename: file.originalname,
        data: parsedResume,
      };
    } catch (error) {
      this.logger.error(`[${requestId}] CV parse failed: ${error.message}`, error.stack);
      throw new HttpException(`Failed to parse resume: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
