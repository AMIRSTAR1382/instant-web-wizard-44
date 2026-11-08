import { seedCommunities, type Community } from "@/data/communities";
import { BackendError, type Account, type Backend, type ProfileChanges } from "./types";

/*
 * An in-memory server with the same rules as the real one (pocketbase/pb_migrations), for
 * tests. One server can have several connections, like several browsers using one site:
 * each connection has its own session, and they all see the same data.
 */

interface StoredUser extends Account {
  password: string;
}

interface Membership {
  userId: string;
  communityId: string;
}

export interface MemoryServer {
  /** A new "browser": its own session, the server's shared data. */
  connect(): Backend;
  /** While true, every call fails as if the server could not be reached. */
  offline: boolean;
  /** Read-only views for test assertions. */
  readonly communities: readonly Community[];
  readonly memberships: readonly Membership[];
}

const USERNAME_PATTERN = /^[a-zA-Z0-9._]{3,20}$/;

export function createMemoryServer(seed: Community[] = seedCommunities): MemoryServer {
  const users = new Map<string, StoredUser>();
  let communities: Community[] = seed.map((community) => ({ ...community }));
  let memberships: Membership[] = [];
  let nextId = 1;
  const newId = () => `id${nextId++}`;

  const server: MemoryServer = {
    offline: false,
    get communities() {
      return communities;
    },
    get memberships() {
      return memberships;
    },
    connect,
  };

  const reachServer = async () => {
    // Behave like a network call: never answer synchronously.
    await Promise.resolve();
    if (server.offline) throw new BackendError("network");
  };

  const publicAccount = ({ password: _password, ...account }: StoredUser): Account => ({ ...account });

  function connect(): Backend {
    let sessionUserId: string | null = null;
    const listeners = new Set<(account: Account | null) => void>();

    const current = () => {
      const user = sessionUserId ? users.get(sessionUserId) : undefined;
      return user ? publicAccount(user) : null;
    };
    const notify = () => listeners.forEach((listener) => listener(current()));
    const requireUser = () => {
      const user = sessionUserId ? users.get(sessionUserId) : undefined;
      if (!user) throw new BackendError("signed_out");
      return user;
    };
    const signInAs = (user: StoredUser) => {
      sessionUserId = user.id;
      notify();
      return publicAccount(user);
    };
    const changeMembers = (communityId: string, delta: number) => {
      communities = communities.map((community) =>
        community.id === communityId ? { ...community, members: Math.max(0, community.members + delta) } : community,
      );
    };

    return {
      currentAccount: current,

      onAccountChange(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },

      async refreshSession() {
        // Like the real one: when offline the saved session is kept as it is.
        await Promise.resolve();
        return current();
      },

      async signUp({ displayName, email, password }) {
        await reachServer();
        const normalized = email.trim().toLowerCase();
        if ([...users.values()].some((user) => user.email === normalized)) throw new BackendError("email_taken");
        if (password.length < 8 || !displayName.trim()) throw new BackendError("invalid");
        const user: StoredUser = {
          id: newId(),
          email: normalized,
          verified: false,
          displayName: displayName.trim(),
          username: "",
          bio: "",
          phone: "",
          avatarUrl: null,
          password,
        };
        users.set(user.id, user);
        return signInAs(user);
      },

      async signIn(email, password) {
        await reachServer();
        const user = [...users.values()].find((item) => item.email === email.trim().toLowerCase());
        if (!user || user.password !== password) throw new BackendError("invalid_credentials");
        return signInAs(user);
      },

      signOut() {
        sessionUserId = null;
        notify();
      },

      async requestPasswordReset() {
        await reachServer();
      },

      async changePassword(currentPassword, newPassword) {
        await reachServer();
        const user = requireUser();
        if (user.password !== currentPassword) throw new BackendError("wrong_password");
        if (newPassword.length < 8) throw new BackendError("invalid");
        user.password = newPassword;
      },

      async updateProfile(changes: ProfileChanges) {
        await reachServer();
        const user = requireUser();
        if (changes.username) {
          if (!USERNAME_PATTERN.test(changes.username)) throw new BackendError("invalid");
          const taken = [...users.values()].some((other) => other.id !== user.id && other.username === changes.username);
          if (taken) throw new BackendError("username_taken");
        }
        if (changes.displayName !== undefined) user.displayName = changes.displayName;
        if (changes.username !== undefined) user.username = changes.username;
        if (changes.bio !== undefined) user.bio = changes.bio;
        if (changes.phone !== undefined) user.phone = changes.phone;
        if (changes.avatar !== undefined) user.avatarUrl = changes.avatar;
        notify();
        return publicAccount(user);
      },

      async listCommunities() {
        await reachServer();
        return [...communities].sort((a, b) => b.createdAt - a.createdAt).map((community) => ({ ...community }));
      },

      async createCommunity(input) {
        await reachServer();
        const user = requireUser();
        if (communities.some((community) => community.id === input.slug)) throw new BackendError("slug_taken");
        const community: Community = {
          id: input.slug,
          name: { en: input.name, fa: input.name },
          description: { en: input.description, fa: input.description },
          category: input.category,
          image: input.image,
          members: 0,
          online: 0,
          createdAt: Date.now(),
          ownerId: user.id,
        };
        communities = [community, ...communities];
        // Like the server hook: the creator is the first member.
        memberships = [...memberships, { userId: user.id, communityId: community.id }];
        changeMembers(community.id, 1);
        return { ...communities[0] };
      },

      async deleteCommunity(communityId) {
        await reachServer();
        const user = requireUser();
        const community = communities.find((item) => item.id === communityId);
        if (!community) throw new BackendError("not_found");
        if (community.ownerId !== user.id) throw new BackendError("forbidden");
        communities = communities.filter((item) => item.id !== communityId);
        memberships = memberships.filter((membership) => membership.communityId !== communityId);
      },

      async listJoined() {
        await reachServer();
        const user = requireUser();
        return memberships.filter((membership) => membership.userId === user.id).map((membership) => membership.communityId);
      },

      async join(communityId) {
        await reachServer();
        const user = requireUser();
        if (!communities.some((community) => community.id === communityId)) throw new BackendError("not_found");
        if (memberships.some((m) => m.userId === user.id && m.communityId === communityId)) return;
        memberships = [...memberships, { userId: user.id, communityId }];
        changeMembers(communityId, 1);
      },

      async leave(communityId) {
        await reachServer();
        const user = requireUser();
        const before = memberships.length;
        memberships = memberships.filter((m) => !(m.userId === user.id && m.communityId === communityId));
        if (memberships.length < before) changeMembers(communityId, -1);
      },
    };
  }

  return server;
}
