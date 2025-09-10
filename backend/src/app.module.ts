import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CvModule } from './cv/cv.module';
import { AiModule } from './ai/ai.module';
import { CvParserModule } from './cv-parser/cv-parser.module';

@Module({
  imports: [CvModule, AiModule, CvParserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
