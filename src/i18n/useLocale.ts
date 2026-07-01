import type { Language } from 'vue3-gettext'
import { useGettext } from 'vue3-gettext'
import { computed, watch } from 'vue'
import { DEFAULT_LOCALE, normalizeLocale, SUPPORTED_LOCALES } from './locale'

const STORAGE_KEY = 'language'

export function useLocale() {
  const gettext = useGettext()

  const locale = computed({
    get: () => gettext.current,
    set: (value: string) => {
      gettext.current = normalizeLocale(value)
    },
  })

  watch(
    () => gettext.current,
    (value) => {
      localStorage.setItem(STORAGE_KEY, value)
    },
    { immediate: true },
  )

  return {
    locale,
    setLocale: (lang: string) => {
      gettext.current = normalizeLocale(lang)
    },
    $gettext: gettext.$gettext,
    availableLocales: SUPPORTED_LOCALES,
  }
}

export function createInitialLocale(): string {
  return normalizeLocale(localStorage.getItem(STORAGE_KEY))
}

export type GettextFn = Language['$gettext']
