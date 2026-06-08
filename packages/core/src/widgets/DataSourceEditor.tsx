import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useStyle } from '../styles'
import type { FieldDataSource, OptionItem } from '../types/schema'
import { WidgetButton } from './Button'
import { WidgetButtonGroup } from './ButtonGroup'
import { Divider } from './Divider'
import { WidgetInput } from './Input'
import { WidgetModal } from './Modal'
import { SortableTableEditor } from './SortableTableEditor'
import { Space } from './Space'
import { TagLabel } from './TagLabel'
import { Text } from './Text'
import { WidgetTextArea } from './TextArea'
import { WidgetTreeDataEditor } from './TreeDataEditor'

function parseUrlDeps(url: string): string[] {
  const regex = /\{(\w+)\}/g
  const deps: string[] = []
  let match
  while ((match = regex.exec(url)) !== null) {
    if (!deps.includes(match[1])) deps.push(match[1])
  }
  return deps
}

function toFlatLines(options: OptionItem[]): string {
  return options.map((o) => `${o.label} ${o.value}`).join('\n')
}

function fromFlatLines(text: string): OptionItem[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split(/\s+/)
      const label = parts[0] || ''
      const value = parts.length > 1 ? parts[1] : label
      return { label, value }
    })
}

// ============================
// 批量编辑弹窗
// ============================

