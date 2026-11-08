import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import defaultAvatar from "@/assets/user-avatar.webp";
import { useAuth } from "@/context/AuthContext";
import type { ProfileChanges } from "@/lib/backend/types";

export interface Profile {
  displayName: string;
  /** Empty until they choose one. */
  username: string;
  bio: string;
  /** The account's email (shown, not changed, from the profile). */
  email: string;
  phone: string;
  /** Address of their picture (or a data URL just picked), or null for the default picture. */
  avatar: string | null;
}

interface ProfileValue {
  /** The signed-in person's profile; null for a visitor without an account. */
  profile: Profile | null;
  /** The picture to show: theirs, or the default one. */
  avatarUrl: string;
  /** Saves on the server. Rejects with a BackendError (e.g. "username_taken") when it can't. */
  updateProfile: (changes: Partial<Profile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileValue | null>(null);

/** The signed-in person's profile, which lives on their account on the server. */
export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { account, updateAccount } = useAuth();

  const profile = useMemo<Profile | null>(
    () =>
      account && {
        displayName: account.displayName,
        username: account.username,
        bio: account.bio,
        email: account.email,
        phone: account.phone,
        avatar: account.avatarUrl,
      },
    [account],
  );

  const updateProfile = useCallback(
    async (changes: Partial<Profile>) => {
      const update: ProfileChanges = {};
      if (changes.displayName !== undefined) update.displayName = changes.displayName;
      if (changes.username !== undefined) update.username = changes.username;
      if (changes.bio !== undefined) update.bio = changes.bio;
      if (changes.phone !== undefined) update.phone = changes.phone;
      // Only send the picture when it changed: a new one is a data URL, null removes it.
      if (changes.avatar !== undefined && changes.avatar !== profile?.avatar) update.avatar = changes.avatar;
      await updateAccount(update);
    },
    [profile?.avatar, updateAccount],
  );

  const value = useMemo<ProfileValue>(
    () => ({ profile, avatarUrl: profile?.avatar ?? defaultAvatar, updateProfile }),
    [profile, updateProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used inside <ProfileProvider>");
  return context;
}
