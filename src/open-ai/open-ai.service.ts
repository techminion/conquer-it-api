import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { constants } from 'src/config/constants';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: constants.openAI.apiKey });
  }

  async generateTasks(goal: string, duration: string) {
    try {
      const prompt = `You are an expert productivity coach. Based on the goal and duration, generate a structured list of tasks with due dates.
      
      Goal: "${goal}"
      Duration: "${duration}"
      
      Provide a JSON response with the format:
      [
        { "name": "Task 1", "description": "Description 1", "dueDate": "YYYY-MM-DD" },
        { "name": "Task 2", "description": "Description 2", "dueDate": "YYYY-MM-DD" }
      ]`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      this.logger.log(response.choices[0].message.content as string);
      return JSON.parse(response.choices[0].message.content as string);
    } catch (error) {
      this.logger.error('Error generating tasks with OpenAI', error.stack);
      throw new InternalServerErrorException('Failed to generate tasks with AI');
    }
  }
}
