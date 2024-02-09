import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { LoginService } from './login.service';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  async login(@Body('code') code: string) {
    return await this.loginService.login(code)
  }

  

  @Post('verify')
  async verify(@Headers('Authorization') bearer: string, @Body('token') token: string) {
    return await this.loginService.verify(bearer, token)
  }
}
