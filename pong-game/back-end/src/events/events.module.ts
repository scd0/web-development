import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { MatchService } from 'src/match/match.service';

@Module({
  providers: [EventsGateway, JwtService, PrismaService, MatchService]
})
export class EventsModule {}
