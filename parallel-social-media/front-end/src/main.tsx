import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import {NextUIProvider} from '@nextui-org/react'

import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/providers/theme-provider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <NextUIProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NextUIProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
