let _counter = 0

export function genId(prefix = 'id'): string {
  _counter++
  return `${prefix}_${Date.now()}_${_counter}_${Math.random().toString(36).slice(2, 6)}`
}