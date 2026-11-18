import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import HomeView from '../HomeView.vue'

function mountHome() {
  return shallowMount(HomeView, {
    global: {
      plugins: [createPinia()],
    },
  })
}

describe('HomeView', () => {
  it('apresenta o nome da aplicação e do modelo', () => {
    const wrapper = mountHome()

    expect(wrapper.text()).toContain('CalcDeck')
    expect(wrapper.text()).toContain('Scientific Calculator 01')
  })

  it('exibe a indicação de interação com o modelo 3D', () => {
    const wrapper = mountHome()

    expect(wrapper.text()).toContain('Arraste para girar')
    expect(wrapper.text()).toContain('aproximar')
  })
})
