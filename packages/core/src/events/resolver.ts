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
  EventCallbacks,
  EventDeclaration,
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
  /** 宿主传入的回调表（供 callback 类型 handler 查表，签名由使用者决定） */
  callbacks: EventCallbacks
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
  callbacks: EventCallbacks,
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
  callbacks: EventCallbacks,
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
 * eventDeclarations 用于判断异步事件：
 * - async=true 的事件：保留回调返回值，透传给组件（如 beforeUpload）
 * - 其他事件：丢弃返回值，不阻塞 UI
 */
export function resolveEvents(
  events: FormFieldEvents | undefined,
  $self: $Self,
  $form: $Form,
  callbacks: EventCallbacks,
  eventDeclarations?: EventDeclaration[],
): Record<string, ResolvedEventHandler> {
  if (!events) return {}

  const asyncEventNames = new Set<string>()
  if (eventDeclarations) {
    for (const decl of eventDeclarations) {
      if (decl.async) asyncEventNames.add(decl.name)
    }
  }

  const result: Record<string, ResolvedEventHandler> = {}
  for (const [name, handler] of Object.entries(events)) {
    if (!handler) continue
    const resolved = resolveEventHandler(handler, $self, $form, undefined, callbacks)
    if (asyncEventNames.has(name)) {
      result[name] = resolved
    } else {
      result[name] = (...args: unknown[]) => {
        resolved(...args)
      }
    }
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
