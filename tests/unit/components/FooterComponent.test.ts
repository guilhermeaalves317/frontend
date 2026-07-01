import { mount, VueWrapper } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import FooterComponent from '@/components/FooterComponent.vue'
import { ref } from 'vue'

describe('FooterComponent', () => {
  let wrapper: VueWrapper

  vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    current: ref('pt-br'),
    $gettext: (msgid: string) => msgid,
  }),
}))

  beforeAll(() => {
    wrapper = mount(FooterComponent)
  })

  it('should be defined', () => {
    expect(wrapper).toBeDefined()
  })

  it('renders correctly', async () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('should contain the correct text', () => {
    expect(wrapper.text()).toContain('footer')
  })
})
