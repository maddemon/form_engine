import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 测试：不导入 antd adapter，使用默认 HTML 组件
// import '@form-engine/adapter-antd'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
