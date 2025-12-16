import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';

/**
 * Obtiene el idioma guardado en localStorage o retorna el idioma por defecto.
 * @returns {string} Código del idioma ('en' o 'es')
 */
const getSavedLanguage = () => {
  try {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'es';
  } catch (error) {
    console.warn('Error al leer idioma guardado:', error);
    return 'es';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation }
    },
    lng: getSavedLanguage(), // Cargar idioma guardado o usar 'es' por defecto
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

/**
 * Guardar idioma en localStorage cuando cambia.
 * Se ejecuta cada vez que el usuario cambia el idioma.
 */
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('language', lng);
  } catch (error) {
    console.warn('Error al guardar idioma:', error);
  }
});

export default i18n;
