import PocketBase, { ClientResponseError, type BaseAuthStore, type RecordModel } from "pocketbase";
import { isCategoryId, type Community, type CommunityImageKey, communityImageKeys } from "@/data/communities";
import { BackendError, type Account, type Backend, type BackendErrorCode } from "./types";

/*
 * The site's server is PocketBase (see pocketbase/ and DEPLOY.md). In production it serves the
 * site and its API from the same address, so the default "/" is right; VITE_API_URL can point
 * the site at a backend on another address instead (e.g. https://api.example.com).
 */

type FieldErrors = Record<string, { code?: string; message?: string } | undefined>;

function fieldErrors(error: ClientResponseError): FieldErrors {
  const data = error.response?.data as FieldErrors | undefined;
  return data && typeof data === "object" ? data : {};
}

const isUniqueError = (field?: { code?: string }) => Boolean(field?.code?.includes("unique"));

/** Turns a PocketBase error into one of the site's error codes. */
function toBackendError(error: unknown, context: "signIn" | "signUp" | "profile" | "password" | "community" | "other" = "other"): BackendError {
  if (error instanceof BackendError) return error;
  if (!(error instanceof ClientResponseError)) return new BackendError("unknown", String(error));
  const fields = fieldErrors(error);
  let code: BackendErrorCode = "unknown";
  if (error.status === 0) code = "network";
  else if (error.status === 429) code = "rate_limited";
  else if (error.status === 401) code = "signed_out";
  else if (error.status === 403) code = "forbidden";
  else if (error.status === 404) code = "not_found";
  else if (error.status === 400) {
    if (context === "signIn") code = "invalid_credentials";
    else if (context === "signUp" && fields.email) code = isUniqueError(fields.email) ? "email_taken" : "invalid";
    else if (context === "profile" && isUniqueError(fields.username)) code = "username_taken";
    else if (context === "password" && fields.oldPassword) code = "wrong_password";
    else if (context === "community" && isUniqueError(fields.slug)) code = "slug_taken";
    else code = "invalid";
  }
  return new BackendError(code, error.message);
}

/** PocketBase dates look like "2025-09-27 00:00:00.000Z". */
const parseDate = (value: unknown) => {
  const time = typeof value === "string" && value ? Date.parse(value.replace(" ", "T")) : NaN;
  return Number.isNaN(time) ? Date.now() : time;
};

async function dataUrlToFile(dataUrl: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const extension = blob.type.split("/")[1] || "jpg";
  return new File([blob], `avatar.${extension}`, { type: blob.type || "image/jpeg" });
}

