import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HandProvider } from './context/HandContext'

window.onerror = function (msg, url, line, col, error) {
  console.error("Global Error:", msg, url, line);
  const div = document.getElementById('debug-box') || document.createElement('div');
  if (!document.getElementById('debug-box')) {
    div.id = 'debug-box';
    div.style.position = 'fixed'; div.style.bottom = '0'; div.style.left = '0'; div.style.width = '100%';
    div.style.background = 'rgba(255,0,0,0.9)'; div.style.color = 'white';
    div.style.zIndex = '9999'; div.style.padding = '10px'; div.style.fontSize = '11px'; div.style.maxHeight = '150px'; div.style.overflow = 'auto'; div.style.fontFamily = 'monospace';
    document.body.appendChild(div);
  }
  div.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ERR: ${msg} (${line}:${col})</div>`;
  return false;
};

console.log("Main: Initializing React root...");
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <HandProvider>
      <App />
    </HandProvider>
  );
  console.log("Main: React root rendered.");
} else {
  console.error("Main: Root element not found!");
}

