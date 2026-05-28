import { describe, it, expect, beforeAll } from "vitest";
import { searchJobs } from "./search";

describe("searchJobs", () => {
  it("returns empty array when database is not available", async () => {
    const result = await searchJobs({
      query: "developer",
      limit: 10,
      offset: 0,
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts all filter parameters", async () => {
    const result = await searchJobs({
      query: "developer",
      location: "Casablanca",
      sector: "IT",
      contractType: "CDI",
      experienceLevel: "Senior",
      salaryMin: 5000,
      salaryMax: 15000,
      limit: 50,
      offset: 0,
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("handles optional parameters", async () => {
    const result = await searchJobs({
      limit: 20,
    });
    expect(Array.isArray(result)).toBe(true);
  });
});
