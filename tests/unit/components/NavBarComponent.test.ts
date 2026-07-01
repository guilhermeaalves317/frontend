import { mount, VueWrapper } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import NavBarComponent from '@/components/NavBarComponent.vue'
import { ref } from 'vue'

const routes = [{ path: '/', component: {} }]
const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

let wrapper: VueWrapper

vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    current: ref('pt-br'),
    $gettext: (msgid: string) => msgid,
  }),
}))
vi.mock('@/i18n/useLocale', () => ({
  useLocale: () => ({
    locale: ref('pt-br'),
    setLocale: vi.fn(),
    $gettext: (msgid: string) => msgid,
  }),
}))

describe('NavBarComponent', () => {
  beforeAll(() => {
    wrapper = mount(NavBarComponent, {
      global: {
        plugins: [router],
      },
    })
  })

  vi.mock('/images/govbr_logo_high_quality.svg', () => ({
    default: '/images/govbr_logo_high_quality.svg',
  }))

  it('renders gov.br logo', () => {
    const img = wrapper.find('img')
    expect(img.attributes('src')).toContain('govbr_logo_high_quality.svg')
    expect(img.attributes('alt')).toBe('gov.br logo')
  })

  it('renders select trigger with placeholder', () => {
    expect(wrapper.find('button[role=combobox]').text()).toBe('Portuguese (Brazil)')
  })

  it('renders select items', () => {
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('option[value="pt-br"]').text()).toBe('Portuguese (Brazil)')
    expect(wrapper.find('option[value="en-us"]').text()).toBe('English (USA)')
  })

  it('selects an item', async () => {
    wrapper.find('select').setValue('en-us')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button[role=combobox]').text()).toBe('English (USA)')

    wrapper.find('select').setValue('pt-br')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button[role=combobox]').text()).toBe('Portuguese (Brazil)')
  })
})
