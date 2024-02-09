import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  async addDirectMessage(user: User, id: string, message: any) {
    let conversation = await this.prismaService.conversation.findFirst({ where: { OR: [{ uid1: user.id, uid2: id }, { uid1: id, uid2: user.id }] } })
    const other = await this.prismaService.user.findFirst({where:{id:id}})
    if (!conversation || !other)
      throw new UnauthorizedException()
    if (other.blocked.indexOf(user.id) !== -1)
      throw new UnauthorizedException('You have been blocked by this user')
    conversation.messages.push(message)
    conversation = await this.prismaService.conversation.update({ where: { id: conversation.id }, data: { messages: conversation.messages } })
    return conversation
  }

  async addChannelMessage(user: User, id: string, message: any) {
    let members: User[] = []
    let channel = await this.prismaService.channel.findFirst({ where: { id: id } })
    if (!channel)
      throw new UnauthorizedException()
    if (channel.muted.indexOf(user.id) === -1) {
      channel.messages.push(message)
      channel = await this.prismaService.channel.update({ where: { id: channel.id }, data: { messages: channel.messages } })
    }
    else
      throw new UnauthorizedException('You are muted from this channel')
    members.push(await this.prismaService.user.findFirst({where:{id:channel.owner}}))
    for(let i = 0; i < channel.administrators.length; i++) {
      members.push(await this.prismaService.user.findFirst({where:{id: channel.administrators[i]}}))
    }
    for(let i = 0; i < channel.members.length; i++) {
      members.push(await this.prismaService.user.findFirst({where:{id: channel.members[i]}}))
    }
    return {channel, usr: user, members}
  }

  async getDirectConversation(user: User, id: string) {
    const conversation = await this.prismaService.conversation.findFirst({ where: { OR: [{ uid1: user.id, uid2: id }, { uid1: id, uid2: user.id }] } })
    if (!conversation)
      throw new UnauthorizedException()
    return conversation.messages
  }

  async getChannelConversation(user: User, id: string) {
    let members: User[] = []
    const channel = await this.prismaService.channel.findFirst({ where: { id: id } })
    if (!channel)
      throw new UnauthorizedException()
    members.push(await this.prismaService.user.findFirst({where:{id:channel.owner}}))
    for(let i = 0; i < channel.administrators.length; i++) {
      members.push(await this.prismaService.user.findFirst({where:{id: channel.administrators[i]}}))
    }
    for(let i = 0; i < channel.members.length; i++) {
      members.push(await this.prismaService.user.findFirst({where:{id: channel.members[i]}}))
    }
    for(let i = 0; i < channel.banned.length; i++) {
      members.push(await this.prismaService.user.findFirst({where:{id: channel.banned[i]}}))
    }
    return {messages:channel.messages, members}
  }

  async createChannel(user: User, name: string, prv: boolean, password: string) {
    try {
      let channel = await this.prismaService.channel.create({ data: {name: name, private: prv, password: password, owner: user.id }})
      if (!channel.private) {
        const users = await this.prismaService.user.findMany()
        for(let i = 0; i < users.length; i++) {
          if (users[i].id !== user.id)
            channel.members.push(users[i].id)
        }
        channel = await this.prismaService.channel.update({where: {id: channel.id}, data:{members: channel.members}})
      }
      if (password.length !== 0)
        channel = await this.prismaService.channel.update({where: {id: channel.id}, data:{password: await bcrypt.hash(password, await bcrypt.genSalt())}})
      return channel
    }
    catch {
      throw new UnauthorizedException("Channel already exists")
    }
  }

  async joinChannel(user: User, name: string, password: string) {
    let channel = await this.prismaService.channel.findFirst({ where: {name: name}})
    if (!channel || !channel.private)
      throw new  UnauthorizedException('Could not join channel')
    if (channel.owner === user.id || channel.administrators.indexOf(user.id) !== -1 || channel.members.indexOf(user.id) !== -1)
      throw new  UnauthorizedException('Channel already joined')
    if (channel.banned.indexOf(user.id) !== -1)
      throw new  UnauthorizedException('You are banned from this channel')
    if (channel.password.length !== 0 && !await bcrypt.compare(password, channel.password))
      throw new  UnauthorizedException('Wrong channel password')
    channel.members.push(user.id)
    channel = await this.prismaService.channel.update({ where: {id: channel.id}, data:{members: channel.members}})
    return {channel, member: user}
  }

  async removeChannel(user: User, id: string) {
    let channel = await this.prismaService.channel.findFirst({ where: {id: id}})
    if (!channel || (channel.owner !== user.id && !channel.private))
      throw new  UnauthorizedException('Could not leave channel')
    if (channel.owner === user.id) {
      await this.prismaService.channel.delete({where:{id: id}})
      return {user, destroyed: true }
    }
    else {
      let index = channel.administrators.indexOf(user.id)
      if (index !== -1)
        channel.administrators.splice(index, 1)
      index = channel.members.indexOf(user.id)
      if (index !== -1)
        channel.members.splice(index, 1)
      channel = await this.prismaService.channel.update({ where: {id: channel.id}, data:{members: channel.members, administrators: channel.administrators}})
      return {user, destroyed: false }
    }
  }

  async setChannelPwd(user: User, id: string, pwd: string) {
    let channel = await this.prismaService.channel.findFirst({ where: {id: id}})
    if (!channel || channel.owner !== user.id)
      throw new  UnauthorizedException('Could not set channel password')
    if (pwd.length !== 0)
      channel = await this.prismaService.channel.update({where: {id: channel.id}, data:{password: await bcrypt.hash(pwd, await bcrypt.genSalt())}})
    else
      channel = await this.prismaService.channel.update({where:{id:id}, data:{password:''}})
    return channel
  }

  async moderateChannel(user: User, targetUID: string, action: string, targetCID: string) {
    let channel = await this.prismaService.channel.findFirst({ where: {id: targetCID}})
    if (!channel || user.id === targetUID || targetUID === channel.owner)
      throw new  UnauthorizedException('Could not moderate channel')

    if (channel.owner === user.id || channel.administrators.indexOf(user.id) !== -1) {
      let index = -1
      switch (action) {
        case "ban":
          index =  channel.banned.indexOf(targetUID)
          if (index !== -1) {
            channel.banned.splice(index, 1)
          }
          else
            channel.banned.push(targetUID)
        case "kick":
          index = channel.administrators.indexOf(targetUID)
          if (index !== -1)
            channel.administrators.splice(index, 1)
          index = channel.members.indexOf(targetUID)
          if (index !== -1)
            channel.members.splice(index, 1)
          break
        case "admin":
          index = channel.administrators.indexOf(targetUID)
          if (index !== -1) {
            channel.administrators.splice(index, 1)
            channel.members.push(targetUID)
          }
          else {
            channel.administrators.push(targetUID)
            index = channel.members.indexOf(targetUID)
            if (index !== -1)
              channel.members.splice(index, 1)
          }
          break
        case "mute":
          index =  channel.muted.indexOf(targetUID)
          if (index !== -1) {
            channel.muted.splice(index, 1)
          }
          else
            channel.muted.push(targetUID)
          break
        default:
          return channel
      }
      channel = await this.prismaService.channel.update({where:{id: targetCID}, data:{muted: channel.muted, administrators: channel.administrators, members: channel.members, banned: channel.banned}})
    }
    else
      throw new  UnauthorizedException('Not enough privileges')
    return channel
  }
}
