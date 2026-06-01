import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 导入各适配器（副作用：注册组件映射）
import '@form-engine/adapter-antd'
import '@form-engine/adapter-antd-mobile'

// 导入场景检测 API
import { autoDetectScene, getScene, setScene } from '@form-engine/core'

// 初始化场景（根据窗口宽度自动检测 desktop/mobile）
function initScene() {
  const scene = autoDetectScene()
  setScene(scene)
  console.log(`[Form Engine] 当前场景: ${scene} (width: ${window.innerWidth}px)`)
}

// 初始化
initScene()

// 监听窗口大小变化，自动切换场景
window.addEventListener('resize', () => {
  const scene = autoDetectScene()
  setScene(scene)
  const current = getScene()
  console.log(`[Form Engine] 场景切换: ${scene} (width: ${window.innerWidth}px), getScene()=${current}`)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
