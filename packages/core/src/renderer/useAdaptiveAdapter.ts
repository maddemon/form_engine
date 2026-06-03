import { useEffect, useState } from 'react'
import type { DeviceScene, FormEngineAdapter } from '../types/adapter'

/**
 * 根据设备宽度自动选择 desktop/mobile adapter
 *
 * 使用方式：
 * ```tsx
 * const adapter = useAdaptiveAdapter(antdAdapter, antdMobileAdapter)
 * <FormRender schema={schema} adapter={adapter} />
 * ```
 *
 * 默认断点：768px（可在第三个参数中自定义）
 */
export function useAdaptiveAdapter(
  desktop: FormEngineAdapter,
  mobile: FormEngineAdapter,
  breakpoint = 768,
): FormEngineAdapter {
  const [scene, setScene] = useState<DeviceScene>(() => detectScene(breakpoint))

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const handler = (e: MediaQueryListEvent) => {
      setScene(e.matches ? 'mobile' : 'desktop')
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])

  return scene === 'mobile' ? mobile : desktop
}

/**
 * 同步检测当前场景（SSR 安全）
 */
export function detectScene(breakpoint = 768): DeviceScene {
  if (typeof window === 'undefined') return 'desktop'
  return window.matchMedia(`(max-width: ${breakpoint}px)`).matches ? 'mobile' : 'desktop'
}
