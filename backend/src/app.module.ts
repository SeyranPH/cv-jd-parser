import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { CvParserModule } from './cv-parser/cv-parser.module';
import { JdParserModule } from './jd-parser/jd-parser.module';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    AiModule,
    CvParserModule,
    JdParserModule,
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL || 'redis://redis:6379',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
