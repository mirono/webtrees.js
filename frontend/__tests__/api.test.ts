import { ApiError } from "@/lib/api";

describe("ApiError", () => {
  it("creates an error with status and message", () => {
    const err = new ApiError(404, "Not found");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.name).toBe("ApiError");
    expect(err).toBeInstanceOf(Error);
  });
});
