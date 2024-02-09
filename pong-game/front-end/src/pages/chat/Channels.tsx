import { Badge, Button, Card, Container, Dropdown, Grid, Input, Modal, Spacer, Switch, SwitchEvent, Text, User, useModal } from "@nextui-org/react";
import EnvelopeIcon from "../../icons/EnvelopeIcon";
import { useEffect, useState } from 'react'
import { http } from "../../packages/http";
import { IChannel, IMessage, IUser } from "../../definitions";
import { socket } from "../../packages/socket";
import { IconButton2 } from "../../icons/IconButton2";
import { SendIcon } from "../../icons/SendIcon";

export default function Channels() {
  const { setVisible: showCreate, bindings: createModal } = useModal(false);
  const { setVisible: showJoin, bindings: joinModal } = useModal(false);
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [prv, setPrv] = useState(false)
  const [friends, setFriends] = useState<IChannel[]>([])
  const [selectedFriend, setSelectedFriend] = useState(-1)
  const [messages, setMessages] = useState<IMessage[]>([])
  const [members, setMembers] = useState<IUser[]>([])
  const { setVisible: showOptions, bindings: optionsModal } = useModal(false);
  const [toSend, setToSend] = useState("")

  useEffect(() => {
    http.get('/users/get-channels')
    .then((response) => setFriends(response.data))
    .catch((exception) => alert(exception.response.data.message))
  }, [])

  function onSend() {
    const sender = localStorage.getItem('id')
    if (toSend.length !== 0 && sender !== null && selectedFriend !== -1) {
      const message: IMessage = { sender, content: toSend }
      http.post('/chat/add-channel-message', { id: friends[selectedFriend]?.id, message })
      .then((response) => socket.emit('channel-message-sent', { uid1: sender, uid2: friends[selectedFriend]?.id, message, usr: response.data.usr, channel: response.data.channel, m: response.data.members }) )
      .catch((exception) => alert(exception.response.data.message))
    }
  }

  function onChannelCreated(data: any) {
    setFriends([ ...friends, data.user])
  }

  function onChannelMessageSent(data: any) {
    if (friends.length !== 0 && selectedFriend !== -1 && (data.uid2 === friends[selectedFriend]?.id))
      setMessages([ ...messages, data.message ])
  }

  function onChannelMessageJoined(data: any) {
    if (friends.length !== 0 && selectedFriend !== -1 && (data.uid2 === friends[selectedFriend]?.id))
      setMembers([ ...members, data.member ])
  }

  async function onFriendRemoved(data: any) {
    if (friends.length !== 0) {
      let index = friends.findIndex(stranger => stranger.id === data.uid);
      if (index !== -1 && (data.destroyed || data.user === localStorage.getItem('id'))) {
        setMessages([])
        const tmp = [...friends];
        tmp.splice(index, 1);
        setFriends(tmp);
      }
      if (!data.destroyed) {
        index = members.findIndex(stranger => stranger.id === data.user);
        if (index !== -1) {
          const tmp = [...members];
          tmp.splice(index, 1);
          setMembers(tmp);
        }
      }
      else
        setMembers([])
    }
  }

  useEffect(() => {
    socket.on('channel-message-sent', onChannelMessageSent)
    socket.on('channel-member-join', onChannelMessageJoined)
    socket.on('channel-removed', onFriendRemoved)
    socket.on('channel-created', onChannelCreated)
    return () => {
      socket.off('channel-member-join', onChannelMessageJoined)
      socket.off('channel-message-sent', onChannelMessageSent)
      socket.off('channel-removed', onFriendRemoved)
      socket.off('channel-created', onChannelCreated)
    }
  }, [onChannelCreated, onChannelMessageSent, onFriendRemoved, onChannelMessageJoined])

  function onRemove(id: string) {
    http.post('/chat/remove-channel', { id: id })
    .then((response) => {
      onFriendSelected(-1)
      socket.emit('channel-removed', { uid: id, destroyed: response.data.destroyed, user: response.data.user.id})
    })
    .catch((exception) => alert(exception.response.data.message))
  }

  function onCreateChannel() {
    showCreate(false)
    if (name.length === 0)
      alert('Please provide a channel name')
    else if (password.length !== 0 && !prv)
      alert('Channel can either be public, or private, or protected by a password')
    else {
      http.post('/chat/create-channel', { name, password, prv })
      .then((response) => socket.emit('channel-created', { user: response.data }))
      .catch((exception) => alert(exception.response.data.message))
    }
    setName('')
    setPassword('')
  }

  function onFriendSelected(index: number) {
    setMessages([])
    setSelectedFriend(index)
    showOptions(false)
    if (index !== -1) {
      http.get('/chat/get-channel-conversation', { params: { id: friends[index].id } })
      .then((response) => {
        setMessages(response.data.messages)
        setMembers(response.data.members)
      })
      .catch((exception) => alert(exception.response.data.message))
    }
  }

  function onJoinChannel() {
    showJoin(false)
    http.post('/chat/join-channel', { name, password })
    .then((response) => {
      socket.emit('channel-created', { user: response.data.channel })
      socket.emit('channel-member-join', { user: response.data.channel, member: response.data.member })
      onFriendSelected(-1)
    })
    .catch((exception) => alert(exception.response.data.message))
    setName('')
    setPassword('')
  }

  function onSetChannelPwd(id: string) {
    http.post('/chat/set-channel-pwd', {id, pwd: password})
    .then(() => showOptions(false))
    .catch((exception) => alert(exception.response.data.message))
  }

  function onDropdownAction(key: React.Key, uid: string) {
    if (selectedFriend !== -1 && friends.length !== 0) {
      const cid: string = friends[selectedFriend]?.id
      http.post('/chat/moderate-channel', { action: key, targetUID: uid, targetCID: cid })
      .then(() => {
        if (key === "kick" || key == "ban") {
          socket.emit('channel-removed', { uid: cid, destroyed: false, user: uid})
        }
      })
      .catch((exception) => alert(exception.response.data.message))
    }
  }

  return (
    <>
      <div className="chat-direct-messages">
        <Container css={{paddingTop: '25px'}}>
          <EnvelopeIcon/>
        </Container>
        <Text>Channels</Text>
        <Button.Group bordered>
          <Button onPress={() => showCreate(true)}>Create</Button>
          <Button onPress={() => showJoin(true)}>Join</Button>
        </Button.Group>
        <br/>
        <br/>
        {
          friends.map((friend, index) => (
            <div key={index}>
              <Card css={{$$cardColor: 'rgb(15,15,15)', mw: '90%', marginLeft: 'auto', marginRight: 'auto' }} isPressable onPress={() => onFriendSelected(index)} variant={selectedFriend === index ? "bordered" : "shadow"}>
                <Card.Body>
                  <Text>{friend.name}</Text>
                </Card.Body>
              </Card>
              <Spacer y={0.5}/>
            </div>
          ))
        }
      </div>
      {
        friends.length !== 0 && selectedFriend !== -1 &&
        <>
          <div className="chat-content">
          {
                messages.map((message, index) => (
                  <div key={index}>
                    <div className={message.sender === localStorage.getItem('id') ? "message-sent" : "message-received"}>
                      {message.content}
                    </div>
                    <Spacer y={0.5}/>
                  </div>
                ))
              }
          </div>
            <div className="chat-footer">
              <Input animated={false} css={{width: "80%"}} clearable aria-label="message" contentRightStyling={false} placeholder="enter your message" contentRight={<IconButton2 onClick={onSend}><SendIcon/></IconButton2>} onChange={(e) => setToSend(e.target.value)}/>
              <Spacer x={0.5}/>
              <Button onPress={() => showOptions(true)}>Options</Button>
            </div>
          <div className="chat-profile">
            <Text css={{marginTop: '25px'}}>Members</Text>
            <Spacer y={0.5}/>
            {
              members.map((friend, index) => (
                <div key={index}>
                  <Dropdown placement="bottom-left">
                    <Dropdown.Trigger>
                      <Card css={{$$cardColor: 'rgb(15,15,15)', mw: '90%', marginLeft: 'auto', marginRight: 'auto' }} isPressable>
                        <Card.Body>
                          <User src={friend.avatar} name={friend.name} description={friend.email} zoomed pointer/>
                        </Card.Body>
                      </Card>
                    </Dropdown.Trigger>
                    <Dropdown.Menu aria-label="member-action" onAction={(key) => onDropdownAction(key, friend.id)}>
                      <Dropdown.Item key="admin">Set Administrator</Dropdown.Item>
                      <Dropdown.Item key="ban">Ban</Dropdown.Item>
                      <Dropdown.Item key="mute">Mute</Dropdown.Item>
                      <Dropdown.Item key="kick">Kick</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Spacer y={0.5}/>
                </div>
              ))
            }
          </div>
        </>
      }
      <Modal preventClose blur closeButton {...optionsModal}>
        <Modal.Header>
          <Text size={16}>{friends[selectedFriend]?.name}'s Options</Text>
        </Modal.Header>
        <Modal.Body>
          <Button onPress={() => onRemove(friends[selectedFriend]?.id)}>Leave</Button>
          <Input.Password aria-label='password' placeholder='enter your channel password' clearable bordered borderWeight='light' animated={false} onChange={(e) => setPassword(e.target.value)}/>
          <Button onPress={() => onSetChannelPwd(friends[selectedFriend]?.id)}>Set Password</Button>
        </Modal.Body>
        <Modal.Footer>
        </Modal.Footer>
      </Modal>
      <Modal preventClose closeButton blur {...createModal}>
        <Modal.Header>
          <Text size={16}>Create Channel</Text>
        </Modal.Header>
        <Modal.Body>
          <Input aria-label='name' placeholder='enter your channel name' clearable bordered borderWeight='light' animated={false} onChange={(e) => setName(e.target.value)}/>
          <Input.Password aria-label='password' placeholder='enter your channel password' clearable bordered borderWeight='light' animated={false} onChange={(e) => setPassword(e.target.value)}/>
          <div style={{display: 'flex'}}>
            <Switch size='xl' shadow  initialChecked={prv} onChange={(e: SwitchEvent) => setPrv(e.target.checked)}/>
            <Text css={{paddingTop: '5px', paddingLeft: '10px'}}>Private</Text>
          </div>
        </Modal.Body>
        <Modal.Footer justify="center">
          <Button shadow onPress={onCreateChannel}>Create</Button>
        </Modal.Footer>
      </Modal>
      <Modal preventClose closeButton blur {...joinModal}>
        <Modal.Header>
          <Text size={16}>Join Channel</Text>
        </Modal.Header>
        <Modal.Body>
          <Input aria-label='name' placeholder='enter your channel name' clearable bordered borderWeight='light' animated={false} onChange={(e) => setName(e.target.value)}/>
          <Input.Password aria-label='password' placeholder='enter your channel password' clearable bordered borderWeight='light' animated={false} onChange={(e) => setPassword(e.target.value)}/>
        </Modal.Body>
        <Modal.Footer justify="center">
          <Button shadow onPress={onJoinChannel}>Join</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
