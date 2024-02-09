import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import * as qr from 'qrcode';

@Injectable()
export class LoginService {
  private secretsMap = new Map<string, string>()

  constructor(private readonly prismaService: PrismaService, private readonly jwtService: JwtService) {}

  async login(code: string) {
    const data = {
      grant_type: 'authorization_code', 
      client_id: process.env.OAUTH_UID, 
      client_secret: process.env.OAUTH_SECRET, 
      code: code, 
      redirect_uri: process.env.OAUTH_REDIRECT_URI
    }

    try {
      var packet = await axios.post('https://api.intra.42.fr/oauth/token', data)
      packet = await axios.get('https://api.intra.42.fr/v2/me?access_token=' + packet.data.access_token);
    }
    catch {
      throw new UnauthorizedException()
    }

    let user = await this.prismaService.user.findFirst({ where: { email: packet.data.email } })
    let firstTime = user === null
    if (firstTime)
      user = await this.prismaService.user.create({ data: { email: packet.data.email, avatar: packet.data.image.link, tfa: false } })
    let response = { id: user.id, stranger: firstTime || user.name === null, jwt: this.jwtService.sign({ id: user.id }), tfa: user.tfa }

    if (!user.tfa)
      user = await this.prismaService.user.update({ where: { id: user.id }, data: { logged: true } })
    else {
      const secret = authenticator.generateSecret()
      this.secretsMap.set(user.id, secret)
      return { ...response, qrcode: await qr.toDataURL(authenticator.keyuri(user.email, 'ft_transcendance', secret)) }
    }

    return response
  }

  async verify(bearer: string, token: string) {
    try {
      const payload = this.jwtService.verify(bearer.replace('Bearer ', ''));
      var user = await this.prismaService.user.findFirst({ where: { id: payload.id } });
      if (!user || !user.tfa)
        throw new UnauthorizedException();
    }
    catch {
      throw new UnauthorizedException();
    }

    const verified = authenticator.verify({ token, secret: this.secretsMap.get(user.id) })
    if (!verified)
      throw new UnauthorizedException()
    this.secretsMap.delete(user.id)
    user = await this.prismaService.user.update({ where: { id: user.id }, data: { logged: true } })
    return { verified }
  }
}
