/**
 * 事件解析引擎
 *
 * 负责将 FormFieldEvents 中的 EventHandler 配置解析为真实的回调函数。
 * - expression：构建 $self/$form/$event 上下文，复用 evalExpr 执行
 * - action：查表映射到预定义动作（详见 ./actions.ts）
 * - callback：查表映射到 EventContext.callbacks 中的函数
 *
 * 错误处理统一走 console.warn 跳过（详见 docs/event-system-design.md 第 10 节）
 */

import { evalExpr } from '../utils'
import type {
  EventHandler,
  FormFieldEvents,
  $Form,
  $Self,
  ResolvedEventHandler,
} from '../types/events'
import { invokeAction } from './actions'

/**
 * 事件上下文
 * 由 FormRender 装配后通过 props 注入 FieldRenderer
 */
export interface EventContext {
  /** 整体 formValues（只读拷贝，写请用 setFieldValue） */
  formValues: Record<string, unknown>
  /** $form API */
  $form: $Form
  /** 宿主传入的回调表（供 callback 类型 handler 查表） */
  callbacks: Record<string, (...args: any[]) => void>
}

/**
 * 创建 expression handler
 * 注入 $self / $form / $event 到作用域
 */
function createExpressionHandler(
  expression: string,
  $self: $Self,
  $form: $Form,
  $event: unknown,
): ResolvedEventHandler {
  return (...args: unknown[]) => {
    const context: Record<string, unknown> = {
      $self,
      $form,
      $event: args.length === 1 ? args[0] : args,
    }
    try {
      return evalExpr(expression, context)
    } catch (err) {
      console.warn(`[form-engine] 表达式执行失败: ${expression}`, err)
      return undefined
    }
  }
}

/**
 * 创建 action handler
 */
function createActionHandler(
  action: string,
  params: Record<string, unknown> | undefined,
  $form: $Form,
): ResolvedEventHandler {
  return () => {
    invokeAction(action, params, $form)
  }
}

/**
 * 创建 callback handler
 */
function createCallbackHandler(
  callback: string,
  callbacks: Record<string, (...args: any[]) => void>,
): ResolvedEventHandler {
  return (...args: unknown[]) => {
    const fn = callbacks[callback]
    if (typeof fn !== 'function') {
      console.warn(`[form-engine] 回调不存在: ${callback}`)
      return undefined
    }
    return fn(...args)
  }
}

/**
 * 解析单个 EventHandler
 */
export function resolveEventHandler(
  handler: EventHandler,
  $self: $Self,
  $form: $Form,
  $event: unknown,
  callbacks: Record<string, (...args: any[]) => void>,
): ResolvedEventHandler {
  switch (handler.type) {
    case 'expression':
      return createExpressionHandler(
        handler.expression || '',
        $self,
        $form,
        $event,
      )
    case 'action':
      return createActionHandler(
        handler.action || '',
        handler.params,
        $form,
      )
    case 'callback':
      return createCallbackHandler(
        handler.callback || '',
        callbacks,
      )
    default:
      // 未知 type：返回空函数，避免上层 spread 时炸掉
      return () => undefined
  }
}

/**
 * 解析 field.events 全部配置
 * 返回以事件名为 key 的回调表（未配置的事件不会出现在结果中）
 *
 * 注意：本函数仅做静态解析（基于 events 配置），
 * 不绑定 $event；$event 在事件实际触发时由调用方注入。
 * 为简化接口，expression 在此阶段不携带 $event，触发时再回填。
 */
export function resolveEvents(
  events: FormFieldEvents | undefined,
  $self: $Self,
  $form: $Form,
  callbacks: Record<string, (...args: any[]) => void>,
): Record<string, ResolvedEventHandler> {
  if (!events) return {}

  const result: Record<string, ResolvedEventHandler> = {}
  for (const [name, handler] of Object.entries(events)) {
    if (!handler) continue
    result[name] = resolveEventHandler(handler, $self, $form, undefined, callbacks)
  }
  return result
}

/**
 * 包装单个事件回调：注入 $event 后再调用解析后的 handler
 * 用于 FieldRenderer 中 onClick/onBlur 等非 onChange 事件
 */
export function bindEventArgs(
  handler: ResolvedEventHandler | undefined,
): ResolvedEventHandler | undefined {
  if (!handler) return undefined
  // 当前实现：handler 内部通过参数透传拿 $event
  // 后续如需更精细的 $event 包装，可在此扩展
  return handler
}
