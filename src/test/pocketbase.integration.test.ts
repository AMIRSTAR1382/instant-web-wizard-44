import { describe, expect, it } from "vitest";
import PocketBase, { BaseAuthStore } from "pocketbase";
import { createPocketBaseBackend } from "@/lib/backend/pocketbase";
import { errorCode } from "@/lib/backend/types";

/*
 * Checks the real server's access rules (pocketbase/pb_migrations) and hooks (pocketbase/pb_hooks).
 * Skipped unless a PocketBase is running and PB_TEST_URL points at it:
 *
 *   npm run backend                                   (in one terminal)
 *   PB_TEST_URL=http://127.0.0.1:8090 npm test        (in another; PowerShell: $env:PB_TEST_URL="...")
 *
 * It creates two throwaway accounts and one community, and deletes the community again.
 */
const url = process.env.PB_TEST_URL;
const run = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** A separate "browser": its own session, kept in memory. */
function browser() {
  const store = new BaseAuthStore();
  // A plain client on the same session, for requests the site itself would never send.
  // (Auto-cancel off: its AbortSignal comes from jsdom, which Node's fetch rejects.)
  const raw = new PocketBase(url, store);
  raw.autoCancellation(false);
  return { backend: createPocketBaseBackend(url, store), raw };
}

const failureOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
    return "succeeded";
  } catch (error) {
    return errorCode(error) === "unknown" ? (error as { status?: number }).status : errorCode(error);
  }
};

describe.skipIf(!url)("the PocketBase server", () => {
  it("lets visitors read communities but not create them", async () => {
    const visitor = browser();
    const communities = await visitor.backend.listCommunities();
    expect(communities.map((community) => community.id)).toEqual(expect.arrayContaining(["gaming-zone", "python-pros"]));
    const created = await failureOf(
      visitor.raw.collection("communities").create({
        slug: `visitor-${run}`,
        name_en: "Visitor",
        name_fa: "Visitor",
        description_en: "Should never be created",
        description_fa: "Should never be created",
        category: "gaming",
        image: "vr",
      }),
    );
    expect(created).not.toBe("succeeded");
  });

  it("enforces owners, memberships and member counts", async () => {
    const sara = browser();
    const omid = browser();
    const saraAccount = await sara.backend.signUp({ displayName: "Sara", email: `sara-${run}@example.com`, password: "correct-horse" });
    await omid.backend.signUp({ displayName: "Omid", email: `omid-${run}@example.com`, password: "battery-staple" });

    // Signing up twice with one email fails clearly.
    expect(
      await failureOf(browser().backend.signUp({ displayName: "Again", email: `sara-${run}@example.com`, password: "whatever-123" })),
    ).toBe("email_taken");

    // The server decides the owner, the count and the date, whatever the request says.
    const slug = `test-${run}`;
    const community = await sara.backend.createCommunity({
      slug,
      name: "Integration Test",
      description: "Created by the integration test",
      category: "coding",
      image: "art",
    });
    // The creator joined automatically.
    expect(community).toMatchObject({ id: slug, ownerId: saraAccount.id, members: 1 });
    const read = async () => (await omid.backend.listCommunities()).find((item) => item.id === slug)!;
    expect((await read()).members).toBe(1);
    expect(await sara.backend.listJoined()).toContain(slug);

    // Someone else sees it, can join and leave, but cannot change or delete it.
    expect(await failureOf(omid.backend.deleteCommunity(slug))).not.toBe("succeeded");
    const recordId = (await omid.raw.collection("communities").getFirstListItem(`slug = "${slug}"`)).id;
    expect(await failureOf(omid.raw.collection("communities").update(recordId, { name_en: "Hacked" }))).not.toBe("succeeded");
    await omid.backend.join(slug);
    expect((await read()).members).toBe(2);
    // ...and cannot sign anyone else up for it.
    expect(
      await failureOf(omid.raw.collection("memberships").create({ user: saraAccount.id, community: recordId })),
    ).not.toBe("succeeded");
    await omid.backend.leave(slug);
    expect((await read()).members).toBe(1);

    // Not even the owner can set the member count by hand.
    expect(await failureOf(sara.raw.collection("communities").update(recordId, { members: 999_999 }))).not.toBe("succeeded");

    // Usernames are unique.
    await sara.backend.updateProfile({ username: `sara_${run}`.slice(0, 20) });
    expect(await failureOf(omid.backend.updateProfile({ username: `sara_${run}`.slice(0, 20) }))).toBe("username_taken");

    // Memberships are private.
    expect(await omid.raw.collection("memberships").getFullList({ filter: `user = "${saraAccount.id}"` })).toEqual([]);

    await sara.backend.deleteCommunity(slug);
    expect(await read()).toBeUndefined();
  });
});
