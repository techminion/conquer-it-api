import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OpenAiService } from 'src/open-ai/open-ai.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Goal, GoalDocument } from './schemas/goal.schema';
import { Task, TaskDocument } from './schemas/task.schema';

@Injectable()
export class GoalsService {
  private readonly logger = new Logger(GoalsService.name);
  constructor(
    @InjectModel(Goal.name) private goalModel: Model<GoalDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private readonly openAiService: OpenAiService,
  ) {}

  async createGoal(userId: string, createGoalDto: CreateGoalDto): Promise<GoalDocument> {
    this.logger.log(`Creating a new goal for user ${userId}`);
    if (!createGoalDto.category || !createGoalDto.duration) {
      this.logger.error('Category and duration are required');
      throw new Error('Category and duration are required to create a goal.');
    }

    const tasks = await this.openAiService.generateTasks(
      createGoalDto.name,
      createGoalDto.duration,
    );

    const newGoal = new this.goalModel({ ...createGoalDto, userId });

    try {
      const savedGoal = await newGoal.save();
      this.logger.log(`Goal created successfully with ID: ${savedGoal._id}`);
      this.addMultipleTasks(userId, savedGoal._id as string, tasks['tasks']);
      return savedGoal;
    } catch (error) {
      this.logger.error(`Failed to create goal for user ${userId}`, error.stack);
      throw new Error('Failed to create goal.');
    }
  }

  async findAllGoals(userId: string): Promise<GoalDocument[]> {
    this.logger.log(`Fetching all goals for user ${userId}`);
    return this.goalModel.find({ userId }).populate({ path: 'tasks', model: 'Task' }).exec();
  }

  async findGoalById(userId: string, goalId: string): Promise<GoalDocument> {
    this.logger.log(`Searching for goal ${goalId} for user ${userId}`);
    if (!goalId) {
      this.logger.error('Goal ID must be provided.');
      throw new Error('Goal ID must be provided.');
    }

    this.logger.debug(`Querying goal with ID ${goalId} for user ${userId} and populating tasks`);
    const goal = await this.goalModel
      .findOne({ _id: goalId, userId })
      .populate({ path: 'tasks', model: 'Task' })
      .exec();

    if (goal) {
      this.logger.log(`Fetched goal: ${goal.name} with ${goal.tasks?.length || 0} tasks`);
    } else {
      this.logger.warn(`Goal ${goalId} not found for user ${userId}`);
      throw new NotFoundException('Goal not found or you do not have permission to access it.');
    }

    return goal;
  }

  async updateGoal(
    userId: string,
    goalId: string,
    updateGoalDto: UpdateGoalDto,
  ): Promise<GoalDocument> {
    this.logger.log(`Updating goal ${goalId} for user ${userId}`);

    if (!Object.keys(updateGoalDto).length) {
      this.logger.error('At least one field must be updated.');
      throw new Error('At least one field must be updated.');
    }

    const goal = await this.findGoalById(userId, goalId);
    Object.assign(goal, updateGoalDto);

    try {
      const updatedGoal = await goal.save();
      this.logger.log(`Goal ${goalId} updated successfully for user ${userId}`);
      return updatedGoal;
    } catch (error) {
      this.logger.error(`Failed to update goal ${goalId} for user ${userId}`, error.stack);
      throw new Error('Failed to update goal.');
    }
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    this.logger.log(`Deleting goal ${goalId} for user ${userId}`);

    if (!goalId) {
      this.logger.error('Goal ID must be provided.');
      throw new Error('Goal ID must be provided.');
    }

    const result = await this.goalModel.deleteOne({ _id: goalId, userId });

    if (result.deletedCount === 0) {
      this.logger.warn(`Goal ${goalId} not found or already deleted for user ${userId}`);
      throw new NotFoundException('Goal not found or already deleted.');
    }

    this.logger.log(`Goal ${goalId} deleted successfully for user ${userId}`);
  }

  async addTask(
    userId: string,
    goalId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<GoalDocument> {
    this.logger.log(`Adding a new task to goal ${goalId} for user ${userId}`);

    if (!createTaskDto.dueDate || !createTaskDto.description) {
      this.logger.error('Task must have a date and description.');
      throw new Error('Task must have a date and description.');
    }

    const goal = await this.findGoalById(userId, goalId);

    // Create a new Task document
    const newTask = new this.taskModel({ ...createTaskDto, goalId });
    const savedTask = await newTask.save();

    // Push the task's ObjectId into the goal's tasks array
    goal.tasks.push(savedTask._id as Types.ObjectId);

    try {
      const updatedGoal = await goal.save();
      this.logger.log(`Task added successfully to goal ${goalId} for user ${userId}`);
      return updatedGoal;
    } catch (error) {
      this.logger.error(`Failed to add task to goal ${goalId} for user ${userId}`, error.stack);
      throw new Error('Failed to add task.');
    }
  }

  async updateTask(
    userId: string,
    goalId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<GoalDocument> {
    this.logger.log(`Updating task ${taskId} in goal ${goalId} for user ${userId}`);

    if (!Object.keys(updateTaskDto).length) {
      this.logger.error('At least one field must be updated.');
      throw new Error('At least one field must be updated.');
    }

    const goal = await this.findGoalById(userId, goalId);
    const task = goal.tasks.find((task) => task._id?.toString() === taskId);

    if (!task) {
      this.logger.warn(`Task ${taskId} not found in goal ${goalId} for user ${userId}`);
      throw new NotFoundException('Task not found.');
    }

    Object.assign(task, updateTaskDto);

    try {
      const updatedGoal = await goal.save();
      this.logger.log(`Task ${taskId} updated successfully in goal ${goalId} for user ${userId}`);
      return updatedGoal;
    } catch (error) {
      this.logger.error(
        `Failed to update task ${taskId} in goal ${goalId} for user ${userId}`,
        error.stack,
      );
      throw new Error('Failed to update task.');
    }
  }

  async addMultipleTasks(
    userId: string,
    goalId: string,
    createTaskDtos: CreateTaskDto[],
  ): Promise<GoalDocument> {
    this.logger.log(`Adding multiple tasks to goal ${goalId} for user ${userId}`);

    if (!createTaskDtos.length) {
      this.logger.error('At least one task must be provided.');
      throw new Error('At least one task must be provided.');
    }

    const goal = await this.findGoalById(userId, goalId);

    const newTasks = createTaskDtos.map((taskDto) => new this.taskModel({ ...taskDto, goalId }));
    const savedTasks = await this.taskModel.insertMany(newTasks);

    // Push the task ObjectIds into the goal's tasks array
    goal.tasks.push(...savedTasks.map((task) => task._id as Types.ObjectId));

    try {
      const updatedGoal = await goal.save();
      this.logger.log(`Multiple tasks added successfully to goal ${goalId} for user ${userId}`);
      return updatedGoal;
    } catch (error) {
      this.logger.error(
        `Failed to add multiple tasks to goal ${goalId} for user ${userId}`,
        error.stack,
      );
      throw new Error('Failed to add multiple tasks.');
    }
  }
}
