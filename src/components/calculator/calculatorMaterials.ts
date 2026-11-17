import type { KeyTone } from '@/types/calculator'

export const keyTones: Record<KeyTone, { cap: string; label: string }> = {
  light: { cap: '#494b47', label: '#efeee8' },
  medium: { cap: '#555752', label: '#efeee8' },
  dark: { cap: '#3c3e3b', label: '#efeee8' },
  red: { cap: '#993038', label: '#fdf4f4' },
  orange: { cap: '#c96d25', label: '#fff7ec' },
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
    color: '#30322f',
    roughness: 0.74,
    metalness: 0.03,
  },
  displayFrame: {
    color: '#292b29',
    roughness: 0.32,
    metalness: 0.24,
  },
  displayPanel: {
    color: '#b9cba0',
    roughness: 0.32,
    metalness: 0.02,
  },
  key: {
    roughness: 0.52,
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
