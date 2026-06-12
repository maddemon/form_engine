import { useState } from 'react'
import type { DeviceScene } from '../../types/adapter-field'

/**
 * 场景切换 Hook
 *
 * @example
 * ```tsx
 * const [scene, setScene] = useDesignerScene()
 * ```
 */
export function useDesignerScene(initialScene: DeviceScene = 'desktop') {
  const [scene, setScene] = useState<DeviceScene>(initialScene)
  return [scene, setScene] as const
}
