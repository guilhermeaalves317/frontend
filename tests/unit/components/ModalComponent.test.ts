import { mount, VueWrapper } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import ModalComponent from '@/components/ModalComponent.vue'

vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    current: ref('en-us'),
    $gettext: (msgid: string) => msgid,
  }),
}))

const onClose = vi.fn()
const onConfirm = vi.fn()

let wrapper: VueWrapper

describe('ModalComponent', () => {
  beforeAll(() => {
    wrapper = mount(ModalComponent, {
      props: {
        title: 'Modal Title',
        isOpen: true,
        onClose,
        onConfirm,
      },
      global: {},
      slots: {
        default: 'Modal Content',
      },
    })
  })

  it('renders modal with title', () => {
    expect(wrapper.find('div.br-modal-header').exists()).toBe(true)
    expect(wrapper.find('div.br-modal-header').text()).toBe('Modal Title')
  })

  it('renders modal without title', async () => {
    await wrapper.setProps({ title: null })
    expect(wrapper.find('div.br-modal-header').exists()).toBe(false)
  })

  it('renders modal content', () => {
    expect(wrapper.find('div.br-modal-body').text()).toContain('Modal Content')
  })

  it('renders close button', () => {
    expect(
      wrapper
        .findAll('button')
        .find((btn) => btn.text().includes('Close'))
        ?.exists(),
    ).toBe(true)
  })

  it('renders confirm button when onConfirm is provided', () => {
    expect(
      wrapper
        .findAll('button')
        .find((btn) => btn.text().includes('OK'))
        ?.exists(),
    ).toBe(true)
  })

  it('calls onClose when close button is clicked', () => {
    wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Close'))
      ?.trigger('click')
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    await wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('OK'))
      ?.trigger('click')
    expect(onConfirm).toHaveBeenCalled()
  })

  it('does not render confirm button when onConfirm is not provided', async () => {
    await wrapper.setProps({ onConfirm: null })
    expect(wrapper.findAll('button').find((btn) => btn.text().includes('OK'))).toBe(undefined)
  })
})
