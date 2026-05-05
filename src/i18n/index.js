import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './locales/ru.json'
import en from './locales/en.json'
import { COOKIE_LOCALE, getCookie } from '../utils/cookie'

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en }
  },
  lng: getCookie(COOKIE_LOCALE) || 'ru',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false
  },
  debug: true,
  saveMissing: true,
  missingKeyHandler: (lng, ns, key) => {
    // eslint-disable-next-line no-console
    console.warn(`Missing translation: ${key}`)
  }
})

export default i18n

