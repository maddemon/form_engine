import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useStyle } from '../styles'
import type { FieldDataSource, OptionItem } from '../types/schema'
import { WidgetButton } from './Button'
import { WidgetButtonGroup } from './ButtonGroup'
import { WidgetInput } from './Input'
import { WidgetModal } from './Modal'
import { WidgetOptionsEditor } from './OptionsEditor'
import { TagLabel } from './TagLabel'
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: token('spacingSm') }}>
        <div>
          <div
            style={{
              fontSize: token('fontSizeXs'),
              color: 'var(--fe-text-secondary)',
              marginBottom: token('spacingXs'),
            }}
          >
            接口地址（GET）
          </div>
          <WidgetInput
            value={url}
            onChange={(v) => {
              setUrl(v as string)
              setTouched(true)
            }}
            placeholder="/api/options?parentId={parentField}"
            style={{ padding: '3px 6px' }}
          />
          <div style={{ fontSize: token('fontSizeXs'), color: 'var(--fe-text-tertiary)', marginTop: '2px' }}>
            用 <code>{`{fieldName}`}</code> 引用其他字段的值作为参数
          </div>
        </div>

        {touched && url && deps.length > 0 && (
          <div>
            <div
              style={{
                fontSize: token('fontSizeXs'),
                color: 'var(--fe-text-secondary)',
                marginBottom: token('spacingXs'),
              }}
            >
              依赖字段
            </div>
            <div style={{ display: 'flex', gap: token('spacingXs'), flexWrap: 'wrap' }}>
              {deps.map((dep) => (
                <TagLabel key={dep} variant="secondary">
                  {dep}
                </TagLabel>
              ))}
            </div>
            <div style={{ fontSize: token('fontSizeXs'), color: 'var(--fe-text-tertiary)', marginTop: '2px' }}>
              依赖字段的值变化时自动重新请求
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--fe-border-light)', paddingTop: token('spacingSm') }}>
          <div
            style={{
              fontSize: token('fontSizeXs'),
              color: 'var(--fe-text-secondary)',
              marginBottom: token('spacingSm'),
            }}
          >
            响应映射
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: token('spacingSm') }}>
            <div>
              <div style={{ fontSize: token('fontSizeXs'), color: 'var(--fe-text-tertiary)', marginBottom: '2px' }}>
                列表路径
              </div>
              <WidgetInput
                value={resultPath}
                onChange={(v) => setResultPath(v as string)}
                placeholder="data.list 或留空取根"
                style={{ padding: '3px 6px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: token('spacingSm') }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: token('fontSizeXs'), color: 'var(--fe-text-tertiary)', marginBottom: '2px' }}>
                  标签字段
                </div>
                <WidgetInput
                  value={labelField}
                  onChange={(v) => setLabelField(v as string)}
                  placeholder="name"
                  style={{ padding: '3px 6px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: token('fontSizeXs'), color: 'var(--fe-text-tertiary)', marginBottom: '2px' }}>
                  值字段
                </div>
                <WidgetInput
                  value={valueField}
                  onChange={(v) => setValueField(v as string)}
                  placeholder="id"
                  style={{ padding: '3px 6px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
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
          <WidgetOptionsEditor
            value={staticOptions as { label: string; value: string }[]}
            onChange={handleStaticChange as (v: { label: string; value: string }[]) => void}
            disabled={disabled}
          />
        ))}

      {dsType === 'remote' && (
        <div>
          <div
            style={{
              fontSize: token('fontSizeXs'),
              color: 'var(--fe-text-secondary)',
              marginBottom: token('spacingXs'),
              lineHeight: 1.5,
            }}
          >
            <div>接口：{currentRemoteConfig.url || '未配置'}</div>
            {currentRemoteConfig.url && (
              <div style={{ fontSize: token('fontSizeXs'), color: 'var(--fe-text-tertiary)', marginTop: '2px' }}>
                依赖：{parseUrlDeps(currentRemoteConfig.url).join('、') || '无'}
              </div>
            )}
          </div>
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
