import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import HomeView from '../HomeView.vue'

describe('HomeView', () => {
  it('renderiza o nome da aplicação', () => {
    const wrapper = mount(HomeView)

    expect(wrapper.text()).toContain('CalcDeck')
  })
})
