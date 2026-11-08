/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Address of the backend (PocketBase). Empty: the same address as the site. See .env.example. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
