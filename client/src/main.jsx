import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

console.log('Main.jsx: Starting mount...');
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Main.jsx: Root element #root not found!');
} else {
  console.log('Main.jsx: Found root element, rendering...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
  console.log('Main.jsx: Render called.');
}
