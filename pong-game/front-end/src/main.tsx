import ReactDOM from 'react-dom/client'
import './index.css'
import { NextUIProvider } from '@nextui-org/react'
import { createTheme } from "@nextui-org/react"
import { BrowserRouter } from 'react-router-dom'
import App from './App'

const darkTheme = createTheme({
  type: 'dark',
  theme: {
    colors: {
      background: 'linear-gradient(to right, #0f0c29, #302b63, #24243e)'
    },
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <NextUIProvider theme={darkTheme}>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </NextUIProvider>
)
