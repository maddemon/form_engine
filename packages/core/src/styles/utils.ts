/**
 * Form Engine - Style Utilities
 *
 * 公共工具函数，消除多处重复定义
 */

/**
 * 将驼峰命名转换为短横线命名
 * camelCase -> camel-case
 */
export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}