export function createPocketBaseBackend(
  baseUrl: string = import.meta.env.VITE_API_URL || "/",
  /** Where the session is kept; by default this browser's localStorage. Tests pass a memory store. */
  authStore?: BaseAuthStore,
): Backend {
  const pb = new PocketBase(baseUrl, authStore);
  // The SDK cancels a request when an identical one starts; the site never wants that.
  pb.autoCancellation(false);

  // Communities are addressed by slug on the site, by record id on the server.
  const recordIdBySlug = new Map<string, string>();
  const membershipIdBySlug = new Map<string, string>();

  const toAccount = (record: RecordModel): Account => ({
    id: record.id,
    email: String(record.email ?? ""),
    verified: Boolean(record.verified),
    displayName: String(record.name ?? ""),
    username: String(record.username ?? ""),
    bio: String(record.bio ?? ""),
    phone: String(record.phone ?? ""),
    avatarUrl: record.avatar ? pb.files.getURL(record, String(record.avatar)) : null,
  });

  const toCommunity = (record: RecordModel): Community => {
    recordIdBySlug.set(String(record.slug), record.id);
    const image = String(record.image) as CommunityImageKey;
    return {
      id: String(record.slug),
      name: { en: String(record.name_en), fa: String(record.name_fa) },
      description: { en: String(record.description_en), fa: String(record.description_fa) },
      category: isCategoryId(record.category) ? record.category : "gaming",
      image: communityImageKeys.includes(image) ? image : "hero",
      members: Number(record.members) || 0,
      online: Number(record.online) || 0,
      featured: Boolean(record.featured),
      createdAt: parseDate(record.started || record.created),
      ownerId: record.owner ? String(record.owner) : undefined,
    };
  };

  const current = () => {
    const record = pb.authStore.isValid ? pb.authStore.record : null;
    return record ? toAccount(record) : null;
  };

  const requireAccount = () => {
    const account = current();
    if (!account) throw new BackendError("signed_out");
    return account;
  };

  const users = () => pb.collection("users");

  async function recordIdFor(slug: string) {
    const known = recordIdBySlug.get(slug);
    if (known) return known;
    try {
      const record = await pb.collection("communities").getFirstListItem(pb.filter("slug = {:slug}", { slug }), { fields: "id,slug" });
      recordIdBySlug.set(slug, record.id);
      return record.id;
    } catch (error) {
      throw toBackendError(error);
    }
  }

  return {
    currentAccount: current,

    onAccountChange(listener) {
      return pb.authStore.onChange(() => listener(current()));
    },

    async refreshSession() {
      if (!pb.authStore.isValid) {
        if (pb.authStore.token) pb.authStore.clear();
        return null;
      }
      try {
        await users().authRefresh();
      } catch (error) {
        const failure = toBackendError(error);
        // Offline: keep the saved session; it is checked again on the next visit.
        if (failure.code === "network" || failure.code === "rate_limited") return current();
        pb.authStore.clear();
      }
      return current();
    },

    async signUp({ displayName, email, password }) {
      try {
        await users().create({ email, password, passwordConfirm: password, name: displayName });
      } catch (error) {
        throw toBackendError(error, "signUp");
      }
      try {
        return toAccount((await users().authWithPassword(email, password)).record);
      } catch (error) {
        throw toBackendError(error, "signIn");
      }
    },

    async signIn(email, password) {
      try {
        return toAccount((await users().authWithPassword(email, password)).record);
      } catch (error) {
        throw toBackendError(error, "signIn");
      }
    },

    signOut() {
      membershipIdBySlug.clear();
      pb.authStore.clear();
    },

    async requestPasswordReset(email) {
      try {
        await users().requestPasswordReset(email);
      } catch (error) {
        throw toBackendError(error);
      }
    },

    async changePassword(currentPassword, newPassword) {
      const account = requireAccount();
      try {
        await users().update(account.id, { oldPassword: currentPassword, password: newPassword, passwordConfirm: newPassword });
      } catch (error) {
        throw toBackendError(error, "password");
      }
      // A new password ends every session, this one included: sign straight back in.
      try {
        await users().authWithPassword(account.email, newPassword);
      } catch (error) {
        throw toBackendError(error, "signIn");
      }
    },

    async updateProfile(changes) {
      const account = requireAccount();
      const body: Record<string, unknown> = {};
      if (changes.displayName !== undefined) body.name = changes.displayName;
      if (changes.username !== undefined) body.username = changes.username;
      if (changes.bio !== undefined) body.bio = changes.bio;
      if (changes.phone !== undefined) body.phone = changes.phone;
      if (changes.avatar === null) body.avatar = null;
      else if (changes.avatar?.startsWith("data:")) body.avatar = await dataUrlToFile(changes.avatar);
      try {
        // The SDK also refreshes the saved session with the updated record.
        return toAccount(await users().update(account.id, body));
      } catch (error) {
        throw toBackendError(error, "profile");
      }
    },

    async listCommunities() {
      try {
        const records = await pb.collection("communities").getFullList({ sort: "-started", batch: 500 });
        return records.map(toCommunity);
      } catch (error) {
        throw toBackendError(error);
      }
    },

    async createCommunity(input) {
      const account = requireAccount();
      try {
        const record = await pb.collection("communities").create({
          slug: input.slug,
          name_en: input.name,
          name_fa: input.name,
          description_en: input.description,
          description_fa: input.description,
          category: input.category,
          image: input.image,
          owner: account.id,
        });
        // Read it back: the server has since made the creator its first member.
        return toCommunity(await pb.collection("communities").getOne(record.id));
      } catch (error) {
        throw toBackendError(error, "community");
      }
    },

    async deleteCommunity(communityId) {
      requireAccount();
      try {
        await pb.collection("communities").delete(await recordIdFor(communityId));
        recordIdBySlug.delete(communityId);
        membershipIdBySlug.delete(communityId);
      } catch (error) {
        throw toBackendError(error);
      }
    },

    async listJoined() {
      const account = requireAccount();
      try {
        const records = await pb.collection("memberships").getFullList({
          filter: pb.filter("user = {:user}", { user: account.id }),
          sort: "created",
          expand: "community",
          fields: "id,community,expand.community.slug",
          batch: 500,
        });
        membershipIdBySlug.clear();
        const slugs: string[] = [];
        for (const record of records) {
          const slug = (record.expand?.community as RecordModel | undefined)?.slug;
          if (typeof slug !== "string") continue;
          recordIdBySlug.set(slug, String(record.community));
          membershipIdBySlug.set(slug, record.id);
          slugs.push(slug);
        }
        return slugs;
      } catch (error) {
        throw toBackendError(error);
      }
    },

    async join(communityId) {
      const account = requireAccount();
      try {
        const record = await pb.collection("memberships").create({ user: account.id, community: await recordIdFor(communityId) });
        membershipIdBySlug.set(communityId, record.id);
      } catch (error) {
        const failure = toBackendError(error);
        // Already a member (e.g. joined in another tab): nothing to do.
        if (failure.code === "invalid") return;
        throw failure;
      }
    },

    async leave(communityId) {
      const account = requireAccount();
      try {
        let membershipId = membershipIdBySlug.get(communityId);
        if (!membershipId) {
          const community = await recordIdFor(communityId);
          const record = await pb
            .collection("memberships")
            .getFirstListItem(pb.filter("user = {:user} && community = {:community}", { user: account.id, community }), { fields: "id" });
          membershipId = record.id;
        }
        await pb.collection("memberships").delete(membershipId);
        membershipIdBySlug.delete(communityId);
      } catch (error) {
        const failure = toBackendError(error);
        // Not a member any more (e.g. left in another tab): nothing to do.
        if (failure.code === "not_found") return;
        throw failure;
      }
    },
  };
}
