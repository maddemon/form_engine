import React, { useCallback, useMemo, useState } from 'react'
import { useLocale, type LocalePack } from '../../locale'
import { useStyle } from '../../styles'
import type { FieldDataSource, OptionItem } from '../../types/schema'
import { WidgetButton } from '../Button'
import { WidgetButtonGroup } from '../ButtonGroup'
import { WidgetInput } from '../Input'
import { SortableTableEditor } from '../SortableTableEditor'
import { Space } from '../Space'
import { Text } from '../Text'
import { WidgetTreeDataEditor } from '../TreeDataEditor'
import { BatchEditModal } from './BatchEditModal'
import { RemoteConfigModal } from './RemoteConfigModal'
import { parseUrlDeps } from './utils'

function useSourceTypeOptions(locale: LocalePack) {
  return React.useMemo(
    () => [
      { label: locale.widget.dataSourceEditor.staticData, value: 'static' },
      { label: locale.widget.dataSourceEditor.remoteData, value: 'remote' },
    ],
    [locale],
  )
}

interface WidgetDataSourceEditorInnerProps {
  value?: FieldDataSource
  onChange?: (v: FieldDataSource) => void
  disabled?: boolean
  style?: React.CSSProperties
  optionsType?: 'flat' | 'tree'
}

function WidgetDataSourceEditorInner({
  value,
  onChange,
  disabled,
  style,
  optionsType = 'flat',
}: WidgetDataSourceEditorInnerProps) {
  const { token } = useStyle()
  const { locale } = useLocale()
  const SOURCE_TYPE_OPTIONS = useSourceTypeOptions(locale)
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

  const handleTypeChange = useCallback((v: string) => {
    const newType = v as 'static' | 'remote'
    setDsType(newType)
    if (newType === 'remote') {
      setRemoteModalOpen(true)
    }
  }, [])

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
                  label: locale.widget.dataSourceEditor.labelCol,
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
                  label: locale.widget.dataSourceEditor.valueCol,
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
                {locale.widget.dataSourceEditor.addOption}
              </WidgetButton>
              <WidgetButton
                type="dashed"
                size="sm"
                color="primary"
                onClick={() => setBatchOpen(true)}
                disabled={disabled}
                style={{ flex: 1, textAlign: 'center' }}
              >
                {locale.widget.dataSourceEditor.batchEditBtn}
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
            <div>
              {locale.widget.dataSourceEditor.apiUrl.split('（')[0]}：
              {currentRemoteConfig.url || locale.widget.dataSourceEditor.none}
            </div>
            {currentRemoteConfig.url && (
              <Text type="tertiary" style={{ marginTop: '2px' }}>
                {locale.widget.dataSourceEditor.dependentField}：
                {parseUrlDeps(currentRemoteConfig.url).join('、') || locale.widget.dataSourceEditor.none}
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
            {locale.widget.dataSourceEditor.configRemote}
          </WidgetButton>
        </div>
      )}

      <RemoteConfigModal
        open={remoteModalOpen}
        config={currentRemoteConfig}
        onConfirm={handleRemoteConfigConfirm}
        onCancel={() => {
          setRemoteModalOpen(false)
          setDsType(value?.type === 'remote' ? 'remote' : 'static')
        }}
      />
    </div>
  )
}

export const WidgetDataSourceEditor = React.memo(WidgetDataSourceEditorInner) as typeof WidgetDataSourceEditorInner
