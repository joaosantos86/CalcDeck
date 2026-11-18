import { onMounted, onUnmounted } from 'vue'

import { useCalculatorStore } from '@/stores/calculator'
import type { KeyAction } from '@/types/calculator'

const KEY_ACTIONS: Record<string, KeyAction> = {
  Enter: 'equals',
  '=': 'equals',
  Backspace: 'delete',
  Escape: 'clear',
  Delete: 'clear',
  '.': 'decimal',
  ',': 'decimal',
  '+': 'op:+',
  '-': 'op:-',
  '*': 'op:*',
  x: 'op:*',
  '/': 'op:/',
  '^': 'op:^',
  '(': 'lparen',
  ')': 'rparen',
  '!': 'postfix:!',
  '%': 'postfix:%',
  p: 'const:pi',
  a: 'const:ans',
  s: 'fn:sin',
  c: 'fn:cos',
  t: 'fn:tan',
  r: 'fn:sqrt',
  l: 'fn:log',
  n: 'fn:ln',
  h: 'hyp',
  F9: 'sign',
}

/** Lets the physical keyboard drive the 3D calculator. */
export function useCalculatorKeyboard(): void {
  const calculator = useCalculatorStore()

  function handleKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return

    const target = event.target as HTMLElement | null
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
      return
    }

    const character = event.key.length === 1 ? event.key.toLowerCase() : event.key
    const action = /^[0-9]$/.test(character)
      ? (`digit:${character}` as const)
      : KEY_ACTIONS[character]

    if (!action) return

    event.preventDefault()
    calculator.pressAction(action)
  }

  onMounted(() => window.addEventListener('keydown', handleKeydown))
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
}
