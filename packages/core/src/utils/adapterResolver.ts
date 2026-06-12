import type { DeviceScene } from '../types/adapter-field'
import type { FormEngineAdapter } from '../types/adapter'

/**
 * 根据 scene 选取 adapter
 *
 * 规则：
 * - 两个都传 → 按 scene 匹配；无匹配时降级到另一个
 * - 只传一个 → 无论 scene 都返回它
 * - 都没传 → 返回 null
 */
export function pickAdapter(
  desktop: FormEngineAdapter | undefined,
  mobile: FormEngineAdapter | undefined,
  scene: DeviceScene,
): FormEngineAdapter | null {
  if (desktop && mobile) {
    return scene === 'mobile' ? mobile : desktop
  }
  return desktop ?? mobile ?? null
}
