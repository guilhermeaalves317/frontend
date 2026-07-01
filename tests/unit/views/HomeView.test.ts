import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../../../src/views/HomeView.vue'

vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    current: ref('pt-br'),
    $gettext: (msgid: string) => msgid,
  }),
}))

describe('HomeView', () => {
  it('renders correctly', () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [],
    })

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
