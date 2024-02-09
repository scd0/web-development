import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Match, User } from '@prisma/client';
import Immutable from 'immutable';
import { IVector } from 'src/definitions';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MatchService {
  constructor(private readonly prismaService: PrismaService) {
    global.balls = new Map<string, { position: IVector, speed: IVector, collider: string, leftScore: number, rightScore: number, default: string, stop: boolean }>()
  }

  async createMatch(user: User, player: string) {
    const matches = await this.prismaService.match.findMany()

    for (let match of matches) {
      if (match.left && match.left.length !== 0 && match.left !== user.id && match.right === null) {
        match = await this.prismaService.match.update({ where:{id: match.id}, data:{ right: player}})
        const left = await this.prismaService.user.findFirst({where:{id: match.left}})
        const right = await this.prismaService.user.findFirst({where:{id: match.right}})
        global.balls.set(match.id, { position: { x: 400, y: 300 }, speed: { x: 1, y: 1 }, collider: '', leftScore: 0, rightScore: 0, default: match.left, stop: false })
        return { match, left, right }
      }
    }

    return { match: await this.prismaService.match.create({ data:{left: player, right: null}}), left: null, right: null}
  }

  async inviteMatch(user: User, left: string, right: string) {
    const pl = await this.prismaService.user.findFirst({where:{id: left}})
    const pr = await this.prismaService.user.findFirst({where:{id: right}})
    if (!pl || !pr || !pl.logged || !pr.logged)
      throw new UnauthorizedException()
    const match = await this.prismaService.match.create({ data:{left: left, right: right}})
    global.balls.set(match.id, { position: { x: 400, y: 300 }, speed: { x: 1, y: 1 }, collider: '', leftScore: 0, rightScore: 0, default: left, stop: false })
    return { match, left: pl, right:pr }
  }

  async isMatched(user: User, player: string) {
    const matches = await this.prismaService.match.findMany()

    for (let match of matches) {
      if (((match.left && match.left === player) || (match.right && match.right === player)) && !match.done) {
        const left = await this.prismaService.user.findFirst({where:{id: match.left}})
        const right = await this.prismaService.user.findFirst({where:{id: match.right}})
        return { yeah: true, match, left, right }
      }
    }

    return {yeah: false}
  }

  async getPlayerMatches(user: User, player: string) {
    let matches: {match: Match, enemy: User, left: boolean}[] = []
    const all = await this.prismaService.match.findMany()

    for (let match of all) {
      if (match.done && (match.left && match.left === player || match.right && match.right === player)) {
        const enemy = await this.prismaService.user.findFirst({where:{id:match.left === player ? match.right : match.left}})
        matches.push({match, enemy, left:match.left === player })
      }
    }

    return matches
  }
}
