import i18n from '../i18n';

/**
 * Helper to get localized string for an object.
 * Tries common shapes used in APIs:
 *  - <field>_i18n: { en: '...', hi: '...' }
 *  - translations: { name: { en: '...', hi: '...' } }
 * Falls back to the raw field (e.g., name) when no translation exists.
 */
export default function getLocalized(obj: any, field = 'name') {
  if (!obj) return '';
  const lang = i18n?.language || 'en';

  // 1) specific field_i18n
  const fieldKey = `${field}_i18n`;
  if (obj[fieldKey] && typeof obj[fieldKey] === 'object' && obj[fieldKey][lang]) {
    return obj[fieldKey][lang];
  }

  // 2) translations[field][lang]
  if (obj.translations && obj.translations[field] && obj.translations[field][lang]) {
    return obj.translations[field][lang];
  }

  // 3) nested localized fields (e.g., obj.localized?.name?.[lang])
  if (obj.localized && obj.localized[field] && obj.localized[field][lang]) {
    return obj.localized[field][lang];
  }

  // 4) fallback to plain field
  if (obj[field]) return obj[field];

  // 5) last resort: first available language from field_i18n
  if (obj[fieldKey] && typeof obj[fieldKey] === 'object') {
    const first = Object.values(obj[fieldKey])[0];
    return typeof first === 'string' ? first : '';
  }

  return '';
}
