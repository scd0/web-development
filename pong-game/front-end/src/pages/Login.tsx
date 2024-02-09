import { useState, useEffect } from 'react'
import { Modal, Text, Button, Link, Loading, useModal, Input } from "@nextui-org/react";
import { delay } from '../packages/delay'
import { dotenv } from '../packages/dotenv';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { http } from '../packages/http';
import Settings from './Settings';

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [queryParameters] = useSearchParams()
  const navigate = useNavigate()
  const { setVisible: showTfa, bindings: tfaModal } = useModal();
  const { setVisible: showStranger, bindings: strangerModal } = useModal();
  const [qrcode, setQRCode] = useState("")
  const [token, setToken] = useState("")
  const [avatar, setAvatar] = useState("")
  const [stranger, setStranger] = useState(false)
  const [tfa, setTfa] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem('id')
    if (id !== null) {
      http.get('/users/get', { params: { id } })
      .then(() => navigate('/'))
      .catch(() => {})
    }

    const code = queryParameters.get("code")
    if (code !== null) {
      navigate('/login')
      http.post('/login', { code })
      .then((response) => {
        localStorage.setItem('id', response.data.id)
        setStranger(response.data.stranger)
        localStorage.setItem('jwt', response.data.jwt)
        if (response.data.tfa) {
          setQRCode(response.data.qrcode)
          showTfa(true)
        }
        else if (response.data.stranger)
          onShowStranger()
        else
          navigate('/')
      })
      .catch((exception) => alert(exception.response.data.message))
    }    
  }, [])

  async function onLoginButtonClick() {
    setLoading(true)
    await delay(1000)
    window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=" + dotenv.VITE_OAUTH_UID + "&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Flogin&response_type=code";
  }

  function onVerifyButtonClick() {
    http.post('/login/verify', { token })
    .then(() => {
      if (stranger)
        onShowStranger()
      else
        navigate('/')
    })
    .catch((exception) => alert(exception.response.data.message))
  }

  function onShowStranger() {
    http.get('/users/get', { params: { id: localStorage.getItem('id') } })
    .then((response) => {
      setAvatar(response.data.avatar)
      setTfa(response.data.tfa)
      showTfa(false)
      showStranger(true)
    })
    .catch((exception) => alert(exception.response.data.message))
  }

  return (
    <>
      <Modal open preventClose>
        <Modal.Header>
          <Text size={16}>ft_transcendance</Text>
        </Modal.Header>
        <Modal.Body>
          <Button css={{backgroundColor: 'black'}} onPress={onLoginButtonClick} disabled={loading}>
            {
              loading
              ?
              <Loading type="spinner" color="currentColor" size="sm"/>
              :
              <>
                <Text size={14} b>login with&nbsp;</Text>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/2048px-42_Logo.svg.png" style={{filter: 'invert(100%)'}} width={28}/>
              </>
            }
          </Button>
        </Modal.Body>
        <Modal.Footer justify="center">
          <Text size={12}>coded by</Text>
          <Link className="external-link" isExternal href="https://profile.intra.42.fr/users/avarnier" target="_blank" rel="noreferrer">avarnier</Link>
          <Text size={12}>/</Text>
          <Link className="external-link" isExternal href="https://profile.intra.42.fr/users/pblagoje" target="_blank" rel="noreferrer">pblagoje</Link>
          <Text size={12}>/</Text>
          <Link className="external-link" isExternal href="https://profile.intra.42.fr/users/lgaducew" target="_blank" rel="noreferrer">lgaducew</Link>
        </Modal.Footer>
      </Modal>
      <Modal preventClose {...tfaModal}>
        <Modal.Header>
          <Text size={16}>Two-Factor Authentication (2FA)</Text>
        </Modal.Header>
        <Modal.Body>
          <img className='qrcode-img' src={qrcode}/>
          <Input aria-label='code' placeholder='enter your 6-digit code' clearable bordered borderWeight='light' animated={false} onChange={(e) => setToken(e.target.value)}/>
        </Modal.Body>
        <Modal.Footer justify='center' css={{flexDirection: 'column'}}>
          <Button shadow onPress={onVerifyButtonClick}>Verify</Button>
          <div style={{display: 'flex'}}>
            <Text size={12} >use&nbsp;</Text>
            <Link className="external-link" isExternal href="https://support.google.com/accounts/answer/1066447?hl=fr&co=GENIE.Platform%3DAndroid" target="_blank" rel="noreferrer">Google Authenticator</Link>
            <Text size={12} >&nbsp;to authenticate</Text>
          </div>
        </Modal.Footer>
      </Modal>
      <Settings bindings={strangerModal} setVisible={showStranger} avatar={avatar} tfa={tfa} setTfa={setTfa} strict/>
    </>
  )
}
