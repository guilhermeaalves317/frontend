import './assets/index.css'
import '@rural-environmental-registry/map_component/dist/index.css'
import { createApp } from 'vue'
import { createGettext } from 'vue3-gettext'
import App from './App.vue'
import router from './router'
import translations from './i18n/translations.json'
import { createInitialLocale } from './i18n/useLocale'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './i18n/locale'

const gettext = createGettext({
  availableLanguages: {
    'en-us': 'English (USA)',
    'pt-br': 'Portuguese (Brazil)',
    'es-es': 'Spanish (Spain)',
  },
  defaultLanguage: DEFAULT_LOCALE,
  mutedLanguages: [],
  silent: false,
  translations,
})

gettext.current = createInitialLocale()

const app = createApp(App)

app.use(gettext)
app.use(router)

app.mount('#app')
