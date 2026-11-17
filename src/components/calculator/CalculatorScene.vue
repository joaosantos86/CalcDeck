<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { VSMShadowMap } from 'three'

import CameraRig from './CameraRig.vue'
import CalculatorModel from './CalculatorModel.vue'
import SceneEnvironment from './SceneEnvironment.vue'
import SceneLighting from './SceneLighting.vue'
import StudioBackdrop from './StudioBackdrop.vue'
</script>

<template>
  <TresCanvas
    class="h-full w-full"
    clear-color="#08080b"
    :dpr="[1, 2]"
    :antialias="true"
    :shadows="true"
    :shadow-map-type="VSMShadowMap"
    :tone-mapping-exposure="1.05"
  >
    <CameraRig />
    <SceneEnvironment />
    <SceneLighting />
    <StudioBackdrop />
    <CalculatorModel />
  </TresCanvas>
</template>
