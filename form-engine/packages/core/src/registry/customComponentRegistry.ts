/**
 * 自定义组件注册表实现
 * 管理自定义组件的注册、查询和分组
 */

import type {
  CustomComponentConfig,
  CustomComponentRegistry,
  CustomPropertyWidgetRegistry,
  PropertyWidgetComponentProps,
} from '../types/custom-component'

/**
 * 自定义组件注册表（单例）
 */
class CustomComponentRegistryImpl implements CustomComponentRegistry {
  private components: Map<string, CustomComponentConfig> = new Map()

  register(config: CustomComponentConfig): void {
    if (this.components.has(config.type)) {
      console.warn(`[Form Engine] 自定义组件 "${config.type}" 已注册，将被覆盖。`)
    }
    this.components.set(config.type, {
      category: '自定义', // 默认分类
      ...config,
    })
  }

  registerMany(configs: CustomComponentConfig[]): void {
    for (const config of configs) {
      this.register(config)
    }
  }

  get(type: string): CustomComponentConfig | undefined {
    return this.components.get(type)
  }

  getAll(): CustomComponentConfig[] {
    return Array.from(this.components.values())
  }

  getGrouped(): Record<string, CustomComponentConfig[]> {
    const grouped: Record<string, CustomComponentConfig[]> = {}
    
    for (const config of this.components.values()) {
      const category = config.category || '自定义'
      if (!grouped[category]) {
        grouped[category] = []
      }
      if (!config.disabled) {
        grouped[category].push(config)
      }
    }
    
    return grouped
  }

  has(type: string): boolean {
    return this.components.has(type)
  }

  unregister(type: string): void {
    this.components.delete(type)
  }

  clear(): void {
    this.components.clear()
  }
}

/**
 * 自定义属性 Widget 注册表（单例）
 */
class CustomPropertyWidgetRegistryImpl implements CustomPropertyWidgetRegistry {
  private widgets: Map<string, React.ComponentType<PropertyWidgetComponentProps>> = new Map()

  register(name: string, component: React.ComponentType<PropertyWidgetComponentProps>): void {
    if (this.widgets.has(name)) {
      console.warn(`[Form Engine] 自定义属性 Widget "${name}" 已注册，将被覆盖。`)
    }
    this.widgets.set(name, component)
  }

  get(name: string): React.ComponentType<PropertyWidgetComponentProps> | undefined {
    return this.widgets.get(name)
  }

  has(name: string): boolean {
    return this.widgets.has(name)
  }

  unregister(name: string): void {
    this.widgets.delete(name)
  }

  clear(): void {
    this.widgets.clear()
  }
}

// 导出单例实例
export const customComponentRegistry = new CustomComponentRegistryImpl()
export const customPropertyWidgetRegistry = new CustomPropertyWidgetRegistryImpl()

// 重新导出类型
export type { CustomComponentRegistry, CustomPropertyWidgetRegistry }
