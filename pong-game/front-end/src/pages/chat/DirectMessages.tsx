import WinIcon from "../../icons/WinIcon";
import LossIcon from "../../icons/LossIcon";
import { IMessage, IUser, Statistic } from "../../definitions";
import { http } from "../../packages/http";
import EnvelopeIcon from "../../icons/EnvelopeIcon";
import { IconButton2 } from "../../icons/IconButton2";
import { SendIcon } from "../../icons/SendIcon";
import InviteIcon from "../../icons/InviteIcon";
import BlockIcon from "../../icons/BlockIcon";
import RemoveIcon from "../../icons/RemoveIcon";
import { Badge, Button, Card, Container, Grid, Input, Modal, Spacer, Text, User, useModal } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { socket } from "../../packages/socket";

export default function DirectMessages() {
  const [friends, setFriends] = useState<IUser[]>([])
  const [selectedFriend, setSelectedFriend] = useState(-1)
  const [toSend, setToSend] = useState("")
  const { setVisible: showOptions, bindings: optionsModal } = useModal(false);
  const [messages, setMessages] = useState<IMessage[]>([])
  const [stats, setStats] = useState<Statistic[]>([])

  useEffect(() => {
    http.get('/users/get-friends')
    .then((response) => setFriends(response.data))
    .catch((exception) => alert(exception.response.data.message))
  }, [])

  function onDirectMessageSent(message: IMessage) {
    if (friends.length !== 0 && selectedFriend !== -1 && (message.sender === friends[selectedFriend]?.id || message.sender === localStorage.getItem('id')))
      setMessages([ ...messages, message ])
  }

  async function onFriendRemoved(uid: string) {
    setMessages([])
    if (friends.length !== 0) {
      const index = friends.findIndex(stranger => stranger.id === uid);
      if (index !== -1) {
        const tmp = [...friends];
        tmp.splice(index, 1);
        setFriends(tmp);
      }
    }
  }

  function onFriendAdded(data: any) {
    setFriends([ ...friends, data.user])
  }

  useEffect(() => {
    socket.on('direct-message-sent', onDirectMessageSent)
    socket.on('friend-removed', onFriendRemoved)
    socket.on('friend-added', onFriendAdded)
    return () => {
      socket.off('direct-message-sent', onDirectMessageSent)
      socket.off('friend-removed', onFriendRemoved)
      socket.off('friend-added', onFriendAdded)
    }
  }, [onDirectMessageSent, onFriendRemoved, onFriendAdded])

  function onSend() {
    const sender = localStorage.getItem('id')
    if (toSend.length !== 0 && sender !== null && selectedFriend !== -1) {
      const message: IMessage = { sender, content: toSend }
      http.post('/chat/add-direct-message', { id: friends[selectedFriend]?.id, message })
      .then(() => socket.emit('direct-message-sent', { uid1: sender, uid2: friends[selectedFriend]?.id, message }))
      .catch((exception) => alert(exception.response.data.message))
    }
  }

  function onRemove(id: string) {
    http.post('/users/remove-friend', { id: id })
    .then(() => {
      onFriendSelected(-1)
      socket.emit('friend-removed', { uid1: localStorage.getItem('id'), uid2: id })
    })
    .catch((exception) => alert(exception.response.data.message))
  }

  function onBlock(id: string) {
    showOptions(false)
    http.post('/users/block-friend', { id: id })
    .then((response) => alert(response.data.msg))
    .catch((exception) => alert(exception.response.data.message))
  }

  function onInvite(id: string) {
    showOptions(false)
    http.post('/match/invite', { left: localStorage.getItem('id'), right: id })
    .then((response) => {
      socket.emit('invite-player', response.data)
    })
    .catch((exception) => alert(exception.response.data.message))
  }

  function onFriendSelected(index: number) {
    setMessages([])
    showOptions(false)
    if (index !== -1) {
      http.get('/chat/get-direct-conversation', { params: { id: friends[index].id } })
      .then((response) => {
        setMessages(response.data)
        http.get('/match', { params: {player:friends[index].id}})
        .then((response) => {
			setStats(response.data)
		})
        .catch((exception) => alert(exception.response.data.message))
      })
      .catch((exception) => alert(exception.response.data.message))
    }
    setSelectedFriend(index)
  }

  return (
    <>
      <div className="chat-direct-messages">
        <Container css={{paddingTop: '25px'}}>
          <EnvelopeIcon/>
        </Container>
        <Text>Direct Messages</Text>
        <br/>
        {
          friends.map((friend, index) => (
            <div key={index}>
              <Card css={{$$cardColor: 'rgb(15,15,15)', mw: '90%', marginLeft: 'auto', marginRight: 'auto' }} isPressable onPress={() => onFriendSelected(index)} variant={selectedFriend === index ? "bordered" : "shadow"}>
                <Card.Body>
                  <User src={friend.avatar} name={friend.name} description={friend.email} zoomed pointer/>
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
            <div className="chat-footer">
              <Input animated={false} css={{width: "80%"}} clearable aria-label="message" contentRightStyling={false} placeholder="enter your message" contentRight={<IconButton2 onClick={onSend}><SendIcon/></IconButton2>} onChange={(e) => setToSend(e.target.value)}/>
              <Spacer x={0.5}/>
              <Button onPress={() => showOptions(true)}>Options</Button>
            </div>
          </div>
          <div className="chat-profile">
            <Text css={{marginTop: '25px'}}>{friends[selectedFriend]?.name}</Text>
            <Text size={14} color="#777777">{friends[selectedFriend]?.email}</Text>
            <Badge css={{marginTop: '5px'}} color={friends[selectedFriend]?.logged ? "success" : "error"}>{friends[selectedFriend]?.logged ? "Online" : "Offline"}</Badge>
            <Grid.Container alignItems="center" gap={2}>
              <Grid css={{marginLeft: "auto", marginRight:"auto"}}>
                <Badge color="success" content={friends[selectedFriend]?.wins} shape="circle">
                  <WinIcon />
                </Badge>
              </Grid>
              <Grid css={{marginLeft: "auto", marginRight:"auto"}}>
                <Badge color="error" content={friends[selectedFriend]?.losses} shape="circle">
                  <LossIcon />
                </Badge>
              </Grid>
            </Grid.Container>
            <div style={{textAlign: 'center'}}>
              {
                stats.map((stat, index) => (
                  <Text key={index}>{stat.left ? friends[selectedFriend]?.name : stat.enemy.name} {stat.match.score} {stat.left ? stat.enemy.name : friends[selectedFriend]?.name}</Text>
                ))
              }
            </div>
          </div>
          <Modal preventClose blur closeButton {...optionsModal}>
            <Modal.Header>
              <Text size={16}>{friends[selectedFriend]?.name}'s Options</Text>
            </Modal.Header>
            <Modal.Body>
              <Button color="success" icon={<InviteIcon/>} onPress={() => onInvite(friends[selectedFriend]?.id)}>Invite</Button>
              <Button color="error" flat icon={<BlockIcon/>} onPress={() => onBlock(friends[selectedFriend]?.id)}>Block</Button>
              <Button color="error" icon={<RemoveIcon/>} onPress={() => onRemove(friends[selectedFriend]?.id)}>Remove</Button>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
          </Modal>
        </>
      }
    </>
  )
}