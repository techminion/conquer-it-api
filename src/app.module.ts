import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { UsersModule } from './users/users.module';

import { MailerModule } from '@nestjs-modules/mailer';
import { constants } from './config/constants';
import { GoalsModule } from './goals/goals.module';
import { OpenAiService } from './open-ai/open-ai.service';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    MongooseModule.forRoot(constants.mongodb.uri as string),
    MailerModule.forRoot({
      transport: {
        host: constants.smtp.host,
        port: constants.smtp.port,
        auth: {
          user: constants.smtp.username,
          pass: constants.smtp.password,
        },
      },
    }),
    GoalsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtStrategy,
    OpenAiService,
  ],
})
export class AppModule {}
