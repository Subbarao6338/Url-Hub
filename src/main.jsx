import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '../css/style.css'

// Add Google Material Icons
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
document.head.appendChild(link);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
