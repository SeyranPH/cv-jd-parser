import { Module } from '@nestjs/common';
import { CvParserController } from './cv-parser.controller';
import { CvParserService } from './cv-parser.service';

@Module({
  controllers: [CvParserController],
  providers: [CvParserService],
  exports: [CvParserService],
})
export class CvParserModule {}
