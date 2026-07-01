import { vi } from 'vitest'
import { ref } from 'vue'

/** Mock padrão do vue3-gettext para testes unitários. */
export function mockUseGettext() {
  return {
    useGettext: () => ({
      current: ref('en-us'),
      $gettext: (msgid: string) => msgid,
      $pgettext: (_ctx: string, msgid: string) => msgid,
      $ngettext: (singular: string) => singular,
      $npgettext: (_ctx: string, singular: string) => singular,
    }),
  }
}

export function installGettextMock() {
  vi.mock('vue3-gettext', () => mockUseGettext())
}
