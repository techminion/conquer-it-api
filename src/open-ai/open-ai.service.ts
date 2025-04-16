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
      const prompt = `You are an expert productivity coach and task planner.

                    Given a specific goal and a duration, break down the goal into a structured list of actionable tasks that guide someone step-by-step toward achieving that goal. Each task should be logically sequenced, spread across the entire duration, and include a short description and a due date.

                    Assume today's date is "${new Date()}" and distribute tasks accordingly.

                    Inputs:
                    - Goal: "${goal}"
                    - Duration: "${duration}" (e.g., "14 days", "1 month", "6 weeks")

                    Output format (JSON array):
                    [
                      {
                        "name": "Task Name 1",
                        "description": "Brief description of what the user needs to do.",
                        "dueDate": "YYYY-MM-DD"
                      },
                      {
                        "name": "Task Name 2",
                        "description": "Brief description of the next step.",
                        "dueDate": "YYYY-MM-DD"
                      }
                      ...
                    ]

                    Ensure the output includes at least 5 tasks, unless the duration is very short. Tasks should be:
                    - Actionable
                    - Clear and specific
                    - Time-distributed across the full duration

                    Do not include any explanation or extra commentary—only return the JSON array.`;

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
