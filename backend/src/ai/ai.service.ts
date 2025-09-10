import { Injectable } from '@nestjs/common';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

@Injectable()
export class AiService {
  private model;

  constructor() {
    const client = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    this.model = client.chat('gpt-4o-mini');
  }

  async improveCv(cvText: string): Promise<string> {
    const { text } = await generateText({
      model: this.model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert career coach. Improve the wording of CVs to highlight achievements and clarity.',
        },
        {
          role: 'user',
          content: `Here is the extracted CV text:\n\n${cvText}\n\nPlease rewrite or enhance it.`,
        },
      ],
    });

    return text;
  }
}