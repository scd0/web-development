import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Channel, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async get(id: string) {
    const user = await this.prismaService.user.findFirst({ where: { id: id } })
    if (!user)
      throw new UnauthorizedException()
    return user
  }

  async edit(user: User, name: string, tfa: boolean) {
    if (name && name.length !== 0) {
      try {
        user = await this.prismaService.user.update({ where: { id: user.id }, data: { name: name } })
      }
      catch {
        throw new UnauthorizedException('Username already exists')
      }
    }
    user = await this.prismaService.user.update({ where: { id: user.id }, data: { tfa: tfa } })
    return user
  }

  async editAvatar(user: User, avatar: Express.Multer.File) {
    user = await this.prismaService.user.update({ where: { id: user.id }, data: { avatar: 'http://localhost:3000/uploads/' + avatar.filename } });
    return user;
  }

  async logout(user: User) {
    user = await this.prismaService.user.update({ where: { id: user.id }, data: { logged: false } });
    return user;
  }

  async getStrangers(user: User) {
    let strangers: User[] = []
    const items = await this.prismaService.user.findMany()
    items.forEach((item) => {
      if (user.friends.indexOf(item.id) === -1 && user.id !== item.id)
        strangers.push(item)
    })
    return strangers
  }

  async getFriends(user: User) {
    let friends: User[] = []
    const items = await this.prismaService.user.findMany()
    items.forEach((item) => {
      if (user.friends.indexOf(item.id) !== -1 && user.id !== item.id)
        friends.push(item)
    })
    return friends
  }

  async addFriend(user: User, id: string) {
    let other = await this.prismaService.user.findFirst({ where: { id: id } })
    if (user.friends.indexOf(id) !== -1 || !other)
      throw new UnauthorizedException()
    user.friends.push(id)
    user = await this.prismaService.user.update({ where: { id: user.id }, data: { friends: user.friends } })
    other.friends.push(user.id)
    other = await this.prismaService.user.update({ where: { id: other.id }, data: { friends: other.friends } })
    await this.prismaService.conversation.create({ data: { uid1: user.id, uid2: id } })
    return { user, other }
  }

  async removeFriend(user: User, id: string) {
    let other = await this.prismaService.user.findFirst({ where: { id: id } })
    let index = user.friends.indexOf(id)
    if (index === -1 || !other)
      throw new UnauthorizedException()
    user.friends.splice(index, 1)
    user = await this.prismaService.user.update({ where: { id: user.id }, data: { friends: user.friends } })
    index = other.friends.indexOf(user.id)
    other.friends.splice(index, 1)
    other = await this.prismaService.user.update({ where: { id: other.id }, data: { friends: other.friends } })
    let conversation = await this.prismaService.conversation.findFirst({ where: { OR: [{ uid1: user.id, uid2: other.id }, { uid1: other.id, uid2: user.id }] } })
    await this.prismaService.conversation.delete({ where: { id: conversation.id } })
    return { user, other }
  }

  async blockFriend(user: User, id: string) {
    const index = user.blocked.indexOf(id)
    if (index === -1)
      user.blocked.push(id)
    else
      user.blocked.splice(index, 1)
    user = await this.prismaService.user.update({where:{id: user.id}, data:{blocked: user.blocked}})
    return { msg: index === -1 ? "User has been blocked": "User has been unblocked"}
  }

  async getChannels(user: User) {
    let channels: Channel[] = []
    const items = await this.prismaService.channel.findMany()
    items.forEach((item) => {
      if ((!item.private || item.owner === user.id || item.administrators.indexOf(user.id) !== -1 || item.members.indexOf(user.id) !== -1) && item.banned.indexOf(user.id) === -1)
        channels.push(item)
    })
    return channels
  }

  async updateStats(user: User, id: string, won: boolean){
    let target = await this.prismaService.user.findFirst({where:{id: id}})
    if (!target)
      throw new UnauthorizedException()
    if (won)
      target = await this.prismaService.user.update({where:{id:id}, data:{wins: target.wins + 1}})
    else
      target = await this.prismaService.user.update({where:{id:id}, data:{losses: target.losses + 1}})
    return target
  }
}
