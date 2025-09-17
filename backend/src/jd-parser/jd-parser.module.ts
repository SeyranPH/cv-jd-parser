import { Module } from '@nestjs/common';
import { JdParserService } from './jd-parser.service';
import { JdParserController } from './jd-parser.controller';
import { AiModule } from 'src/ai/ai.module';

@Module({
  controllers: [JdParserController],
  providers: [JdParserService],
  imports: [AiModule],
  exports: [JdParserService],
})
export class JdParserModule {}
