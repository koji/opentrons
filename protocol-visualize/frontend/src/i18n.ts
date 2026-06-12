import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { en } from '/app/assets/localization/en'

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: { en },
})

export { i18n }
