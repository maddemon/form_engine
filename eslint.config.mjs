// ESLint flat config (ESLint v9+)
// See https://eslint.org/docs/latest/use/configure/configuration-files
//
// Custom rule: ban-hardcoded-style
// Forbids hardcoded color / spacing values inside JSX style={{...}} in
// packages/core/src/{designer,widgets,renderer,propRenders}. See AGENTS.md.

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

// --- Custom rule definition -------------------------------------------------

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/i
const RGB_COLOR = /^(?:rgba?|hsla?)\s*\(/
const NAMED_COLORS = new Set([
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink',
  'black', 'white', 'gray', 'grey', 'cyan', 'magenta', 'brown',
  'navy', 'teal', 'lime', 'maroon', 'olive', 'silver', 'gold',
  'aqua', 'fuchsia', 'indigo', 'violet', 'crimson', 'salmon',
  'tomato', 'coral', 'khaki', 'plum', 'orchid', 'turquoise',
  'chocolate', 'firebrick',
])
const LAYOUT_PROPS = new Set([
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'paddingInline', 'paddingBlock',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'marginInline', 'marginBlock',
  'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
  'borderBottomLeftRadius', 'borderBottomRightRadius',
  'gap', 'rowGap', 'columnGap',
  'fontSize',
])
const COLOR_PROPS = new Set([
  'color', 'background', 'backgroundColor',
  'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
  'fill', 'stroke', 'outlineColor', 'caretColor', 'accentColor',
])

function isStyleAttribute(node) {
  return (
    node.type === 'JSXAttribute' &&
    node.name.type === 'JSXIdentifier' &&
    node.name.name === 'style' &&
    node.value &&
    node.value.type === 'JSXExpressionContainer' &&
    node.value.expression.type === 'ObjectExpression'
  )
}

function getKeyName(prop) {
  if (!prop.key) return null
  if (prop.key.type === 'Identifier') return prop.key.name
  if (prop.key.type === 'Literal') return String(prop.key.value)
  return null
}

const banHardcodedStyleRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded color / spacing values in JSX style props. Use token() or var(--fe-*).',
    },
    schema: [],
    messages: {
      hex: 'Hardcoded hex color "{{value}}". Use token() or var(--fe-*).',
      rgb: 'Hardcoded rgb()/hsl() color "{{value}}". Use token() or var(--fe-*).',
      named: 'Hardcoded CSS named color "{{value}}". Use token() or var(--fe-*).',
      numeric: 'Hardcoded numeric layout value for "{{prop}}". Use token() or var(--fe-*).',
    },
  },
  create(context) {
    function checkObjectExpression(node) {
      if (!node || node.type !== 'ObjectExpression') return
      for (const prop of node.properties) {
        if (prop.type !== 'Property') continue
        const keyName = getKeyName(prop)
        if (!keyName) continue
        const value = prop.value

        // Color values: only string literals
        if (COLOR_PROPS.has(keyName) && value.type === 'Literal' && typeof value.value === 'string') {
          const v = value.value.trim()
          if (HEX_COLOR.test(v)) {
            context.report({ node: value, messageId: 'hex', data: { value: v } })
            continue
          }
          if (RGB_COLOR.test(v)) {
            context.report({ node: value, messageId: 'rgb', data: { value: v } })
            continue
          }
          if (NAMED_COLORS.has(v.toLowerCase())) {
            context.report({ node: value, messageId: 'named', data: { value: v } })
            continue
          }
        }

        // Layout values: forbid numeric Literal (allow string like "8px" — that's also banned here,
        // but most projects would prefer a clear message for raw numbers)
        if (LAYOUT_PROPS.has(keyName) && value.type === 'Literal' && typeof value.value === 'number') {
          context.report({
            node: value,
            messageId: 'numeric',
            data: { prop: keyName },
          })
        }
      }
    }
    return {
      JSXAttribute(node) {
        if (!isStyleAttribute(node)) return
        checkObjectExpression(node.value.expression)
      },
      // Also catch top-level CSSProperties objects in variable declarations
      // (e.g. const style = { color: '#fff' })
      VariableDeclarator(node) {
        if (!node.init || node.init.type !== 'ObjectExpression') return
        checkObjectExpression(node.init)
      },
      // Catch export const style: CSSProperties = { ... }
      ExportNamedDeclaration(node) {
        if (!node.declaration || node.declaration.type !== 'VariableDeclaration') return
        for (const decl of node.declaration.declarations) {
          if (decl.init && decl.init.type === 'ObjectExpression') {
            checkObjectExpression(decl.init)
          }
        }
      },
    }
  },
}

// --- Config -----------------------------------------------------------------

export default [
  // Global ignores
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.tsbuildinfo',
      'example/**',
      '**/__tests__/**',
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // TS rules
  ...tseslint.configs.recommended,

  // React rules
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/display-name': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Apply custom rule to target dirs only
  {
    files: [
      'packages/core/src/designer/**/*.{ts,tsx}',
      'packages/core/src/widgets/**/*.{ts,tsx}',
      'packages/core/src/renderer/**/*.{ts,tsx}',
      'packages/core/src/propRenders/**/*.{ts,tsx}',
    ],
    plugins: {
      'form-engine': { rules: { 'ban-hardcoded-style': banHardcodedStyleRule } },
    },
    rules: {
      'form-engine/ban-hardcoded-style': 'error',
    },
  },
]
