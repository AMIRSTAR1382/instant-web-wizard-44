import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import defaultAvatar from "@/assets/user-avatar.jpg";
import { usePersistentState } from "@/hooks/use-persistent-state";

export interface Profile {
  displayName: string;
  username: string;
  bio: string;
  email: string;
  phone: string;
  /** A small JPEG data URL chosen by the visitor, or null for the default picture. */
  avatar: string | null;
}

const defaultProfile: Profile = {
  displayName: "Md Amir Khan",
  username: "aamiiillliirrr",
  bio: "",
  email: "",
  phone: "",
  avatar: null,
};

interface ProfileValue {
  profile: Profile;
  /** The picture to show: the visitor's own, or the default one. */
  avatarUrl: string;
  updateProfile: (changes: Partial<Profile>) => void;
}

const ProfileContext = createContext<ProfileValue | null>(null);

/** The visitor's profile, saved in this browser until real accounts exist. */
export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [stored, setStored] = usePersistentState<Partial<Profile>>("profile", defaultProfile);

  // Fill in fields that older saved profiles don't have yet.
  const profile = useMemo<Profile>(() => ({ ...defaultProfile, ...stored }), [stored]);

  const updateProfile = useCallback(
    (changes: Partial<Profile>) => setStored((previous) => ({ ...defaultProfile, ...previous, ...changes })),
    [setStored],
  );

  const value = useMemo<ProfileValue>(
    () => ({ profile, avatarUrl: profile.avatar ?? defaultAvatar, updateProfile }),
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
