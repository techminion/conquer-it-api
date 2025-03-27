import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/user.schema';
import { UsersService } from 'src/users/users.service';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { Goal, GoalSchema } from './schemas/goal.schema';
import { Task, TaskSchema } from './schemas/task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Goal.name, schema: GoalSchema },
      { name: Task.name, schema: TaskSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [GoalsService, UsersService],
  controllers: [GoalsController],
})
export class GoalsModule {}
