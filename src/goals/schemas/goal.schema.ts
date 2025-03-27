import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TaskDocument, TaskSchema } from './task.schema';

export type GoalDocument = Goal & Document;

@Schema({ timestamps: true })
export class Goal {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  duration: string;

  @Prop()
  description: string;

  @Prop({ type: [{ type: TaskSchema, ref: 'Task' }], default: [] })
  tasks: Types.DocumentArray<TaskDocument>;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
