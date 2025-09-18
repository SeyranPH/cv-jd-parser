import { Module } from '@nestjs/common';
import { CvParserController } from './cv-parser.controller';
import { CvParserService } from './cv-parser.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [CvParserController],
  providers: [CvParserService],
  exports: [CvParserService],
})
export class CvParserModule {}
