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
    // 现代浏览器使用 addEventListener，旧版 Safari 回退到 addListener
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler)
    } else {
      // 旧版 Safari MediaQueryList 类型不包含 addListener
      (mql as any).addListener?.(handler)
    }

    return () => {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', handler)
      } else {
        // 旧版 Safari MediaQueryList 类型不包含 removeListener
        (mql as any).removeListener?.(handler)
      }
    }
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
