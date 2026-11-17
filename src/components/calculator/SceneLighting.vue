<script setup lang="ts">
import { DirectionalLight, HemisphereLight } from 'three'

const hemisphereLight = new HemisphereLight('#e4e8ff', '#08080a', 0.45)

const keyLight = new DirectionalLight('#f7f5f0', 2.2)
keyLight.position.set(-4.5, 6.5, 9)
keyLight.castShadow = true
keyLight.shadow.mapSize.set(2048, 2048)
keyLight.shadow.camera.near = 0.5
keyLight.shadow.camera.far = 32
keyLight.shadow.camera.left = -9
keyLight.shadow.camera.right = 9
keyLight.shadow.camera.top = 9
keyLight.shadow.camera.bottom = -9
keyLight.shadow.camera.updateProjectionMatrix()
keyLight.shadow.bias = -0.0004
keyLight.shadow.normalBias = 0.018
keyLight.shadow.radius = 4
keyLight.shadow.blurSamples = 16

const fillLight = new DirectionalLight('#ccd4ff', 0.65)
fillLight.position.set(6, 2.5, 7)

const rimLight = new DirectionalLight('#b9b1ff', 0.95)
rimLight.position.set(1.5, 4.5, -6)
</script>

<template>
  <primitive :object="hemisphereLight" />
  <primitive :object="keyLight" />
  <primitive :object="fillLight" />
  <primitive :object="rimLight" />
</template>
