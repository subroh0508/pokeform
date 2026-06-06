import { expect, test } from "vitest";
import { sanity } from "./sanity";

test("sanity returns true", () => {
  expect(sanity()).toBe(true);
});
