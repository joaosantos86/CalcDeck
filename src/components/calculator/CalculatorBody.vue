<script setup lang="ts">
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { onUnmounted } from 'vue'

import { body, calculatorMarks, frontPanel, keypadPlate } from '@/data/scientificCalculator'
import { createLabelTexture } from '@/utils/canvasTextures'
import { createRoundedPanelGeometry } from '@/utils/geometry'

import { calculatorMaterials } from './calculatorMaterials'

const bodyGeometry = new RoundedBoxGeometry(
  body.width,
  body.height,
  body.depth,
  body.segments,
  body.radius,
)

const panelGeometry = createRoundedPanelGeometry({
  width: frontPanel.width,
  height: frontPanel.height,
  radius: frontPanel.radius,
  depth: frontPanel.depth,
  bevelSize: frontPanel.bevelSize,
  bevelThickness: frontPanel.bevelThickness,
  bevelSegments: 3,
  curveSegments: 10,
})

const keypadGeometry = createRoundedPanelGeometry({
  width: keypadPlate.width,
  height: keypadPlate.height,
  radius: keypadPlate.radius,
  depth: keypadPlate.depth,
  bevelSize: keypadPlate.bevelSize,
  bevelThickness: keypadPlate.bevelThickness,
  bevelSegments: 2,
  curveSegments: 10,
})

const markingTextures = Object.entries(calculatorMarks).map(([id, mark]) => ({
  ...mark,
  id,
  texture: createLabelTexture(mark.text, mark.width / mark.height, {
    color: mark.color,
    weight: 700,
    scale: mark.size,
  }),
}))

onUnmounted(() => {
  bodyGeometry.dispose()
  panelGeometry.dispose()
  keypadGeometry.dispose()
  for (const marking of markingTextures) {
    marking.texture.dispose()
  }
})
</script>

<template>
  <TresGroup>
    <TresMesh :geometry="bodyGeometry" cast-shadow receive-shadow>
      <TresMeshPhysicalMaterial
        :color="calculatorMaterials.body.color"
        :roughness="calculatorMaterials.body.roughness"
        :metalness="calculatorMaterials.body.metalness"
        :clearcoat="calculatorMaterials.body.clearcoat"
        :clearcoat-roughness="calculatorMaterials.body.clearcoatRoughness"
      />
    </TresMesh>

    <TresMesh :position="[0, 0, frontPanel.z]" :geometry="panelGeometry" cast-shadow receive-shadow>
      <TresMeshStandardMaterial
        :color="calculatorMaterials.frontPanel.color"
        :roughness="calculatorMaterials.frontPanel.roughness"
        :metalness="calculatorMaterials.frontPanel.metalness"
      />
    </TresMesh>

    <TresMesh
      :position="[0, keypadPlate.centerY, keypadPlate.z]"
      :geometry="keypadGeometry"
      receive-shadow
    >
      <TresMeshStandardMaterial
        :color="calculatorMaterials.keypadPlate.color"
        :roughness="calculatorMaterials.keypadPlate.roughness"
        :metalness="calculatorMaterials.keypadPlate.metalness"
      />
    </TresMesh>

    <TresMesh
      v-for="marking in markingTextures"
      :key="marking.id"
      :position="[marking.x, marking.y, frontPanel.topZ + 0.002]"
      :render-order="2"
    >
      <TresPlaneGeometry :args="[marking.width, marking.height]" />
      <TresMeshBasicMaterial :map="marking.texture" transparent :depth-write="false" />
    </TresMesh>
  </TresGroup>
</template>
