import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './App.css'
import './css/Mobile.css'
import '@src/css/animations.css'
import '@src/css/homeStyles.css'

createRoot(document.getElementById('root')).render(
 // <StrictMode>
    <App />
 // </StrictMode>,
)
