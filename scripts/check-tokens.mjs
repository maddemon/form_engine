// Form Engine - hardcoded token scanner
// Usage: node scripts/check-tokens.mjs
// Exit 0=pass, 1=violations, 2=internal error
//
// Scans designer/widgets/renderer/propRenders for hardcoded hex / rgb /
// CSS named colors / numeric spacing values. Pair with ESLint custom rule
// and pre-commit hook. See AGENTS.md "主题 Token 强制约定".

import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const TARGET_DIRS = [
  'packages/core/src/designer',
  'packages/core/src/widgets',
  'packages/core/src/renderer',
  'packages/core/src/propRenders',
]
const EXCLUDE_DIR_NAMES = new Set(['__tests__', 'node_modules', 'dist'])
const EXTENSIONS = new Set(['.ts', '.tsx'])

const HEX_PATTERN = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g
const RGB_PATTERN = /\brgba?\s*\(/gi
const NAMED_COLOR_PATTERN = /\b(?:color|background(?:-color)?|border(?:-(?:top|right|bottom|left))?(?:-color)?|fill|stroke|outline(?:-color)?|box-shadow|caret-color|column-rule(?:-color)?|text-decoration-color|text-emphasis-color|accent-color)\s*:\s*['"]?(red|blue|green|yellow|orange|purple|pink|black|white|gray|grey|cyan|magenta|brown|navy|teal|lime|maroon|olive|silver|gold|aqua|fuchsia|indigo|violet|crimson|salmon|tomato|coral|khaki|plum|orchid|turquoise|chocolate|firebrick)\b/gi
const NUMERIC_PATTERN = /(?:padding|margin|borderRadius|border-radius|gap|fontSize|font-size|width|height)\s*:\s*['"]?\s*\d+\s*(?:px)?['"]?\s*[;,}\n]/g

const ALLOW_FILE_HEADER = /^\s*\/\*\s*check-tokens-disable\s*\*\//m
const PLACEHOLDER_PATTERN = /placeholder\s*=\s*["'][^"']*#/

async function walk(dir) {
  const out = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIR_NAMES.has(entry.name)) continue
      out.push(...(await walk(join(dir, entry.name))))
    } else if (entry.isFile() && EXTENSIONS.has(extname(entry.name))) {
      out.push(join(dir, entry.name))
    }
  }
  return out
}

function extname(name) {
  const i = name.lastIndexOf('.')
  return i < 0 ? '' : name.slice(i)
}

function isInComment(source, index) {
  const before = source.slice(0, index)
  const lastNl = before.lastIndexOf('\n')
  const line = before.slice(lastNl + 1)
  const slashSlash = line.indexOf('//')
  if (slashSlash >= 0) {
    const slashIndex = lastNl + 1 + slashSlash
    if (index > slashIndex) return true
  }
  return false
}

function checkFile(filePath, source) {
  const violations = []
  if (ALLOW_FILE_HEADER.test(source)) return violations

  const lines = source.split('\n')
  lines.forEach((lineText, idx) => {
    const lineNo = idx + 1
    if (PLACEHOLDER_PATTERN.test(lineText)) return

    let lineOffset = 0
    for (let i = 0; i < idx; i++) lineOffset += lines[i].length + 1

    for (const [name, pattern, msgTpl] of [
      ['hex', HEX_PATTERN, (m) => `hardcoded hex color "${m[0]}", use token() or var(--fe-*)`],
      ['rgb', RGB_PATTERN, (m) => `hardcoded rgb() color "${m[0]}", use token() or var(--fe-*)`],
      [
        'named-color',
        NAMED_COLOR_PATTERN,
        (m) => `hardcoded CSS named color "${m[0]}", use token() or var(--fe-*)`,
      ],
      [
        'numeric',
        NUMERIC_PATTERN,
        (m) => `hardcoded numeric layout value "${m[0].trim()}", use token() or var(--fe-*)`,
      ],
    ]) {
      pattern.lastIndex = 0
      let m
      while ((m = pattern.exec(lineText)) !== null) {
        const col = m.index + 1
        if (isInComment(source, lineOffset + m.index)) continue
        violations.push({
          file: filePath,
          line: lineNo,
          col,
          rule: name,
          message: msgTpl(m),
        })
      }
    }
  })
  return violations
}

async function main() {
  const allFiles = []
  for (const dir of TARGET_DIRS) {
    const abs = join(ROOT, dir)
    try {
      await stat(abs)
    } catch {
      continue
    }
    allFiles.push(...(await walk(abs)))
  }

  const allViolations = []
  for (const file of allFiles) {
    const source = await readFile(file, 'utf8')
    allViolations.push(...checkFile(file, source))
  }

  if (allViolations.length === 0) {
    const green = '\x1b[32m'
    const reset = '\x1b[0m'
    console.log(`${green}✓${reset} check-tokens: scanned ${allFiles.length} files, 0 violations`)
    process.exit(0)
  }

  const red = '\x1b[31m'
  const bold = '\x1b[1m'
  const reset = '\x1b[0m'
  console.error(
    `${red}✗${reset} check-tokens: ${bold}${allViolations.length}${reset} hardcoded value(s) in ${allFiles.length} files\n`,
  )
  for (const v of allViolations) {
    const rel = relative(ROOT, v.file).split(sep).join('/')
    console.error(`  ${rel}:${v.line}:${v.col}  [${v.rule}]  ${v.message}`)
  }
  console.error(
    `\nFix: use ${bold}token('xxx')${reset} or ${bold}var(--fe-xxx)${reset}. See AGENTS.md.`,
  )
  process.exit(1)
}

main().catch((e) => {
  console.error('check-tokens: internal error', e)
  process.exit(2)
})
