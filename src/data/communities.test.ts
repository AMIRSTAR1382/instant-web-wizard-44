import { describe, expect, it } from "vitest";
import { categoryIds, communityImages, communityMatches, defaultJoinedIds, normalizeForSearch, seedCommunities } from "./communities";

const byId = (id: string) => seedCommunities.find((community) => community.id === id)!;

describe("normalizeForSearch", () => {
  it("treats Arabic ي and ك like Persian ی and ک", () => {
    expect(normalizeForSearch("علي")).toBe(normalizeForSearch("علی"));
    expect(normalizeForSearch("كد")).toBe(normalizeForSearch("کد"));
  });

  it("ignores the zero-width non-joiner and letter case", () => {
    expect(normalizeForSearch("برنامه‌نویسی")).toBe("برنامهنویسی");
    expect(normalizeForSearch("  Python ")).toBe("python");
  });
});

describe("communityMatches", () => {
  const python = byId("python-pros");

  it("finds a community by its English or Persian name", () => {
    expect(communityMatches(python, "python")).toBe(true);
    expect(communityMatches(python, python.name.fa)).toBe(true);
  });

  it("finds a community by its category in either language", () => {
    expect(communityMatches(python, "coding")).toBe(true);
    // Typed without the zero-width non-joiner, as many people do.
    expect(communityMatches(python, "برنامهنویسی")).toBe(true);
  });

  it("needs every word of the query to match", () => {
    expect(communityMatches(python, "python zzzz")).toBe(false);
  });

  it("matches everything for an empty query", () => {
    expect(communityMatches(python, "   ")).toBe(true);
  });
});

describe("built-in communities", () => {
  it("have unique ids that are safe in a URL", () => {
    const ids = seedCommunities.map((community) => community.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/));
  });

  it("use known categories and images and have text in both languages", () => {
    seedCommunities.forEach((community) => {
      expect(categoryIds).toContain(community.category);
      expect(Object.keys(communityImages)).toContain(community.image);
      expect(community.name.en && community.name.fa).toBeTruthy();
      expect(community.description.en && community.description.fa).toBeTruthy();
    });
  });

  it("start the visitor in communities that exist", () => {
    defaultJoinedIds.forEach((id) => expect(byId(id)).toBeDefined());
  });
});
