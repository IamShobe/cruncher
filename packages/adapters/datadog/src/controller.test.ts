import { describe, expect, test } from "vitest";
import adapter from ".";
import { AggregateResponseSchema, SuggestionsResponseSchema } from "./controller";

test("import", () => {
  expect(adapter).toBeDefined();
});

// ---------------------------------------------------------------------------
// AggregateResponseSchema
// ---------------------------------------------------------------------------

describe("AggregateResponseSchema", () => {
  test("valid response with buckets succeeds", () => {
    const input = {
      result: {
        buckets: [
          { by: { "kube_service": "payments" } },
          { by: { "kube_service": "auth" } },
        ],
      },
    };
    const parsed = AggregateResponseSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.result?.buckets).toHaveLength(2);
  });

  test("missing optional fields succeed (schema is not strict)", () => {
    const parsed = AggregateResponseSchema.safeParse({});
    expect(parsed.success).toBe(true);
    expect(parsed.data?.result).toBeUndefined();
  });

  test("bucket with top-level value field succeeds", () => {
    const input = {
      result: {
        buckets: [{ value: "some-value" }],
      },
    };
    const parsed = AggregateResponseSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.result?.buckets?.[0]?.value).toBe("some-value");
  });
});

// ---------------------------------------------------------------------------
// SuggestionsResponseSchema
// ---------------------------------------------------------------------------

describe("SuggestionsResponseSchema", () => {
  test("valid response with suggestions succeeds", () => {
    const input = {
      data: {
        attributes: {
          suggestions: [{ text: "kube-system" }, { text: "default" }],
        },
      },
    };
    const parsed = SuggestionsResponseSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.data?.attributes?.suggestions).toHaveLength(2);
  });

  test("suggestions with missing text field succeed", () => {
    const input = {
      data: {
        attributes: {
          suggestions: [{}],
        },
      },
    };
    const parsed = SuggestionsResponseSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.data?.attributes?.suggestions?.[0]?.text).toBeUndefined();
  });

  test("totally wrong shape succeeds with empty data (schema uses .optional() defensively)", () => {
    const parsed = SuggestionsResponseSchema.safeParse({ unexpected: true });
    expect(parsed.success).toBe(true);
    expect(parsed.data?.data).toBeUndefined();
  });
});