function BatchEditModal({
  open,
  options,
  onConfirm,
  onCancel,
}: {
  open: boolean
  options: OptionItem[]
  onConfirm: (v: OptionItem[]) => void
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const prevOpenRef = useRef(false)

  React.useEffect(() => {
    if (open && !prevOpenRef.current) {
      setText(options.length > 0 ? toFlatLines(options) : '')
    }
    prevOpenRef.current = open
  }, [open, options])

  const handleConfirm = () => {
    onConfirm(fromFlatLines(text))
  }

  return (
    <WidgetModal open={open} title="批量编辑" width="sm" onCancel={onCancel} onConfirm={handleConfirm}>
      <Text type="tertiary" style={{ marginBottom: '8px' }}>
        每行一个选项，标签和值之间用空格隔开（多个空格算一个）：
        <div style={{ marginTop: '4px', lineHeight: 1.6 }}>
          选项1 1<br />
          选项2 2
        </div>
      </Text>
      <WidgetTextArea value={text} onChange={setText} rows={12} />
    </WidgetModal>
  )
}

// ============================
// 远程配置弹窗
// ============================

function RemoteConfigModal({
  open,
  config,
  onConfirm,
  onCancel,
}: {
  open: boolean
  config: { url: string; resultPath: string; labelField: string; valueField: string }
  onConfirm: (config: { url: string; resultPath: string; labelField: string; valueField: string }) => void
  onCancel: () => void
}) {
  const { token } = useStyle()
  const [url, setUrl] = useState('')
  const [resultPath, setResultPath] = useState('')
  const [labelField, setLabelField] = useState('name')
  const [valueField, setValueField] = useState('id')
  const prevOpenRef = useRef(false)
  const [touched, setTouched] = useState(false)

  const deps = useMemo(() => parseUrlDeps(url), [url])

  React.useEffect(() => {
    if (open && !prevOpenRef.current) {
      setUrl(config.url || '')
      setResultPath(config.resultPath || '')
      setLabelField(config.labelField || 'name')
      setValueField(config.valueField || 'id')
      setTouched(false)
    }
    prevOpenRef.current = open
  }, [open, config])

  const handleConfirm = () => {
    onConfirm({ url, resultPath, labelField, valueField })
  }

  return (
    <WidgetModal open={open} title="远程数据源" width="sm" onCancel={onCancel} onConfirm={handleConfirm}>
      <Space direction="vertical" gap="sm" align="stretch" style={{ width: '100%' }}>
        <div>
          <Text type="secondary" style={{ marginBottom: token('spacingXs') }}>
            接口地址（GET）
          </Text>
          <WidgetInput
            value={url}
            onChange={(v) => {
              setUrl(v as string)
              setTouched(true)
            }}
            placeholder="/api/options?parentId={parentField}"
            style={{ padding: '3px 6px' }}
          />
          <Text type="tertiary" style={{ marginTop: '2px' }}>
            用 <code>{`{fieldName}`}</code> 引用其他字段的值作为参数
          </Text>
        </div>

        {touched && url && deps.length > 0 && (
          <div>
            <Text type="secondary" style={{ marginBottom: token('spacingXs') }}>
              依赖字段
            </Text>
            <Space gap="xs" wrap align="start" style={{ width: '100%' }}>
              {deps.map((dep) => (
                <TagLabel key={dep} variant="secondary">
                  {dep}
                </TagLabel>
              ))}
            </Space>
            <Text type="tertiary" style={{ marginTop: '2px' }}>
              依赖字段的值变化时自动重新请求
            </Text>
          </div>
        )}

        <Divider />
        <div>
          <Text type="secondary" style={{ marginBottom: token('spacingSm') }}>
            响应映射
          </Text>
          <Space direction="vertical" gap="sm" align="stretch" style={{ width: '100%' }}>
            <div>
              <Text type="tertiary" style={{ marginBottom: '2px' }}>
                列表路径
              </Text>
              <WidgetInput
                value={resultPath}
                onChange={(v) => setResultPath(v as string)}
                placeholder="data.list 或留空取根"
                style={{ padding: '3px 6px' }}
              />
            </div>
            <Space gap="sm" align="stretch" style={{ width: '100%' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text type="tertiary" style={{ marginBottom: '2px' }}>
                  标签字段
                </Text>
                <WidgetInput
                  value={labelField}
                  onChange={(v) => setLabelField(v as string)}
                  placeholder="name"
                  style={{ padding: '3px 6px' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text type="tertiary" style={{ marginBottom: '2px' }}>
                  值字段
                </Text>
                <WidgetInput
                  value={valueField}
                  onChange={(v) => setValueField(v as string)}
                  placeholder="id"
                  style={{ padding: '3px 6px' }}
                />
              </div>
            </Space>
          </Space>
        </div>
      </Space>
    </WidgetModal>
  )
}

// ============================
// DataSourceEditor 主组件
// ============================

const SOURCE_TYPE_OPTIONS = [
  { label: '静态数据', value: 'static' },
  { label: '远程数据', value: 'remote' },
]

function WidgetDataSourceEditorInner({
  value,
  onChange,
  disabled,
  style,
  optionsType = 'flat',
}: {
  value?: FieldDataSource
  onChange?: (v: FieldDataSource) => void
  disabled?: boolean
  style?: React.CSSProperties
  optionsType?: 'flat' | 'tree'
}) {
  const { token } = useStyle()
  const [dsType, setDsType] = useState<'static' | 'remote'>(value?.type || 'static')
  const [remoteModalOpen, setRemoteModalOpen] = useState(false)
  const [batchOpen, setBatchOpen] = useState(false)

  const staticOptions = useMemo<OptionItem[]>(() => {
    if (value?.type === 'static') return value.static.options || []
    return []
  }, [value])

  const handleStaticChange = useCallback(
    (newOptions: OptionItem[]) => {
      onChange?.({ type: 'static', static: { options: newOptions } })
    },
    [onChange],
  )

  interface TableOptionItem {
    id: string
    label: string
    value: string | number
  }

  const tableItems = useMemo<TableOptionItem[]>(
    () => staticOptions.map((o, i) => ({ ...o, id: String(i) })),
    [staticOptions],
  )

  const handleTableChange = useCallback(
    (items: TableOptionItem[]) => {
      handleStaticChange(items.map(({ id: _, ...opt }) => opt))
    },
    [handleStaticChange],
  )

  const handleAddOption = useCallback(() => {
    handleStaticChange([...staticOptions, { label: '', value: '' }])
  }, [handleStaticChange, staticOptions])

  const handleBatchConfirm = useCallback(
    (newOptions: OptionItem[]) => {
      handleStaticChange(newOptions)
      setBatchOpen(false)
    },
    [handleStaticChange],
  )

  const handleTypeChange = useCallback(
    (v: string) => {
      const newType = v as 'static' | 'remote'
      setDsType(newType)
      if (newType === 'remote') {
        setRemoteModalOpen(true)
      } else {
        if (value?.type !== 'static') {
          onChange?.({ type: 'static', static: { options: [] } })
        }
      }
    },
    [value, onChange],
  )

  const handleRemoteConfigConfirm = useCallback(
    (config: { url: string; resultPath: string; labelField: string; valueField: string }) => {
      if (!config.url.trim()) return
      const deps = parseUrlDeps(config.url)
      onChange?.({
        type: 'remote',
        remote: {
          config: {
            url: config.url,
            method: 'GET',
            dependencies: deps,
            requiredDeps: deps,
            labelField: config.labelField,
            valueField: config.valueField,
            resultPath: config.resultPath || undefined,
            skipEmpty: true,
          },
        },
      })
      setRemoteModalOpen(false)
    },
    [onChange],
  )

  const currentRemoteConfig = useMemo(() => {
    if (value?.type === 'remote') {
      const c = value.remote.config
      return {
        url: c.url || '',
        resultPath: c.resultPath || '',
        labelField: c.labelField || 'name',
        valueField: c.valueField || 'id',
      }
    }
    return { url: '', resultPath: '', labelField: 'name', valueField: 'id' }
  }, [value])

  return (
    <div style={{ ...style }}>
      <div style={{ marginBottom: token('spacingXs') }}>
        <WidgetButtonGroup
          options={SOURCE_TYPE_OPTIONS}
          value={dsType}
          onChange={handleTypeChange}
          disabled={disabled}
        />
      </div>

      {dsType === 'static' &&
        (optionsType === 'tree' ? (
          <WidgetTreeDataEditor value={staticOptions} onChange={handleStaticChange} disabled={disabled} />
        ) : (
          <>
            <SortableTableEditor<TableOptionItem>
              value={tableItems}
              onChange={handleTableChange}
              columns={[
                {
                  key: 'label' as keyof TableOptionItem,
                  label: '标签',
                  render: ({ value, onChange: onValChange, disabled: d }) => (
                    <WidgetInput
                      value={String(value ?? '')}
                      disabled={d}
                      variant="filled"
                      onChange={(v) => onValChange(v)}
                    />
                  ),
                },
                {
                  key: 'value' as keyof TableOptionItem,
                  label: '值',
                  render: ({ value, onChange: onValChange, disabled: d }) => (
                    <WidgetInput
                      value={String(value ?? '')}
                      disabled={d}
                      variant="filled"
                      onChange={(v) => onValChange(v)}
                    />
                  ),
                },
              ]}
              disabled={disabled}
            />
            <Space gap="xs" style={{ marginTop: token('spacingXs') }}>
              <WidgetButton
                type="dashed"
                size="sm"
                color="primary"
                onClick={handleAddOption}
                disabled={disabled}
                style={{ flex: 1, textAlign: 'center' }}
              >
                + 添加选项
              </WidgetButton>
              <WidgetButton
                type="dashed"
                size="sm"
                color="primary"
                onClick={() => setBatchOpen(true)}
                disabled={disabled}
                style={{ flex: 1, textAlign: 'center' }}
              >
                批量编辑
              </WidgetButton>
            </Space>
            <BatchEditModal
              open={batchOpen}
              options={staticOptions}
              onConfirm={handleBatchConfirm}
              onCancel={() => setBatchOpen(false)}
            />
          </>
        ))}

      {dsType === 'remote' && (
        <div>
          <Text type="secondary" style={{ marginBottom: token('spacingXs'), lineHeight: 1.5 }}>
            <div>接口：{currentRemoteConfig.url || '未配置'}</div>
            {currentRemoteConfig.url && (
              <Text type="tertiary" style={{ marginTop: '2px' }}>
                依赖：{parseUrlDeps(currentRemoteConfig.url).join('、') || '无'}
              </Text>
            )}
          </Text>
          <WidgetButton
            type="dashed"
            size="sm"
            onClick={() => setRemoteModalOpen(true)}
            disabled={disabled}
            style={{
              textAlign: 'center',
            }}
          >
            配置远程接口
          </WidgetButton>
        </div>
      )}

      <RemoteConfigModal
        open={remoteModalOpen}
        config={currentRemoteConfig}
        onConfirm={handleRemoteConfigConfirm}
        onCancel={() => {
          setRemoteModalOpen(false)
          // 取消时 dataSource 未变，退回当前实际类型
          setDsType(value?.type === 'remote' ? 'remote' : 'static')
        }}
      />
    </div>
  )
}

export const WidgetDataSourceEditor = React.memo(WidgetDataSourceEditorInner) as typeof WidgetDataSourceEditorInner
