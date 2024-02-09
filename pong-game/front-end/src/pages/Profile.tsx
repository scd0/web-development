import { Badge, Grid, Modal, Text, User } from "@nextui-org/react";
import { useEffect, useState } from 'react'
import { http } from "../packages/http";
import LossIcon from "../icons/LossIcon";
import WinIcon from "../icons/WinIcon";
import { IMatch, IUser, Statistic } from "../definitions";

interface IProfile {
  bindings?: any;
  id: string;
}

export default function Profile({ bindings, id }: IProfile) {
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("")
  const [email, setEMail] = useState("")
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [stats, setStats] = useState<Statistic[]>([])

  useEffect(() => {
    http.get('/users/get', { params: { id: id } })
    .then((response) => {
      setName(response.data.name)
      setAvatar(response.data.avatar)
      setEMail(response.data.email)
      setWins(response.data.wins)
      setLosses(response.data.losses)
      http.get('/match', { params: {player:id}})
      .then((response) => setStats(response.data))
      .catch((exception) => alert(exception.response.data.message))
    })
    .catch((exception) => alert(exception.response.data.message))
  }, [])

  return (
    <Modal preventClose closeButton blur {...bindings}>
      <Modal.Header>
        <Text size={16}>{name}'s Profile</Text>
      </Modal.Header>
      <Modal.Body>
        <User src={avatar} name={name} description={email} zoomed pointer size="xl"/>
        <Grid.Container alignItems="center" gap={2}>
        <Grid css={{marginLeft: "auto", marginRight:"auto"}}>
          <Badge color="success" content={wins} shape="circle">
            <WinIcon />
          </Badge>
        </Grid>
        <Grid css={{marginLeft: "auto", marginRight:"auto"}}>
          <Badge color="error" content={losses} shape="circle">
            <LossIcon />
          </Badge>
        </Grid>
      </Grid.Container>
      <div style={{textAlign: 'center'}}>
        {
          stats.map((stat, index) => (
            <Text key={index} size={14}>{stat.left ? name : stat.enemy.name} {stat.match.score} {stat.left ? stat.enemy.name : name}</Text>
          ))
        }
      </div>
      </Modal.Body>
    </Modal>
  )
}
