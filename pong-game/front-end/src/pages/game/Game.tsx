import { Avatar, Button, Dropdown, Modal, Spacer, Text, Tooltip, useModal } from "@nextui-org/react";
import { useState,useEffect } from 'react'
import { http } from "../../packages/http";
import { socket } from "../../packages/socket";
import { IMatch, IUser, IVector } from "../../definitions";
import Canvas from "./Canvas";
import { Paddle } from "./Paddle";
import PADDLE_IMAGE from './images/paddle.jpg'
import BALL_IMAGE from './images/ball.jpg'
import { Ball } from "./Ball";

export default function Game() {
  const [selectedMap, setSelectedMap] = useState("space")
  const [started, setStarted] = useState(false)
  const [left, setLeft] = useState<IUser>()
  const [right, setRight] = useState<IUser>()
  var enemyY: number = 0
  var ballVector: IVector = { x: 0, y: 0 }
  const [leftScore, setLeftScore] = useState(0)
  const [rightScore, setRightScore] = useState(0)
  const [text, setText] = useState("")
  const { setVisible: showEndScreen, bindings: endScreenModal } = useModal();

  useEffect(() => {
    http.get('/match/is-matched', { params: {player: localStorage.getItem('id')}})
    .then((response) => {
      if (response.data.yeah)
          onMatchStart(response.data)
    })
    .catch(() => {})
  }, [])

  function gameLoop(data: any, screen: Canvas, paddle: Paddle, ball: Ball) {
    screen.clear()

    if (!globalThis.stopped) {
      if ((paddle.isMovingDown && paddle.pos.y + paddle.height < screen.canvas.height) || (paddle.isMovingUp && paddle.pos.y > 0)) {
        paddle.movePaddle()
        socket.emit('paddle-move', {receiver: data.match.left === localStorage.getItem('id') ? data.match.right : data.match.left, y: paddle.pos.y})
      }
  
      socket.emit('ball-move', data)
  
      if (data.match.left === localStorage.getItem('id')) {
        if (ballVector.x <= paddle.pos.x + paddle.width && ballVector.y >= paddle.pos.y && ballVector.y <= paddle.pos.y + paddle.height)
          socket.emit('ball-collided', { data, sender: data.match.left })
      }
      else {
        if (ballVector.x >= paddle.pos.x - paddle.width && ballVector.y >= paddle.pos.y && ballVector.y <= paddle.pos.y + paddle.height)
          socket.emit('ball-collided', { data, sender: data.match.right })
      }
  
      screen.drawImage(paddle, paddle.pos.x, paddle.pos.y)
      screen.drawImage(paddle, data.left.id === localStorage.getItem('id') ? screen.canvas.width - 16 - 5 : 5, enemyY)
      screen.drawImage(ball, ballVector.x, ballVector.y)
  
      requestAnimationFrame(() => gameLoop(data, screen, paddle, ball))
    }
    else
      return
  }

  function onMatchStart(data: any) {
    globalThis.stopped = false
    setStarted(true)
    setLeft(data.left)
    setRight(data.right)
    
    const screen = new Canvas('#canvas')
    const paddle = new Paddle(5, 16, 128, data.left.id === localStorage.getItem('id') ? { x: 5, y: 0 } : { x: screen.canvas.width - 16 - 5, y: 0 }, PADDLE_IMAGE)
    const ball = new Ball(5, 16, {x:400, y:300}, BALL_IMAGE)
    gameLoop(data, screen, paddle, ball)
  }

  function onPaddleMove(y: number) {
    enemyY = y
  }

  function onBallMove(data: any) {
    if (data && data.position) {
      ballVector = data.position
    }
  }

  function onGameOver(data: any) {
    globalThis.stopped = true
    setStarted(false)
    setText("Game Over !")
    setLeftScore(data.value.leftScore)
    setRightScore(data.value.rightScore)

    if (data.left === localStorage.getItem('id') && data.value.leftScore === 2) {
      http.post('/users/update-stats', { id: data.left, won: true })
      .then(() => {
        http.post('/users/update-stats', { id: data.right, won: false })
        .then(() => {})
        .catch((exception) => alert(exception.response.data.message))
      })
      .catch((exception) => alert(exception.response.data.message))
    }
    else if (data.right === localStorage.getItem('id') && data.value.rightScore === 2) {
      http.post('/users/update-stats', { id: data.left, won: false })
      .then(() => {
        http.post('/users/update-stats', { id: data.right, won: true })
        .then(() => {})
        .catch((exception) => alert(exception.response.data.message))
      })
      .catch((exception) => alert(exception.response.data.message))
    }

    showEndScreen(true)
  }

  useEffect(() => {
    socket.on('find-match', onMatchStart)
    socket.on('paddle-move', onPaddleMove)
    socket.on('ball-move', onBallMove)
    socket.on('game-over', onGameOver)
    return () => {
      socket.off('find-match', onMatchStart)
      socket.off('paddle-move', onPaddleMove)
      socket.off('ball-move', onBallMove)
      socket.off('game-over', onGameOver)
    }
  }, [])

  function onFindMatch() {
    http.post('/match', { player: localStorage.getItem('id') })
    .then((response) => socket.emit('find-match', response.data))
    .catch((exception) => alert(exception.response.data.message))
  }

  return (
    <>
      <div className="game-div">
        {
          started &&
          <Avatar src={left?.avatar} size="xl"/>
        }
        <canvas id="canvas" width="800" height="600" style={{background: "url('./src/pages/game/images/" + selectedMap + ".jpg')" }}>
          Your browser does not support the canvas element.
        </canvas>
        {
          started &&
          <Avatar src={right?.avatar} size="xl"/>
        }
      </div>
      <br/>
      <div className="game-div">
        <Tooltip content={"Select a map and find a match! Use keyboard arrows to move!"} hideArrow>
          <Button auto flat disabled>
            Rules
          </Button>
        </Tooltip>
        <Spacer x={0.5}/>
        <Dropdown>
          <Dropdown.Button flat css={{ tt: "capitalize" }}>
            Map
          </Dropdown.Button>
          <Dropdown.Menu aria-label="map-dropdown" disallowEmptySelection selectionMode="single" selectedKeys={selectedMap} onAction={(e) => setSelectedMap(e.toString())}>
            <Dropdown.Item key="default">Default</Dropdown.Item>
            <Dropdown.Item key="space">Space</Dropdown.Item>
            <Dropdown.Item key="underwater">Underwater</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Spacer x={0.5}/>
        <Button shadow auto onPress={onFindMatch} disabled={started}>Find a Match</Button>
      </div>
      <Modal preventClose {...endScreenModal}>
        <Modal.Header>
          <Text size={18}>{text}</Text>
        </Modal.Header>
        <Modal.Body>
          <div style={{display: "flex", justifyContent: 'center'}}>
            <Text size={16}>{leftScore} - {rightScore}</Text>
          </div>
        </Modal.Body>
        <Modal.Footer justify="center">
          <Button shadow onPress={() => window.location.reload()}>Continue</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
