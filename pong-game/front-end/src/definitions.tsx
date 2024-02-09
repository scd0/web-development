export interface IUser {
  id: string
  name: string | null
  email: string
  avatar: string
  tfa: boolean
  logged: boolean
  friends: string[]
  wins: number
  losses: number
}

export interface IMessage {
  sender: string
  content: string
}

export interface IChannel {
  id: string
  name: string
  private: boolean
  password: string
  owner: string
  administrators: string[]
  members: string[]
  banned: string[]
  muted: string[]
}

export interface IMatch {
  id: string
  left: string
  right: string | null
  done: boolean
  score: string | null
}

export interface IVector {
  x: number;
  y: number;
};

export interface Statistic {
  match: IMatch
  enemy: IUser
  left: boolean
}
