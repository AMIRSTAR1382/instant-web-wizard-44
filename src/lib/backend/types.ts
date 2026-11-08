import type { CategoryId, Community, CommunityImageKey } from "@/data/communities";

/*
 * Everything the site asks of its server. The real implementation talks to PocketBase
 * (./pocketbase.ts); tests use an in-memory one (./memory.ts) that follows the same rules.
 */

/** The signed-in person: their account and their profile in one. */
export interface Account {
  id: string;
  email: string;
  /** True once they confirmed their email (only possible after email sending is set up). */
  verified: boolean;
  displayName: string;
  /** Empty until they choose one. */
  username: string;
  bio: string;
  phone: string;
  /** Full address of their picture, or null for the default one. */
  avatarUrl: string | null;
}

export interface SignUpInput {
  displayName: string;
  email: string;
  password: string;
}

export interface ProfileChanges {
  displayName?: string;
  username?: string;
  bio?: string;
  phone?: string;
  /** A new picture as a data URL, null to remove it; leave out to keep the current one. */
  avatar?: string | null;
}

export interface NewCommunityInput {
  /** Also the page address: /community/<slug> */
  slug: string;
  /** Written once, so it is shown in both languages. */
  name: string;
  description: string;
  category: CategoryId;
  image: CommunityImageKey;
}

export type BackendErrorCode =
  | "network" // the server couldn't be reached
  | "rate_limited" // too many attempts in a short time
  | "invalid_credentials" // wrong email or password
  | "email_taken"
  | "username_taken"
  | "slug_taken"
  | "wrong_password" // the current password, when changing it
  | "signed_out" // the action needs an account
  | "forbidden" // not allowed (e.g. deleting someone else's community)
  | "not_found"
  | "invalid" // the server rejected a value
  | "unknown";

export class BackendError extends Error {
  readonly code: BackendErrorCode;

  constructor(code: BackendErrorCode, message?: string) {
    super(message ?? code);
    this.name = "BackendError";
    this.code = code;
  }
}

export const errorCode = (error: unknown): BackendErrorCode =>
  error instanceof BackendError ? error.code : "unknown";

export interface Backend {
  /** The account from this browser's saved session, if any. Confirm it with refreshSession(). */
  currentAccount(): Account | null;
  /** Called whenever someone signs in or out, or their profile changes. Returns an unsubscribe function. */
  onAccountChange(listener: (account: Account | null) => void): () => void;
  /** Checks the saved session with the server; signs out if it is no longer valid. */
  refreshSession(): Promise<Account | null>;
  signUp(input: SignUpInput): Promise<Account>;
  signIn(email: string, password: string): Promise<Account>;
  signOut(): void;
  /** Emails a reset link if the address has an account (says nothing either way). */
  requestPasswordReset(email: string): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  updateProfile(changes: ProfileChanges): Promise<Account>;

  /** Every community, newest first. Readable without an account. */
  listCommunities(): Promise<Community[]>;
  createCommunity(input: NewCommunityInput): Promise<Community>;
  deleteCommunity(communityId: string): Promise<void>;
  /** Ids of the communities the signed-in person joined, oldest first. */
  listJoined(): Promise<string[]>;
  join(communityId: string): Promise<void>;
  leave(communityId: string): Promise<void>;
}
