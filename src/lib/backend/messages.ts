import type { TranslationKey } from "@/i18n/en";
import { errorCode, type BackendErrorCode } from "./types";

const messages: Record<BackendErrorCode, TranslationKey> = {
  network: "error.network",
  rate_limited: "error.rateLimited",
  invalid_credentials: "error.invalidCredentials",
  email_taken: "error.emailTaken",
  username_taken: "error.usernameTaken",
  slug_taken: "error.generic",
  wrong_password: "error.wrongPassword",
  signed_out: "error.signedOut",
  forbidden: "error.forbidden",
  not_found: "error.notFound",
  invalid: "error.generic",
  unknown: "error.generic",
};

/** The sentence to show for a failed server call: `t(errorMessageKey(error))`. */
export const errorMessageKey = (error: unknown): TranslationKey => messages[errorCode(error)];
