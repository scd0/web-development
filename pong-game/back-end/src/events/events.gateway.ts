import { JwtService } from '@nestjs/jwt';
import { Interval } from '@nestjs/schedule';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Match, User } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { IVector } from 'src/definitions';
import { PrismaService } from 'src/prisma.service';

@WebSocketGateway({ cors: '*' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private socketsMap = new Map<string, string>()

  constructor(private readonly jwtService: JwtService, private readonly prismaService: PrismaService) {}
  
  async handleConnection(client: Socket) {
    try {
      var payload = this.jwtService.verify(client.handshake.headers.authorization, { secret: process.env.JWT_SECRET });
    }
    catch {
      return
    }
    
    const user = await this.prismaService.user.findFirst({ where: { id: payload.id } });
    if (!user || !user.logged) {
      client.disconnect()
      return
    }

    this.socketsMap.set(payload.id, client.id)
  }
  
  handleDisconnect(client: Socket) {
    for (let [key, value] of this.socketsMap) {
      if (value === client.id) {
        this.socketsMap.delete(key)
        break
      }
    }
  }

  @SubscribeMessage('friend-added')
  async handleFriendAdded(client: Socket, data: any) {
    this.server.to(this.socketsMap.get(data.uid1)).emit('friend-added', { uid: data.uid2, user: await this.prismaService.user.findFirst({ where: { id: data.uid2 } })})
    this.server.to(this.socketsMap.get(data.uid2)).emit('friend-added', { uid: data.uid1, user: await this.prismaService.user.findFirst({ where: { id: data.uid1 } })})
  }

  @SubscribeMessage('direct-message-sent')
  handleDirectMessageSent(client: Socket, data: any) {
    this.server.to(this.socketsMap.get(data.uid1)).emit('direct-message-sent', data.message)
    this.server.to(this.socketsMap.get(data.uid2)).emit('direct-message-sent', data.message)
  }

  @SubscribeMessage('channel-message-sent')
  handleChannelMessageSent(client: Socket, data: any) {
    const members: User[] = data.m

    for(let i = 0; i < members.length; i++) {
      if (members[i].blocked.indexOf(data.uid1) === -1) {
        this.server.to(this.socketsMap.get(members[i].id)).emit('channel-message-sent', data)
      }
    }
  }

  @SubscribeMessage('friend-removed')
  handleFriendRemoved(client: Socket, data: any) {
    this.server.to(this.socketsMap.get(data.uid1)).emit('friend-removed', data.uid2)
    this.server.to(this.socketsMap.get(data.uid2)).emit('friend-removed', data.uid1)
  }

  @SubscribeMessage('channel-created')
  handleChannelCreated(client: Socket, data: any) {
    if (data.user.private)
      client.emit('channel-created', data)
    else
      this.server.emit('channel-created', data)
  }

  @SubscribeMessage('channel-removed')
  handleChannelRemoved(client: Socket, data: any) {
    this.server.emit('channel-removed', {user: data.user, uid: data.uid, destroyed: data.destroyed})
  }

  @SubscribeMessage('channel-member-join')
  handleChannelJoined(client: Socket, data: any) {
    this.server.emit('channel-member-join', {uid2: data.user.id, member: data.member})
  }

  @SubscribeMessage('find-match')
  handleFindMatch(client: Socket, data: any) {
    const match: Match = data.match
    if (match.left && match.left.length !== 0 && match.right && match.right.length !== 0) {
      this.server.to(this.socketsMap.get(match.left)).emit('find-match', data)
      this.server.to(this.socketsMap.get(match.right)).emit('find-match', data)
    }
  }

  @SubscribeMessage('paddle-move')
  handlePaddleMove(client: Socket, data: any) {
    this.server.to(this.socketsMap.get(data.receiver)).emit('paddle-move', data.y)
  }

  @Interval(5)
  async moveBalls() {
    const balls: Map<string, { position: IVector, speed: IVector, collider: string, leftScore: number, rightScore: number, default: string, stop: boolean }> = global.balls

	
    function resetBall(value: any) {
		value.position.x = 400
		value.position.y = 300
		value.speed.x = 1
		value.speed.y = 1
    }
	
    for (let [key, value] of balls) {
		if (value.leftScore === 2 || value.rightScore === 2)
			return 
      value.position.x += value.speed.x
      value.position.y += value.speed.y

      if (value.position.y > 600 - 16 || value.position.y <= 0)
        value.speed.y = -value.speed.y
      
      if (value.position.x > 800) {
        resetBall(value)
        value.leftScore++
        value.collider = ''
      }
      else if (value.position.x < 0) {
        resetBall(value)
        value.rightScore++
        value.collider = ''
      }

      if (value.leftScore === 2 || value.rightScore === 2) {
        const match = await this.prismaService.match.findFirst({ where: { id: key } })
        await this.prismaService.match.update({ where: { id: key }, data: { done: true, score: value.leftScore + " - " + value.rightScore } })        
        this.server.to(this.socketsMap.get(match.left)).emit('game-over', {value, left:match.left, right:match.right})
        this.server.to(this.socketsMap.get(match.right)).emit('game-over', {value, left:match.left, right:match.right})
        balls.delete(key)
      }
    }
  }

  @SubscribeMessage('ball-move')
  handleBallMove(client: Socket, data: any) {
    const match: Match = data.match
    const balls: Map<string, { position: IVector, speed: IVector, collider: string, leftScore: number, rightScore: number, default: string, stop: boolean }> = global.balls
    const vector = balls.get(data.match.id)

    this.server.to(this.socketsMap.get(match.left)).emit('ball-move', vector)
    this.server.to(this.socketsMap.get(match.right)).emit('ball-move', vector)
  }

  @SubscribeMessage('ball-collided')
  handleBallCollided(client: Socket, data: any) {
    const balls: Map<string, { position: IVector, speed: IVector, collider: string, leftScore: number, rightScore: number, default: string, stop: boolean }> = global.balls
    let ball = balls.get(data.data.match.id)

    if (ball !== undefined) {
      if (ball.collider.length === 0)
        ball.collider = ball.default
  
      if (ball.collider !== data.sender) {
        ball.speed.x = -ball.speed.x
        ball.collider = data.sender
      }
    }
  }

  @SubscribeMessage('invite-player')
  handleInvitePlayer(client: Socket, data: any) {
    this.server.to(this.socketsMap.get(data.left.id)).emit('invite-player', data)
    this.server.to(this.socketsMap.get(data.right.id)).emit('invite-player', data)
  }
}
