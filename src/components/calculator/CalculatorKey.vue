<script setup lang="ts">
import { computed, onUnmounted } from 'vue'

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
}>()

const keyGeometry = computed(() =>
  createRoundedPanelGeometry({
    width: props.width,
    height: props.height,
    radius: props.shape === 'circle' ? Math.min(props.width, props.height) / 2 : Math.min(keypad.keyRadius, props.height / 2),
    depth: keypad.keyDepth,
    bevelSize: keypad.keyBevel,
    bevelThickness: keypad.keyBevel,
    bevelSegments: 2,
    curveSegments: 8,
  }),
)

const colors = computed(() => keyTones[props.tone])
const labelWidth = computed(() => props.width - 0.2)
const labelHeight = computed(() => props.height - 0.12)
const labelZ = computed(() => props.z + keypad.keyDepth + keypad.keyBevel + 0.002)

const labelTexture = computed(() =>
  createLabelTexture(props.label, labelWidth.value / labelHeight.value, {
    color: props.labelColor ?? colors.value.label,
    weight: 600,
    scale: props.label.length > 4 ? 0.42 : 0.5,
    secondaryLabel: props.secondaryLabel,
    secondaryColor: props.secondaryTone === 'red' ? '#a34a59' : '#d5ca70',
  }),
)

onUnmounted(() => {
  keyGeometry.value.dispose()
  labelTexture.value.dispose()
})
</script>

<template>
  <TresGroup>
    <TresMesh :position="[x, y, z]" :geometry="keyGeometry" cast-shadow receive-shadow>
      <TresMeshStandardMaterial
        :color="colors.cap"
        :roughness="calculatorMaterials.key.roughness"
        :metalness="calculatorMaterials.key.metalness"
      />
    </TresMesh>

    <TresMesh :position="[x, y, labelZ]" :render-order="2">
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
