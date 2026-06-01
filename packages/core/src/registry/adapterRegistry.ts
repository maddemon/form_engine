import type { FormEngineAdapter } from '../types/adapter'

let currentAdapter: FormEngineAdapter | null = null

export function registerAdapter(adapter: FormEngineAdapter): void {
  currentAdapter = adapter
}

export function getAdapter(): FormEngineAdapter | null {
  return currentAdapter
}

export function hasAdapter(): boolean {
  return currentAdapter !== null
}

export function getAdapterComponents(): FormEngineAdapter['components'] {
  return currentAdapter?.components || {}
}

export function getAdapterPropertyPanel() {
  return currentAdapter?.propertyPanel
}

export function clearAdapter(): void {
  currentAdapter = null
}
