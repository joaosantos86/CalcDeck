<script setup lang="ts">
import { onUnmounted } from 'vue'

import { display } from '@/data/scientificCalculator'
import { createLcdTexture } from '@/utils/canvasTextures'
import { createRoundedFrameGeometry, createRoundedPanelGeometry } from '@/utils/geometry'

import { calculatorMaterials } from './calculatorMaterials'

const frameGeometry = createRoundedFrameGeometry({
  outer: {
    width: display.frameWidth,
    height: display.frameHeight,
    radius: display.frameRadius,
  },
  inner: {
    width: display.panelWidth + 0.1,
    height: display.panelHeight + 0.1,
    radius: display.panelRadius + 0.02,
  },
  depth: display.frameDepth,
  bevelSize: display.frameBevel,
  bevelThickness: display.frameBevel,
})

const panelGeometry = createRoundedPanelGeometry({
  width: display.panelWidth,
  height: display.panelHeight,
  radius: display.panelRadius,
  depth: display.panelDepth,
  bevelSize: display.panelBevel,
  bevelThickness: display.panelBevel,
  bevelSegments: 2,
  curveSegments: 10,
})

const displayTexture = createLcdTexture(display.value)

onUnmounted(() => {
  frameGeometry.dispose()
  panelGeometry.dispose()
  displayTexture.dispose()
})
</script>

<template>
  <TresGroup :position="[0, display.centerY, 0]">
    <TresMesh
      :position="[0, 0, display.frameZ]"
      :geometry="frameGeometry"
      cast-shadow
      receive-shadow
    >
      <TresMeshStandardMaterial
        :color="calculatorMaterials.displayFrame.color"
        :roughness="calculatorMaterials.displayFrame.roughness"
        :metalness="calculatorMaterials.displayFrame.metalness"
      />
    </TresMesh>

    <TresMesh :position="[0, 0, display.panelZ]" :geometry="panelGeometry" receive-shadow>
      <TresMeshStandardMaterial
        :color="calculatorMaterials.displayPanel.color"
        :roughness="calculatorMaterials.displayPanel.roughness"
        :metalness="calculatorMaterials.displayPanel.metalness"
      />
    </TresMesh>

    <TresMesh :position="[0, 0, display.panelTopZ + 0.001]" :render-order="1">
      <TresPlaneGeometry :args="[display.panelWidth - 0.04, display.panelHeight - 0.04]" />
      <TresMeshBasicMaterial :map="displayTexture" />
    </TresMesh>

    <TresMesh :position="[0, 0, display.panelTopZ + 0.003]" :render-order="2">
      <TresPlaneGeometry :args="[display.panelWidth - 0.02, display.panelHeight - 0.02]" />
      <TresMeshPhysicalMaterial
        color="#f4f6ee"
        :transparent="true"
        :opacity="0.04"
        :roughness="0.08"
        :metalness="0"
        :clearcoat="1"
        :clearcoat-roughness="0.08"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>
</template>
