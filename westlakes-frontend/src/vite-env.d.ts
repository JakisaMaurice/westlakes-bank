/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_SUPPORT_EMAIL: string
  readonly VITE_CONTACT_EMAIL: string
  readonly VITE_CONTACT_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
