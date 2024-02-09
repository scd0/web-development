import { Controller, Get, Body, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('add-direct-message')
  @UseGuards(JwtGuard)
  async addDirectMessage(@Request() request, @Body('id') id: string, @Body('message') message: any) {
    return await this.chatService.addDirectMessage(request.user, id, message)
  }

  @Post('add-channel-message')
  @UseGuards(JwtGuard)
  async addChannelMessage(@Request() request, @Body('id') id: string, @Body('message') message: any) {
    return await this.chatService.addChannelMessage(request.user, id, message)
  }

  @Get('get-direct-conversation')
  @UseGuards(JwtGuard)
  async getDirectConversation(@Request() request, @Query('id') id: string) {
    return await this.chatService.getDirectConversation(request.user, id)
  }

  @Get('get-channel-conversation')
  @UseGuards(JwtGuard)
  async getChannelConversation(@Request() request, @Query('id') id: string) {
    return await this.chatService.getChannelConversation(request.user, id)
  }

  @Post('create-channel')
  @UseGuards(JwtGuard)
  async createChannel(@Request() request, @Body('name') name: string, @Body('prv') prv: boolean, @Body('password') password: string) {
    return await this.chatService.createChannel(request.user, name, prv, password)
  }

  @Post('join-channel')
  @UseGuards(JwtGuard)
  async joinChannel(@Request() request, @Body('name') name: string, @Body('password') password: string) {
    return await this.chatService.joinChannel(request.user, name, password)
  }

  @Post('remove-channel')
  @UseGuards(JwtGuard)
  async removeChannel(@Request() request, @Body('id') id: string) {
    return await this.chatService.removeChannel(request.user, id)
  }

  @Post('set-channel-pwd')
  @UseGuards(JwtGuard)
  async setChannelPwd(@Request() request, @Body('id') id: string, @Body('pwd') pwd: string) {
    return await this.chatService.setChannelPwd(request.user, id, pwd)
  }
  
  @Post('moderate-channel')
  @UseGuards(JwtGuard)
  async moderateChannel(@Request() request, @Body('targetUID') targetUID: string, @Body('action') action: string, @Body('targetCID') targetCID: string) {
    return await this.chatService.moderateChannel(request.user, targetUID, action, targetCID)
  }
}
