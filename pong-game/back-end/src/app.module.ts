import { Module } from '@nestjs/common';
import { LoginModule } from './login/login.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventsModule } from './events/events.module';
import { ChatModule } from './chat/chat.module';
import { MatchModule } from './match/match.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), LoginModule, UsersModule, ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }), EventsModule, ChatModule, MatchModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
