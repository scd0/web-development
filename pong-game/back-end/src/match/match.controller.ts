import { Controller, Post, UseGuards, Request, Body, Get, Query } from '@nestjs/common';
import { MatchService } from './match.service';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createMatch(@Request() request, @Body('player') player: string) {
    return await this.matchService.createMatch(request.user, player)
  }

  @Post('invite')
  @UseGuards(JwtGuard)
  async inviteMatch(@Request() request, @Body('left') left: string, @Body('right') right: string) {
    return await this.matchService.inviteMatch(request.user, left, right)
  }
  
  @Get('is-matched')
  @UseGuards(JwtGuard)
  async isMatched(@Request() request, @Query('player') player: string) {
    return await this.matchService.isMatched(request.user, player)
  }

  @Get()
  @UseGuards(JwtGuard)
  async getPlayerMatches(@Request() request, @Query('player') player: string) {
    return await this.matchService.getPlayerMatches(request.user, player)
  }
}
