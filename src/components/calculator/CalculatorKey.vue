<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

import { keypad } from '@/data/scientificCalculator'
import type { KeyTone } from '@/types/calculator'
import { createLabelTexture } from '@/utils/canvasTextures'
import { createRoundedPanelGeometry } from '@/utils/geometry'

import { calculatorMaterials, keyTones } from './calculatorMaterials'

const props = defineProps<{
  label: string
  tone: KeyTone
  x: number
  y: number
  z: number
  width: number
  height: number
  shape?: 'rect' | 'circle'
  secondaryLabel?: string
  secondaryTone?: 'yellow' | 'red'
  labelColor?: string
  pressCount?: number
}>()

const emit = defineEmits<{ press: [] }>()

interface PointerLikeEvent {
  clientX: number
  clientY: number
  stopPropagation: () => void
}

const keyGeometry = computed(() =>
  createRoundedPanelGeometry({
    width: props.width,
    height: props.height,
    radius:
      props.shape === 'circle'
        ? Math.min(props.width, props.height) / 2
        : Math.min(keypad.keyRadius, props.height / 2),
    depth: keypad.keyDepth,
    bevelSize: keypad.keyBevel,
    bevelThickness: keypad.keyBevel,
    bevelSegments: 2,
    curveSegments: 8,
  }),
)

const colors = computed(() => keyTones[props.tone])
const labelWidth = computed(() => props.width - 0.12)
const labelHeight = computed(() => props.height - 0.08)
const labelZ = computed(() => props.z + keypad.keyDepth + keypad.keyBevel + 0.002)

const pressed = ref(false)
const hovered = ref(false)
const pressOffset = computed(() => (pressed.value ? -0.04 : 0))
const glow = computed(() => (hovered.value && !pressed.value ? 0.22 : 0))

let pressTimer: ReturnType<typeof setTimeout> | undefined
let pointerStart: { x: number; y: number } | null = null

const labelTexture = computed(() =>
  createLabelTexture(props.label, labelWidth.value / labelHeight.value, {
    color: props.labelColor ?? colors.value.label,
    weight: 700,
    scale: props.label.length > 4 ? 0.48 : 0.58,
    secondaryLabel: props.secondaryLabel,
    secondaryColor: props.secondaryTone === 'red' ? '#ef8a92' : '#efe08a',
  }),
)

watch(
  () => props.pressCount,
  (count) => {
    if (!count) return
    pressed.value = true
    clearTimeout(pressTimer)
    pressTimer = setTimeout(() => {
      pressed.value = false
    }, 120)
  },
)

function handlePointerDown(event: PointerLikeEvent): void {
  pointerStart = { x: event.clientX, y: event.clientY }
  event.stopPropagation()
}

function handlePointerEnter(event: PointerLikeEvent): void {
  hovered.value = true
  document.body.style.cursor = 'pointer'
  event.stopPropagation()
}

function handlePointerLeave(): void {
  hovered.value = false
  document.body.style.cursor = ''
}

function handleClick(event: PointerLikeEvent): void {
  event.stopPropagation()

  if (pointerStart) {
    const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
    pointerStart = null
    if (distance > 6) return
  }

  emit('press')
}

onUnmounted(() => {
  clearTimeout(pressTimer)
  document.body.style.cursor = ''
  keyGeometry.value.dispose()
  labelTexture.value.dispose()
})
</script>

<template>
  <TresGroup>
    <TresMesh
      :position="[x, y, z + pressOffset]"
      :geometry="keyGeometry"
      cast-shadow
      receive-shadow
      @pointerdown="handlePointerDown"
      @pointerenter="handlePointerEnter"
      @pointerleave="handlePointerLeave"
      @click="handleClick"
    >
      <TresMeshStandardMaterial
        :color="colors.cap"
        :roughness="calculatorMaterials.key.roughness"
        :metalness="calculatorMaterials.key.metalness"
        :emissive="colors.highlight"
        :emissive-intensity="glow"
      />
    </TresMesh>

    <TresMesh
      :position="[x, y, labelZ + pressOffset]"
      :render-order="2"
      @pointerdown="handlePointerDown"
      @pointerenter="handlePointerEnter"
      @pointerleave="handlePointerLeave"
      @click="handleClick"
    >
      <TresPlaneGeometry :args="[labelWidth, labelHeight]" />
      <TresMeshStandardMaterial
        :map="labelTexture"
        transparent
        :depth-write="false"
        :roughness="calculatorMaterials.label.roughness"
        :metalness="calculatorMaterials.label.metalness"
      />
    </TresMesh>
  </TresGroup>
</template>
