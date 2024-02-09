import { useEffect, useState } from "react"
import { http } from "../packages/http"
import { useNavigate } from "react-router-dom"
import { Avatar, Button, Dropdown, Input, Modal, Navbar, Switch, Text, User, useModal } from "@nextui-org/react"
import Game from "./game/Game"
import Network from "./Network"
import SettingsIcon from "../icons/SettingsIcon"
import LogoutIcon from "../icons/LogoutIcon"
import Settings from "./Settings"
import { socket } from "../packages/socket"

export default function Home() {
  const navigate = useNavigate()
  const links = ["Home", "Network"]
  const [selectedLink, setSelectedLink]= useState(0)
  const [name, setName] = useState('')
  const [email, setEMail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [tfa, setTfa] = useState(false)
  const { setVisible: showSettings, bindings: settingsModal } = useModal();

  function onInviteFriend(data:any) {
    window.location.href = "/"
  }

  useEffect(() => {
    const id = localStorage.getItem('id')
    if (id !== null) {
      http.get('/users/get', { params: { id } })
      .then((response) =>  {
        if (!response.data.logged || response.data.name === null)
          navigate('/login')
        else {
          setName(response.data.name)
          setEMail(response.data.email)
          setAvatar(response.data.avatar)
          setTfa(response.data.tfa)
          socket.io.opts.extraHeaders = { "Authorization": localStorage.getItem('jwt') as string }
          socket.connect()
          socket.on('invite-player', onInviteFriend)
        }
      })
      .catch(() => navigate('/login'))
    }
    else
      navigate('/login')
    return () => {
      socket.off('invite-player', onInviteFriend)
    }
  }, [])

  function onDropdownAction(key: React.Key) {
    switch (key) {
      case "settings":
        showSettings(true)
        break
      case "logout":
        http.post('/users/logout')
        .then(() => {
          socket.disconnect()
          localStorage.removeItem('id')
          localStorage.removeItem('jwt')
          navigate('/login')
        })
        .catch((exception) => alert(exception.response.data.message))
        break
    }
  }

  return (
    <>
      <Navbar isBordered css={{$$navbarContainerMaxWidth: '100%'}}>
        <Navbar.Brand>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/2048px-42_Logo.svg.png" style={{filter: 'invert(100%)'}} width={32}/>
          <Text size={14}>&nbsp;ft_transcendance</Text>
        </Navbar.Brand>
        <Navbar.Content variant="highlight-solid">
          {
            links.map((link, index) => (
              <Navbar.Link key={index} isActive={selectedLink === index} onClick={() => setSelectedLink(index)}>{link}</Navbar.Link>
            ))
          }
        </Navbar.Content>
        <Navbar.Content>
          <Dropdown>
            <Navbar.Item>
              <Dropdown.Trigger>
                <User src={avatar} name={name} description={email} zoomed pointer/>
              </Dropdown.Trigger>
            </Navbar.Item>
            <Dropdown.Menu aria-label="user-dropdown-menu" onAction={onDropdownAction}>
              <Dropdown.Item key="settings" description="Edit your profile" icon={<SettingsIcon/>}>Settings</Dropdown.Item>
              <Dropdown.Item key="logout" icon={<LogoutIcon/>} color="error" withDivider>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Content>
      </Navbar>
      <br/>
      {selectedLink === 0 && <Game/>}
      {selectedLink === 1 && <Network/>}
      <Settings bindings={settingsModal} setVisible={showSettings} avatar={avatar} tfa={tfa} setTfa={setTfa} strict={false}/>
    </>
  )
}
