import { describe, expect, it } from "vitest";
import { parseListQuery } from "../../src/lib/list-query.js";

describe("list query parser", () => {
  it("parses valid query values", () => {
    const result = parseListQuery({
      query: {
        page: "2",
        limit: "20",
        search: "john",
        sortBy: "createdAt",
        sortOrder: "asc",
        role: "admin"
      },
      allowedSortBy: ["createdAt", "email"],
      defaultSortBy: "createdAt",
      defaultPage: 1,
      defaultLimit: 10,
      maxLimit: 100,
      allowedFilters: ["role"]
    });

    expect(result).toMatchObject({
      page: 2,
      limit: 20,
      offset: 20,
      search: "john",
      sortBy: "createdAt",
      sortOrder: "asc",
      filters: {
        role: "admin"
      }
    });
  });

  it("caps limit to maxLimit", () => {
    const result = parseListQuery({
      query: { limit: "500" },
      allowedSortBy: ["createdAt"],
      defaultSortBy: "createdAt",
      defaultPage: 1,
      defaultLimit: 10,
      maxLimit: 100
    });

    expect(result.limit).toBe(100);
  });

  it("rejects invalid sort value", () => {
    expect(() =>
      parseListQuery({
        query: { sortBy: "role" },
        allowedSortBy: ["createdAt"],
        defaultSortBy: "createdAt",
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100
      })
    ).toThrow();
  });
});
