import type { DeviceScene } from '../types/adapter-field'
import type { FormEngineAdapter } from '../types/adapter'

export function mergeJsxScope(
  desktopAdapter?: FormEngineAdapter,
  mobileAdapter?: FormEngineAdapter,
  scene?: DeviceScene,
  userScope?: Record<string, React.ComponentType>,
): Record<string, unknown> {
  return {
    scene,
    ...desktopAdapter?.jsxScope,
    ...mobileAdapter?.jsxScope,
    ...userScope,
  }
}
