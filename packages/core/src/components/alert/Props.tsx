import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'
import iconMap from '../icons'

const iconOptions = Object.keys(iconMap).map(name => ({ label: name, value: name }))

export default function AlertPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="类型">
        <w.Select
          value={(values.type as string) ?? 'info'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: '主要', value: 'primary' },
            { label: '信息', value: 'info' },
            { label: '成功', value: 'success' },
            { label: '警告', value: 'warning' },
            { label: '错误', value: 'error' },
          ]}
        />
      </FieldItem>
      <FieldItem label="标题">
        <w.Input value={(values.title as string) ?? ''} onChange={(v) => onChange('title', v)} placeholder="可选标题" />
      </FieldItem>
      <FieldItem label="内容">
        <w.Input value={(values.content as string) ?? ''} onChange={(v) => onChange('content', v)} placeholder="提示内容" />
      </FieldItem>
      <FieldItem label="显示图标">
        <w.Switch checked={values.showIcon !== false} onChange={(v) => onChange('showIcon', v)} />
      </FieldItem>
      <FieldItem label="可关闭">
        <w.Switch checked={!!values.closable} onChange={(v) => onChange('closable', v)} />
      </FieldItem>
      <FieldItem label="自定义图标">
        <w.Select
          value={(values.icon as string) ?? ''}
          onChange={(v) => onChange('icon', v)}
          options={[{ label: '无', value: '' }, ...iconOptions]}
        />
      </FieldItem>
    </>
  )
}
