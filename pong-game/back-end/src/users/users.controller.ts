import { Controller, Get, Query, UseGuards, Post, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Body, Request, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from 'src/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('get')
  @UseGuards(JwtGuard)
  async get(@Query('id') id: string) {
    return await this.usersService.get(id)
  }

  @Post('edit')
  @UseGuards(JwtGuard)
  async edit(@Request() request, @Body('name') name: string, @Body('tfa') tfa: boolean) {
    return await this.usersService.edit(request.user, name, tfa)
  }

  @Post('edit-avatar')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('avatar', { storage: diskStorage({ destination: './public/uploads', filename: (request: any, file, callback) => { return callback(null, request.user.id + '.jpg'); } }) }))
  async editAvatar(@Request() request, @UploadedFile(new ParseFilePipe({ validators: [ new FileTypeValidator({ fileType: 'image/jpeg' }), new MaxFileSizeValidator({ maxSize: 0x1E8480 }) ] })) avatar: Express.Multer.File) {
    return await this.usersService.editAvatar(request.user, avatar)
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout(@Request() request) {
    return await this.usersService.logout(request.user)
  }

  @Get('get-strangers')
  @UseGuards(JwtGuard)
  async getStrangers(@Request() request) {
    return await this.usersService.getStrangers(request.user)
  }

  @Get('get-friends')
  @UseGuards(JwtGuard)
  async getFriends(@Request() request) {
    return await this.usersService.getFriends(request.user)
  }
  
  @Post('add-friend')
  @UseGuards(JwtGuard)
  async addFriend(@Request() request, @Body('id') id: string) {
    return await this.usersService.addFriend(request.user, id)
  }

  @Post('remove-friend')
  @UseGuards(JwtGuard)
  async removeFriend(@Request() request, @Body('id') id: string) {
    return await this.usersService.removeFriend(request.user, id)
  }

  @Post('block-friend')
  @UseGuards(JwtGuard)
  async blockFriend(@Request() request, @Body('id') id: string) {
    return await this.usersService.blockFriend(request.user, id)
  }

  @Get('get-channels')
  @UseGuards(JwtGuard)
  async getChannels(@Request() request) {
    return await this.usersService.getChannels(request.user)
  }

  @Post('update-stats')
  @UseGuards(JwtGuard)
  async updateStats(@Request() request, @Body('id') id: string, @Body('won') won: boolean) {
    return await this.usersService.updateStats(request.user, id, won)
  }
}
