import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const HtmlField: FieldRendererFn = (props: FieldComponentProps) => {
  const { content, style, className, id, ...rest } = props
  return (
    <div
      id={id}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: content ?? '' }}
      {...rest}
    />
  )
}
