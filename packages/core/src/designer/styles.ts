import type { ThemeTokens } from '../styles/defaultTheme'

// ============================
// 工厂函数（基于 ThemeTokens）
// 用于逐步替换上述硬编码常量
// ============================

export function createDesignerStyles(t: ThemeTokens) {
  return {
    toolbar: {
      position: 'absolute' as const,
      top: 0,
      right: 0,
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      gap: t.spacingSm,
      background: t.primary,
      borderRadius: `0 ${t.borderRadiusSm} 0 ${t.borderRadiusSm}`,
      padding: t.spacingXs,
      lineHeight: 1,
    },
    iconBtn: {
      color: t.bgPrimary,
      fontSize: t.fontSizeXs,
      cursor: 'pointer',
      padding: t.btnPaddingMd,
      userSelect: 'none' as const,
    },
    dragHandle: {
      color: t.bgPrimary,
      fontSize: t.fontSizeXs,
      cursor: 'grab',
      padding: t.btnPaddingMd,
      userSelect: 'none' as const,
      whiteSpace: 'nowrap' as const,
    },
    fieldItem: (selected: boolean) => ({
      position: 'relative' as const,
      padding: t.spacingSm,
      marginBottom: t.spacingSm,
      borderRadius: t.borderRadiusMd,
      border: selected ? `1px solid ${t.primary}` : '1px solid transparent',
      transition: 'border-color 0.2s',
      cursor: 'pointer',
    }),
    containerPreview: (isOver: boolean) => ({
      minHeight: t.containerMinHeight,
      position: 'relative' as const,
      border: isOver ? t.borderSecondary : `1px dashed ${t.borderPrimary}`,
      borderRadius: t.borderRadiusSm,
      background: isOver ? t.bgSecondary : t.bgTertiary,
      padding: t.spacingSm,
    }),
    canvasScroll: {
      flex: 1,
      padding: t.spacingMd,
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      background: t.bgSecondary,
      minHeight: 0,
      overflow: 'auto',
    },
    canvasPaper: {
      maxWidth: '100%',
      background: t.bgPrimary,
      borderRadius: `calc(${t.borderRadiusMd} + 2px)`,
      padding: t.spacingMd,
      minHeight: `calc(${t.containerMinHeight} * 5)`,
    },
    emptyPlaceholder: {
      color: t.textTertiary,
      fontSize: t.fontSizeXs,
      padding: t.spacingLg,
      textAlign: 'center',
      border: `1px dashed ${t.borderLight}`,
      borderRadius: t.borderRadiusSm,
    },
  }
}
