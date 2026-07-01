/// <reference types="vite/client" />

declare module '@/i18n/translations.json' {
  const translations: Record<string, Record<string, string>>
  export default translations
}

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_DPG_URL: string;
  readonly VITE_CALCULATION_ENGINE_BASE_URL: string;
  readonly VITE_WORKFLOW_API_URL_TEMPLATE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
