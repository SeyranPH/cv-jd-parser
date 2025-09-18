import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JdParserService } from './jd-parser.service';
import { ParseJobDescriptionDto, JobDescriptionResponseDto } from './jd-parser.dto';
import { ErrorResponseDto } from '../common/dto/error.dto';

@ApiTags('jd-parser')
@Controller('jd-parser')
export class JdParserController {
  private readonly logger = new Logger(JdParserController.name);

  constructor(private readonly jdParserService: JdParserService) {}

  @Post('parse')
  @ApiOperation({ summary: 'Parse job description text' })
  @ApiBody({ 
    type: ParseJobDescriptionDto,
    description: 'Job description text to parse',
    examples: {
      example1: {
        summary: 'Sample job description',
        value: {
          text: 'Software Engineer at TechCorp - Remote\n\nWe are looking for a talented Software Engineer to join our team. You will be responsible for developing web applications using React and Node.js.\n\nRequirements:\n- 3+ years of experience with JavaScript\n- Experience with React and Node.js\n- Knowledge of databases (PostgreSQL, MongoDB)\n- Strong problem-solving skills\n\nBenefits:\n- Competitive salary: $80,000 - $120,000\n- Health insurance\n- Remote work flexibility\n- Professional development opportunities'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Job description successfully parsed',
    type: JobDescriptionResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Missing or empty text input',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error - Failed to parse job description',
    type: ErrorResponseDto
  })
  async parseJobDescription(@Body() parseJobDescriptionDto: ParseJobDescriptionDto): Promise<JobDescriptionResponseDto> {
    const requestId = Math.random().toString(36).substring(7);
    this.logger.log(`[${requestId}] Starting JD parse request, text length: ${parseJobDescriptionDto.text?.length || 0}`);

    try {
      if (!parseJobDescriptionDto.text || parseJobDescriptionDto.text.trim().length === 0) {
        this.logger.warn(`[${requestId}] Empty text provided`);
        throw new HttpException('Job description text is required', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`[${requestId}] Calling JD parser service`);
      const parsedData = await this.jdParserService.parse(parseJobDescriptionDto.text);
      this.logger.log(`[${requestId}] JD parse completed successfully`);
      
      return {
        success: true,
        originalText: parseJobDescriptionDto.text,
        data: parsedData,
      };
    } catch (error) {
      this.logger.error(`[${requestId}] JD parse failed: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to parse job description',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
