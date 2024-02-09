import {  Button, Link, Table, Text, User, useModal } from "@nextui-org/react";
import AddIcon from "../icons/AddIcon";
import { useEffect, useState } from "react";
import { http } from "../packages/http";
import { IUser } from "../definitions";
import { socket } from "../packages/socket";
import Profile from "./Profile";

export default function Network() {
  const columns = [{ name: "USERS", uid: "name" },{ name: "ACTIONS", uid: "actions" }];
  const [strangers, setStrangers] = useState<IUser[]>([])
  const { setVisible: showProfile, bindings: profileModal, visible: profileVisible } = useModal();
  const [id, setId] = useState('')

  useEffect(() => {
    http.get('/users/get-strangers')
    .then((response) => setStrangers(response.data))
    .catch((exception) => alert(exception.response.data.message))
  }, [])

  function onFriendAdded(data: any) {
    const index = strangers.findIndex(stranger => stranger.id === data.uid);
    if (index !== -1) {
      const tmp = [...strangers];
      tmp.splice(index, 1);
      setStrangers(tmp);
    }
  }

  useEffect(() => {
    socket.on('friend-added', onFriendAdded)
    return () => {
      socket.off('friend-added', onFriendAdded)
    }
  }, [onFriendAdded])

  function onAddFriend(stranger: IUser) {
    http.post('/users/add-friend', { id: stranger.id })
    .then(() => socket.emit('friend-added', { uid1: localStorage.getItem('id'), uid2: stranger.id }))
    .catch((exception) => alert(exception.response.data.message))
  }

  function onShowProfile(stranger: IUser) {
    setId(stranger.id)
    showProfile(true)
  }

  function renderCell(item: IUser, key: React.Key) {
    switch (key) {
      case "name":
        return (
          <User src={item.avatar} name={item.name} description={item.email} zoomed pointer css={{p: 0}} onClick={() => onShowProfile(item)}/>
        )
      case "actions":
        return  (
          <Button css={{float: 'right'}} onPress={() => onAddFriend(item)} icon={<AddIcon/>}>Add Friend</Button>
        )
    }
  }

  return (
    <>
      <div style={{display: 'flex', marginTop: '25px', marginLeft: '25px'}}>
        <Text size={16} >use the&nbsp;</Text>
        <Link css={{fontSize: '16px'}} className="external-link" isExternal href="http://localhost:5173/chat">chat</Link>
        <Text size={16} >&nbsp;to talk with your friends</Text>
      </div>
      <br/>
      <div style={{position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '60%', backgroundColor: '#101010', borderRadius: '20px'}}>
        <Table aria-label="network-table" css={{height: "auto", minWidth: "100%"}} selectionMode="none">
          <Table.Header columns={columns}>
            {
              (column) => (
                <Table.Column key={column.uid} hideHeader={column.uid === "actions"} align="start">{column.name}</Table.Column>
              )
            }
          </Table.Header>
          <Table.Body items={strangers}>
            {
              (item) => (
                <Table.Row>
                  {
                    (key) => (
                      <Table.Cell>{renderCell(item, key)}</Table.Cell>
                    )
                  }
                </Table.Row>
              )
            }
          </Table.Body>
        </Table>
      </div>
      {profileVisible && <Profile bindings={profileModal} id={id}/>}
    </>
  )
}
