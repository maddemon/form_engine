import { useCallback, useMemo } from 'react'
import { getEventDeclarations } from '../../components'
import { resolveEvents, type EventContext } from '../../events'
import type { FieldComponentProps } from '../../types/adapter-field'
import type { $Self, ResolvedEventHandler } from '../../types/events'
import type { FormFieldSchema, OptionItem } from '../../types/schema'

export interface UseFieldPropsArgs {
  field: FormFieldSchema
  value: unknown
  onChange: (val: unknown) => void
  /** 已被 useFieldOptions 解析过的 options */
  resolvedOptions: OptionItem[]
  isDisabled: boolean
  isRequired: boolean
  errorMsg: string | undefined
  /** 事件上下文（由 FormRender 注入；不传时事件系统降级为 no-op） */
  eventContext?: EventContext
}

export type FieldRendererFieldProps = FieldComponentProps & Record<string, unknown>

export interface UseFieldPropsResult {
  fieldProps: FieldRendererFieldProps
  /** 包装后的 onChange：先更新字段值，再执行用户事件；JsxRender 也直接使用 */
  handleChange: (newValue: unknown) => void
}

/**
 * FieldRenderer 字段 props 组装 Hook
 *
 * 整合以下职责（提取自 FieldRenderer 内部逻辑）：
 * - 构造 $self 上下文（用于事件表达式）
 * - 解析事件处理器
 * - 包装 onChange：先更新当前字段值，再执行用户事件
 * - 合并 componentProps（去除 options 字段，避免与外层 resolvedOptions 冲突）
 * - 合并内置 props 与 eventHandlers
 */
export function useFieldProps({
  field,
  value,
  onChange,
  resolvedOptions,
  isDisabled,
  isRequired,
  errorMsg,
  eventContext,
}: UseFieldPropsArgs): UseFieldPropsResult {
  const $self: $Self = useMemo(
    () => ({
      name: field.name,
      value,
      schema: field,
      props: {
        disabled: isDisabled,
        readOnly: !!field.readOnly,
        placeholder: field.placeholder,
      },
    }),
    [value, field, isDisabled],
  )

  const eventHandlers: Record<string, ResolvedEventHandler> = useMemo(
    () =>
      eventContext
        ? resolveEvents(
            field.events,
            $self,
            eventContext.$form,
            eventContext.callbacks,
            getEventDeclarations(field.type),
          )
        : {},
    [eventContext, field.events, field.type, $self],
  )

  // onChange 包装：先更新当前字段值，再执行用户事件
  // IME 组合输入由各 adapter 通过 nativeEvent.isComposing 自行拦截
  const handleChange = useCallback(
    (newValue: unknown) => {
      onChange(newValue)
      eventHandlers.onChange?.(newValue)
    },
    [onChange, eventHandlers],
  )

  // 去掉 componentProps.options，避免与外层 resolvedOptions 冲突
  const componentProps = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { options: _options, ...rest } = field.componentProps || {}
    return rest
  }, [field.componentProps])

  return useMemo<UseFieldPropsResult>(
    () => ({
      fieldProps: {
        value,
        onChange: handleChange,
        disabled: isDisabled,
        readOnly: field.readOnly,
        placeholder: field.placeholder,
        options: resolvedOptions,
        fieldSchema: field,
        required: isRequired,
        rules: field.rules,
        validateStatus: errorMsg ? 'error' : undefined,
        help: errorMsg,
        ...componentProps,
        ...eventHandlers,
      },
      handleChange,
    }),
    [value, handleChange, isDisabled, resolvedOptions, field, isRequired, errorMsg, eventHandlers, componentProps],
  )
}
