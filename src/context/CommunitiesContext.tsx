import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { logActivity } from "@/hooks/use-activity-log";
import {
  defaultJoinedIds,
  seedCommunities,
  type CategoryId,
  type Community,
  type CommunityImageKey,
} from "@/data/communities";

export interface NewCommunity {
  name: string;
  description: string;
  category: CategoryId;
  image: CommunityImageKey;
}

interface CommunitiesValue {
  /** Built-in communities plus the ones created in this browser. */
  communities: Community[];
  getCommunity: (id: string) => Community | undefined;
  joinedIds: string[];
  /** In the order they were joined. */
  joinedCommunities: Community[];
  isJoined: (id: string) => boolean;
  join: (id: string) => void;
  leave: (id: string) => void;
  createCommunity: (input: NewCommunity) => Community;
  deleteCommunity: (id: string) => void;
}

const CommunitiesContext = createContext<CommunitiesValue | null>(null);

/** "Tehran Game Devs" -> "tehran-game-devs-k3x9"; Persian letters are kept. */
function makeId(name: string, taken: Set<string>) {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "community";
  let id = base;
  while (taken.has(id)) id = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  return id;
}

/**
 * Which communities exist and which ones the visitor joined. There is no server yet, so
 * created communities and memberships are saved in this browser (see CHECKLIST.md).
 */
export const CommunitiesProvider = ({ children }: { children: ReactNode }) => {
  const [created, setCreated] = usePersistentState<Community[]>("communities.created", []);
  const [joinedIds, setJoinedIds] = usePersistentState<string[]>("communities.joined", defaultJoinedIds);

  const communities = useMemo(() => [...created, ...seedCommunities], [created]);
  const byId = useMemo(() => new Map(communities.map((community) => [community.id, community])), [communities]);

  const getCommunity = useCallback((id: string) => byId.get(id), [byId]);
  const isJoined = useCallback((id: string) => joinedIds.includes(id), [joinedIds]);

  const joinedCommunities = useMemo(
    () => joinedIds.map((id) => byId.get(id)).filter((community): community is Community => Boolean(community)),
    [joinedIds, byId],
  );

  const join = useCallback(
    (id: string) => {
      const community = byId.get(id);
      if (!community || joinedIds.includes(id)) return;
      setJoinedIds((previous) => (previous.includes(id) ? previous : [...previous, id]));
      logActivity({ type: "joined", communityId: id, communityName: community.name });
    },
    [byId, joinedIds, setJoinedIds],
  );

  const leave = useCallback(
    (id: string) => {
      const community = byId.get(id);
      if (!joinedIds.includes(id)) return;
      setJoinedIds((previous) => previous.filter((joinedId) => joinedId !== id));
      if (community) logActivity({ type: "left", communityId: id, communityName: community.name });
    },
    [byId, joinedIds, setJoinedIds],
  );

  const createCommunity = useCallback(
    (input: NewCommunity) => {
      const name = input.name.trim();
      const description = input.description.trim();
      const community: Community = {
        id: makeId(name, new Set(byId.keys())),
        // Written once, so the same text is shown in both languages.
        name: { en: name, fa: name },
        description: { en: description, fa: description },
        category: input.category,
        image: input.image,
        members: 1,
        online: 1,
        createdAt: Date.now(),
        createdByUser: true,
      };
      setCreated((previous) => [community, ...previous]);
      setJoinedIds((previous) => [...previous, community.id]);
      logActivity({ type: "created", communityId: community.id, communityName: community.name });
      return community;
    },
    [byId, setCreated, setJoinedIds],
  );

  const deleteCommunity = useCallback(
    (id: string) => {
      const community = byId.get(id);
      if (!community?.createdByUser) return;
      setCreated((previous) => previous.filter((item) => item.id !== id));
      setJoinedIds((previous) => previous.filter((joinedId) => joinedId !== id));
      logActivity({ type: "deleted", communityName: community.name });
    },
    [byId, setCreated, setJoinedIds],
  );

  const value = useMemo<CommunitiesValue>(
    () => ({
      communities,
      getCommunity,
      joinedIds,
      joinedCommunities,
      isJoined,
      join,
      leave,
      createCommunity,
      deleteCommunity,
    }),
    [communities, getCommunity, joinedIds, joinedCommunities, isJoined, join, leave, createCommunity, deleteCommunity],
  );

  return <CommunitiesContext.Provider value={value}>{children}</CommunitiesContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useCommunities() {
  const context = useContext(CommunitiesContext);
  if (!context) throw new Error("useCommunities must be used inside <CommunitiesProvider>");
  return context;
}
