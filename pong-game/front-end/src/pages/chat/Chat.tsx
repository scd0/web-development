import GroupIcon from "../../icons/GroupIcon";
import { IconButton1 } from "../../icons/IconButton1";
import UserIcon from "../../icons/UserIcon";
import { useState, useEffect } from 'react'
import { socket } from "../../packages/socket";
import DirectMessages from "./DirectMessages";
import Channels from "./Channels";

export default function Chat() {
  const [selectedLink, setSelectedLink] = useState(0)

  function onInviteFriend(data:any) {
    window.location.href = "/"
  }

  useEffect(() => {
    socket.io.opts.extraHeaders = { "Authorization": localStorage.getItem('jwt') as string }
    socket.connect()
    socket.on('invite-player', onInviteFriend)
    return () => {
      socket.off('invite-player', onInviteFriend)
    }
  }, [])

  return (
    <div className="chat-div">
      <div className="chat-bar">
        <IconButton1 onClick={() => setSelectedLink(0)}>
          <UserIcon/>
        </IconButton1>
        <IconButton1 onClick={() => setSelectedLink(1)}>
          <GroupIcon/>
        </IconButton1>
      </div>
      {selectedLink === 0 && <DirectMessages/>}
      {selectedLink === 1 && <Channels/>}
    </div>
  )
}
