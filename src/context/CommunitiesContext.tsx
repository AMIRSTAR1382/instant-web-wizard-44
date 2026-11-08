import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBackend } from "@/context/BackendContext";
import { logActivity } from "@/hooks/use-activity-log";
import { seedCommunities, type CategoryId, type Community, type CommunityImageKey } from "@/data/communities";
import { BackendError, errorCode } from "@/lib/backend/types";

export interface NewCommunity {
  name: string;
  description: string;
  category: CategoryId;
  image: CommunityImageKey;
}

/** "loading" until the server has answered once; "error" if it couldn't be reached. */
export type LoadStatus = "loading" | "ready" | "error";

interface CommunitiesValue {
  /** Every community on the server (the built-in ones until it answers). */
  communities: Community[];
  status: LoadStatus;
  /** Asks the server again, e.g. after an error. */
  reload: () => Promise<void>;
  getCommunity: (id: string) => Community | undefined;
  /** Communities the signed-in person joined; empty for visitors. */
  joinedIds: string[];
  /** In the order they were joined. */
  joinedCommunities: Community[];
  isJoined: (id: string) => boolean;
  /** These need an account and reject with a BackendError when the server says no. */
  join: (id: string) => Promise<void>;
  leave: (id: string) => Promise<void>;
  createCommunity: (input: NewCommunity) => Promise<Community>;
  deleteCommunity: (id: string) => Promise<void>;
}

const CommunitiesContext = createContext<CommunitiesValue | null>(null);

/** "Tehran Game Devs" -> "tehran-game-devs"; Persian letters are kept. */
function makeId(name: string, taken: Set<string>) {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)
      .replace(/-+$/, "") || "community";
  let id = base;
  while (taken.has(id)) id = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  return id;
}

// Communities created elsewhere show up when the visitor comes back to the tab.
const REFRESH_AFTER_MS = 30_000;

/** Which communities exist (shared by everyone, on the server) and which ones the visitor joined. */
export const CommunitiesProvider = ({ children }: { children: ReactNode }) => {
  const backend = useBackend();
  const { account } = useAuth();
  const accountId = account?.id ?? null;

  const [list, setList] = useState<Community[]>(seedCommunities);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const lastLoadedAt = useRef(0);
  // Joins and leaves still on their way, so a membership list that arrives meanwhile keeps them.
  const pending = useRef(new Map<string, "join" | "leave">());

  const reload = useCallback(async () => {
    try {
      const communities = await backend.listCommunities();
      setList(communities);
      setStatus("ready");
      lastLoadedAt.current = Date.now();
    } catch {
      setStatus((previous) => (previous === "ready" ? "ready" : "error"));
    }
  }, [backend]);

  useEffect(() => {
    void reload();
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastLoadedAt.current > REFRESH_AFTER_MS) void reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [reload]);

  // The signed-in person's memberships; a visitor has none.
  useEffect(() => {
    if (!accountId) {
      setJoinedIds([]);
      return;
    }
    let cancelled = false;
    backend
      .listJoined()
      .then((ids) => {
        if (cancelled) return;
        const merged = ids.filter((id) => pending.current.get(id) !== "leave");
        pending.current.forEach((action, id) => {
          if (action === "join" && !merged.includes(id)) merged.push(id);
        });
        setJoinedIds(merged);
      })
      .catch(() => {
        // Membership icons stay empty; joining still works and retries the server.
      });
    return () => {
      cancelled = true;
    };
  }, [backend, accountId]);

  const communities = useMemo<Community[]>(
    () => list.map((community) => ({ ...community, createdByUser: Boolean(accountId && community.ownerId === accountId) })),
    [list, accountId],
  );
  const byId = useMemo(() => new Map(communities.map((community) => [community.id, community])), [communities]);

  const getCommunity = useCallback((id: string) => byId.get(id), [byId]);
  const isJoined = useCallback((id: string) => joinedIds.includes(id), [joinedIds]);

  const joinedCommunities = useMemo(
    () => joinedIds.map((id) => byId.get(id)).filter((community): community is Community => Boolean(community)),
    [joinedIds, byId],
  );

  const changeMembers = (id: string, delta: number) =>
    setList((previous) =>
      previous.map((community) =>
        community.id === id ? { ...community, members: Math.max(0, community.members + delta) } : community,
      ),
    );

  /** Shows the change at once, and undoes it if the server refuses. */
  const changeMembership = useCallback(
    async (id: string, action: "join" | "leave") => {
      const community = byId.get(id);
      if (!community) throw new BackendError("not_found");
      const joining = action === "join";
      pending.current.set(id, action);
      setJoinedIds((previous) =>
        joining ? (previous.includes(id) ? previous : [...previous, id]) : previous.filter((item) => item !== id),
      );
      changeMembers(id, joining ? 1 : -1);
      try {
        await (joining ? backend.join(id) : backend.leave(id));
        logActivity({ type: joining ? "joined" : "left", communityId: id, communityName: community.name });
      } catch (error) {
        setJoinedIds((previous) =>
          joining ? previous.filter((item) => item !== id) : previous.includes(id) ? previous : [...previous, id],
        );
        changeMembers(id, joining ? -1 : 1);
        throw error;
      } finally {
        pending.current.delete(id);
      }
    },
    [backend, byId],
  );

  const join = useCallback((id: string) => changeMembership(id, "join"), [changeMembership]);
  const leave = useCallback((id: string) => changeMembership(id, "leave"), [changeMembership]);

  const createCommunity = useCallback(
    async (input: NewCommunity) => {
      const name = input.name.trim();
      const description = input.description.trim();
      const taken = new Set(byId.keys());
      const create = (slug: string) =>
        backend.createCommunity({ slug, name, description, category: input.category, image: input.image });
      let community: Community;
      try {
        community = await create(makeId(name, taken));
      } catch (error) {
        // Someone took that address in the meantime: try once more with a random ending.
        if (errorCode(error) !== "slug_taken") throw error;
        taken.add(makeId(name, taken));
        community = await create(makeId(name, taken));
      }
      // The server makes the creator its first member.
      setList((previous) => [community, ...previous.filter((item) => item.id !== community.id)]);
      setJoinedIds((previous) => (previous.includes(community.id) ? previous : [...previous, community.id]));
      logActivity({ type: "created", communityId: community.id, communityName: community.name });
      return { ...community, createdByUser: true };
    },
    [backend, byId],
  );

  const deleteCommunity = useCallback(
    async (id: string) => {
      const community = byId.get(id);
      await backend.deleteCommunity(id);
      setList((previous) => previous.filter((item) => item.id !== id));
      setJoinedIds((previous) => previous.filter((joinedId) => joinedId !== id));
      if (community) logActivity({ type: "deleted", communityName: community.name });
    },
    [backend, byId],
  );

  const value = useMemo<CommunitiesValue>(
    () => ({
      communities,
      status,
      reload,
      getCommunity,
      joinedIds,
      joinedCommunities,
      isJoined,
      join,
      leave,
      createCommunity,
      deleteCommunity,
    }),
    [communities, status, reload, getCommunity, joinedIds, joinedCommunities, isJoined, join, leave, createCommunity, deleteCommunity],
  );

  return <CommunitiesContext.Provider value={value}>{children}</CommunitiesContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useCommunities() {
  const context = useContext(CommunitiesContext);
  if (!context) throw new Error("useCommunities must be used inside <CommunitiesProvider>");
  return context;
}
