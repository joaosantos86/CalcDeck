<script setup lang="ts">
import { CylinderGeometry } from 'three'
import { onUnmounted } from 'vue'

import { keyBaseZ } from '@/data/scientificCalculator'

const geometry = new CylinderGeometry(0.67, 0.67, 0.06, 48, 1)
geometry.rotateX(Math.PI / 2)

onUnmounted(() => geometry.dispose())
</script>

<template>
  <TresMesh :position="[0, 0.4, keyBaseZ + 0.024]" :geometry="geometry" receive-shadow>
    <TresMeshStandardMaterial color="#3d3f3b" :roughness="0.54" :metalness="0.06" />
  </TresMesh>
</template>
