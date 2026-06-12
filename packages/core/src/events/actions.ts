/**
 * 预定义 action 注册表
 *
 * action 是 expression 的"快捷方式"：在 resolver 中由查表分派。
 * 业务扩展：只需在此追加一行，resolver 主流程无需修改。
 *
 * type 字段决定调用方式：
 * - 'method'：直接调用 $form[action](...params)
 * - 'expression'：拼装 expression 字符串后用 evalExpr 执行（用于需要拼接逻辑的复杂动作）
 */

import type { $Form } from '../types/events'

export interface ActionDef {
  /**
   * 动作名（在 EventHandler.action 中使用）
   */
  name: string
  /**
   * 调用方式
   * - 'method'：$form[name](params)
   * - 'expression'：evalExpr 组装后的字符串
   */
  invoke: 'method' | 'expression'
  /**
   * 期望参数键列表（仅文档/校验用，运行时不强校验）
   * 例如 ['name', 'value']
   */
  params?: string[]
}

const ACTIONS: ActionDef[] = [
  { name: 'submit', invoke: 'method' },
  { name: 'reset', invoke: 'method' },
  { name: 'validate', invoke: 'method', params: ['name'] },
  { name: 'setFieldValue', invoke: 'method', params: ['name', 'value'] },
]

const ACTIONS_BY_NAME: Record<string, ActionDef> = ACTIONS.reduce(
  (acc, def) => {
    acc[def.name] = def
    return acc
  },
  {} as Record<string, ActionDef>,
)

/**
 * 查找 action 定义
 */
export function getActionDef(name: string): ActionDef | undefined {
  return ACTIONS_BY_NAME[name]
}

/**
 * 列出所有已注册 action 名（供设计器下拉框渲染）
 */
export function listActionNames(): string[] {
  return ACTIONS.map(a => a.name)
}

/**
 * 将 action 调用翻译为对 $form 的方法调用
 * 仅支持 invoke='method' 的 action
 */
export function invokeAction(
  name: string,
  params: Record<string, unknown> | undefined,
  $form: $Form,
): void {
  const def = getActionDef(name)
  if (!def) {
    console.warn(`[form-engine] 未知 action: ${name}`)
    return
  }
  if (def.invoke !== 'method') {
    console.warn(`[form-engine] action ${name} 不支持 method 调用方式`)
    return
  }
  switch (name) {
    case 'submit':
      $form.submit()
      return
    case 'reset':
      $form.reset()
      return
    case 'validate':
      $form.validate(params?.name as string | undefined)
      return
    case 'setFieldValue':
      $form.setFieldValue(params?.name as string, params?.value)
      return
    default:
      console.warn(`[form-engine] action ${name} 不是内置方法`)
      return
  }
}