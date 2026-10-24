import { describe, it, expect } from "vitest";
import { AppwriteException } from "appwrite";
import { getErrorMessage, isGuestError } from "./errors";

describe("getErrorMessage", () => {
  it("maps known Appwrite error types to friendly copy", () => {
    const err = new AppwriteException("raw", 401, "user_invalid_credentials");
    expect(getErrorMessage(err)).toBe("Incorrect email or password.");
  });

  it("falls back to the Appwrite message for unknown types", () => {
    const err = new AppwriteException("Collection not found", 404, "something_else");
    expect(getErrorMessage(err)).toBe("Collection not found");
  });

  it("handles plain Errors", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("handles non-error values", () => {
    expect(getErrorMessage("nope")).toBe("Something went wrong. Please try again.");
    expect(getErrorMessage(undefined)).toBe(
      "Something went wrong. Please try again."
    );
  });
});

describe("isGuestError", () => {
  it("is true for a 401 Appwrite exception", () => {
    expect(isGuestError(new AppwriteException("x", 401, "whatever"))).toBe(true);
  });

  it("is false for other errors", () => {
    expect(isGuestError(new AppwriteException("x", 404, "document_not_found"))).toBe(
      false
    );
    expect(isGuestError(new Error("x"))).toBe(false);
  });
});
