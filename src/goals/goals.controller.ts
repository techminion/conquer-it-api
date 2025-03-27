import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GoalsService } from './goals.service';

@Controller({ path: 'goals', version: '1' })
export class GoalsController {
  private readonly logger = new Logger(GoalsController.name);
  constructor(
    private readonly goalsService: GoalsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(@Request() req, @Body() createGoalDto: CreateGoalDto) {
    this.logger.log(
      `Creating goal: { email: ${req.user.email}, dto: ${JSON.stringify(createGoalDto)} }`,
    );
    try {
      const user = await this.usersService.findByEmail(req.user.email);
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      this.logger.log(`User found: ${user._id}`);
      return await this.goalsService.createGoal(user._id as string, createGoalDto);
    } catch (error) {
      this.logger.error('Error creating goal', error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  async findAll(@Request() req) {
    this.logger.log(`Fetching all goals: { email: ${req.user.email} }`);
    try {
      const user = await this.usersService.findByEmail(req.user.email);
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      const goals = await this.goalsService.findAllGoals(user._id as string);
      this.logger.log('Fetched goals successfully');
      return goals.length ? goals : [];
    } catch (error) {
      this.logger.error('Error fetching goals', error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    this.logger.log(`Fetching goal: { email: ${req.user.email}, goalId: ${id} }`);
    try {
      if (!id) {
        throw new BadRequestException('Goal ID is required.');
      }
      const user = await this.usersService.findByEmail(req.user.email);
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      const goal = await this.goalsService.findGoalById(user._id as string, id);
      if (!goal) {
        throw new NotFoundException('Goal not found.');
      }
      this.logger.log('Goal fetched successfully');
      return goal;
    } catch (error) {
      this.logger.error('Error fetching goal', error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateGoalDto: UpdateGoalDto) {
    this.logger.log(
      `Updating goal: { email: ${req.user.email}, goalId: ${id}, dto: ${JSON.stringify(updateGoalDto)} }`,
    );
    try {
      const goal = await this.goalsService.findGoalById(req.user.id, id);
      if (!goal) {
        throw new NotFoundException('Goal not found.');
      }
      const user = await this.usersService.findByEmail(req.user.email);
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      return await this.goalsService.updateGoal(user._id as string, id, updateGoalDto);
    } catch (error) {
      this.logger.error('Error updating goal', error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    this.logger.log(`Deleting goal: { email: ${req.user.email}, goalId: ${id} }`);
    try {
      const goal = await this.goalsService.findGoalById(req.user.id, id);
      if (!goal) {
        throw new NotFoundException('Goal not found.');
      }
      const user = await this.usersService.findByEmail(req.user.email);
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      return await this.goalsService.deleteGoal(user._id as string, id);
    } catch (error) {
      this.logger.error('Error deleting goal', error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post(':goalId/tasks')
  async addTask(
    @Request() req,
    @Param('goalId') goalId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    this.logger.log(
      `Adding task: { email: ${req.user.email}, goalId: ${goalId}, dto: ${JSON.stringify(createTaskDto)} }`,
    );
    try {
      const goal = await this.goalsService.findGoalById(req.user.id, goalId);
      if (!goal) {
        throw new NotFoundException('Goal not found.');
      }
      const user = await this.usersService.findByEmail(req.user.email);
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      return await this.goalsService.addTask(user._id as string, goalId, createTaskDto);
    } catch (error) {
      this.logger.error('Error adding task', error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':goalId/tasks/:taskId')
  async updateTask(
    @Request() req,
    @Param('goalId') goalId: string,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    this.logger.log(
      `Updating task', { email: ${req.user.email}, goalId: ${goalId}, taskId: ${taskId}, dto: ${JSON.stringify(updateTaskDto)} }`,
    );
    try {
      const goal = await this.goalsService.findGoalById(req.user.id, goalId);
      if (!goal) {
        throw new NotFoundException('Goal not found.');
      }
      const user = await this.usersService.findByEmail(req.user.email);
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      return await this.goalsService.updateTask(user._id as string, goalId, taskId, updateTaskDto);
    } catch (error) {
      this.logger.error('Error updating task', error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }
}
