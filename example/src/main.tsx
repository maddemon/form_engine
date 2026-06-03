import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 场景由 App.tsx 中的 Designer/FormRender 显式控制，无需全局注册

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
