import type { KeyTone } from '@/types/calculator'

export const keyTones: Record<KeyTone, { cap: string; label: string; highlight: string }> = {
  light: { cap: '#666963', label: '#fdfcf7', highlight: '#8a8d84' },
  medium: { cap: '#51534d', label: '#f7f6ef', highlight: '#74766e' },
  dark: { cap: '#43453f', label: '#f7f6ef', highlight: '#65675f' },
  red: { cap: '#a83c45', label: '#fff7f7', highlight: '#c95a63' },
  orange: { cap: '#cf7a2b', label: '#fffaf2', highlight: '#e89a4d' },
}

export const calculatorMaterials = {
  body: {
    color: '#30322f',
    roughness: 0.5,
    metalness: 0.14,
    clearcoat: 0.24,
    clearcoatRoughness: 0.6,
  },
  frontPanel: {
    color: '#383a37',
    roughness: 0.64,
    metalness: 0.04,
  },
  keypadPlate: {
    color: '#2b2d2a',
    roughness: 0.74,
    metalness: 0.03,
  },
  displayFrame: {
    color: '#202220',
    roughness: 0.28,
    metalness: 0.3,
  },
  displayPanel: {
    color: '#c3d5a8',
    roughness: 0.3,
    metalness: 0.02,
  },
  key: {
    roughness: 0.5,
    metalness: 0.03,
  },
  label: {
    roughness: 0.68,
    metalness: 0,
  },
} as const

export const brandColors = {
  text: '#858894',
  accent: '#6366f1',
} as const
