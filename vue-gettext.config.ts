import { defineGettextConfig } from 'vue3-gettext'

export default defineGettextConfig({
  input: {
    path: './src',
    include: ['**/*.js', '**/*.ts', '**/*.vue'],
    exclude: ['**/legacyKeyMap.ts'],
  },
  output: {
    path: '../locale/frontend',
    potPath: './messages.pot',
    jsonPath: './translations.json',
    locales: ['en-us', 'pt-br', 'es-es'],
    flat: true,
    linguas: false,
    splitJson: false,
    fuzzyMatching: true,
    locations: true,
  },
})
