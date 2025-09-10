import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CvModule } from './cv/cv.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [CvModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
