import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ required: false, default: '' })
  description: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
