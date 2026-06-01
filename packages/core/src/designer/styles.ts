import type React from 'react'

export const colors = {
  primary: '#1890ff',
  primaryBg: '#e6f4ff',
  primaryHoverBg: '#f0f5ff',
  danger: '#ff4d4f',
  text: '#666',
  textSecondary: '#999',
  textMuted: '#bbb',
  border: '#d9d9d9',
  borderLight: '#eee',
  canvasBg: '#f5f5f5',
  white: '#fff',
  containerBg: '#fafafa',
  transparent: 'transparent',
}

export const borders = {
  selected: `1px solid ${colors.primary}`,
  container: `1px dashed ${colors.border}`,
  transparent: '1px solid transparent',
  empty: '1px dashed #ddd',
}

export const radii = {
  sm: 4,
  md: 6,
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
}

export const toolbar: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 30,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  background: colors.primary,
  borderRadius: `0 ${radii.sm}px 0 ${radii.sm}px`,
  padding: `2px 6px`,
  lineHeight: 1,
}

export const iconBtn: React.CSSProperties = {
  color: colors.white,
  fontSize: 12,
  cursor: 'pointer',
  padding: '2px 3px',
  userSelect: 'none',
}

export const dragHandle: React.CSSProperties = {
  ...iconBtn,
  cursor: 'grab',
  whiteSpace: 'nowrap',
}

export const fieldItem: React.CSSProperties = {
  position: 'relative',
  padding: spacing.sm,
  marginBottom: spacing.sm,
  borderRadius: radii.md,
  transition: 'border-color 0.2s',
  cursor: 'pointer',
}

export const fieldContent: React.CSSProperties = {
  pointerEvents: 'none',
}

export const containerPreview: React.CSSProperties = {
  minHeight: 60,
  position: 'relative',
  border: borders.container,
  borderRadius: radii.sm,
  background: colors.containerBg,
  padding: spacing.sm,
}

export const canvasScroll: React.CSSProperties = {
  flex: 1,
  padding: spacing.md,
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  background: colors.canvasBg,
  minHeight: 0,
  overflow: 'auto',
}

export const canvasPaper: React.CSSProperties = {
  maxWidth: '100%',
  background: colors.white,
  borderRadius: radii.md + 2,
  padding: spacing.md,
  minHeight: 300,
}

export const emptyPlaceholder: React.CSSProperties = {
  color: colors.textSecondary,
  fontSize: 12,
  padding: spacing.lg,
  textAlign: 'center',
  border: borders.empty,
  borderRadius: radii.sm,
}
