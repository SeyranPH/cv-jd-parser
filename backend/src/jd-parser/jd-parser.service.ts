import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis  } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { AiService } from '../ai/ai.service';
import { JobDescriptionData } from '../ai/ai.schemas';
import * as crypto from 'crypto';

@Injectable()
export class JdParserService {
  private readonly logger = new Logger(JdParserService.name);

  constructor(
    private readonly ai: AiService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async parse(rawText: string): Promise<JobDescriptionData> {
    const hash = crypto.createHash('sha256').update(rawText.trim()).digest('hex');
    const cacheKey = this.getCachedJDKey(hash);

    this.logger.log(`Checking cache for key: ${cacheKey}`);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.log('Cache hit - returning cached data');
      return JSON.parse(cached);
    }

    this.logger.log('Cache miss - calling AI service');
    const parsed = await this.ai.parseJobDescription(rawText);
    this.logger.log('AI service completed, caching result');
    await this.redis.setex(cacheKey, 30*86400, JSON.stringify(parsed));
    return parsed;
  }

  private getCachedJDKey(hash: string) {
    return `jd:${hash}`;
  }
}
