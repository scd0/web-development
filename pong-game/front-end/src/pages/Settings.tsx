import { Avatar, Button, Input, Modal, Switch, SwitchEvent, Text } from "@nextui-org/react";
import { useState } from "react";
import { http } from "../packages/http";
import { useNavigate } from "react-router-dom";

interface ISettings {
  bindings: any;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  avatar: string;
  tfa: boolean;
  setTfa: React.Dispatch<React.SetStateAction<boolean>>;
  strict: boolean;
}

export default function Settings({ bindings, setVisible, avatar, tfa, setTfa, strict }: ISettings) {
  const [name, setName] = useState("")
  const [file, setFile] = useState<File>()
  const navigate = useNavigate()

  function onSaveButtonClick() {
    if (strict && name.length === 0)
      alert('Name field is required')
    else {
      http.post('/users/edit', { id: localStorage.getItem('id'), name, tfa })
      .then(() => {
        if (file) {
          let fd = new FormData();
          fd.append('avatar', file)
          http.post('users/edit-avatar', fd)
          .then(() => whenSaveDone())
          .catch((exception) => alert(exception.response.data.message))
        }
        else
          whenSaveDone()
      })
      .catch((exception) => alert(exception.response.data.message))
    }
  }

  function whenSaveDone() {
    if (strict)
      navigate('/')
    else {
      window.location.reload()
    }
  }

  return (
    <Modal preventClose closeButton={!strict} {...bindings}>
      <Modal.Header>
        <Text size={16}>Settings</Text>
      </Modal.Header>
      <Modal.Body>
        <Input aria-label='name' placeholder='enter your name' clearable bordered borderWeight='light' animated={false} onChange={(e) => setName(e.target.value)}/>
        <div style={{display: 'flex'}}>
          <Avatar size="xl" src={avatar} color="primary" bordered zoomed/>
          <input style={{paddingTop: '20px', paddingLeft: '10px'}} type='file' accept="image/jpeg" onChange={e => {if (!e.target.files) return; setFile(e.target.files[0])}}/>
        </div>
        <div style={{display: 'flex'}}>
          <Switch size='xl' shadow  initialChecked={tfa} onChange={(e: SwitchEvent) => setTfa(e.target.checked)}/>
          <Text css={{paddingTop: '5px', paddingLeft: '10px'}}>Two-Factor Authentication (2FA)</Text>
        </div>
      </Modal.Body>
      <Modal.Footer justify='center'>
        <Button shadow onPress={onSaveButtonClick}>Save</Button>
      </Modal.Footer>
    </Modal>
  )
}
