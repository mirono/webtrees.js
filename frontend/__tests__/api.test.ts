import { api, ApiError, authApi, treesApi, individualsApi, familiesApi, searchApi, statsApi } from "@/lib/api";

describe("ApiError", () => {
  it("creates an error with status and message", () => {
    const err = new ApiError(404, "Not found");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.name).toBe("ApiError");
    expect(err).toBeInstanceOf(Error);
  });

  it("includes optional body", () => {
    const body = { detail: "User not found" };
    const err = new ApiError(404, "Not found", body);
    expect(err.body).toBe(body);
  });
});

describe("api client", () => {
  const fetchSpy = jest.spyOn(global, "fetch");

  beforeEach(() => {
    fetchSpy.mockClear();
  });

  it("constructs correct URL with API_BASE prefix", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response("[]", { status: 200, statusText: "OK" })
    );
    await api.get("/trees");
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/trees",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("includes credentials in requests", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response("[]", { status: 200, statusText: "OK" })
    );
    await api.get("/trees");
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/trees",
      expect.objectContaining({ credentials: "include" })
    );
  });

  it("throws ApiError on non-ok response", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{"detail":"error"}', {
        status: 500,
        statusText: "Internal Server Error",
      })
    );
    await expect(api.get("/trees")).rejects.toThrow(ApiError);
  });

  it("parses JSON error body on non-ok response", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{"code":"ERR_NOT_FOUND"}', {
        status: 404,
        statusText: "Not Found",
      })
    );
    await expect(api.get("/trees")).rejects.toMatchObject({
      status: 404,
      body: { code: "ERR_NOT_FOUND" },
    });
  });

  it("handles 204 No Content gracefully", async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const result = await api.delete("/auth/logout");
    expect(result).toBeUndefined();
  });

  it("serializes POST body as JSON", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{"id":1}', { status: 200, statusText: "OK" })
    );
    await api.post("/auth/login", { username: "alice", password: "secret" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "alice", password: "secret" }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
  });

  it("skips body for undefined POST", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{}', { status: 200, statusText: "OK" })
    );
    await api.post("/trees");
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/trees",
      expect.objectContaining({ method: "POST", body: undefined })
    );
  });

  it("forwards PATCH body correctly", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{}', { status: 200, statusText: "OK" })
    );
    await api.patch("/trees/1", { title: "New Title" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/trees/1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ title: "New Title" }),
      })
    );
  });
});

describe("authApi", () => {
  const fetchSpy = jest.spyOn(global, "fetch");

  beforeEach(() => fetchSpy.mockClear());

  it("calls GET /auth/me", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{"id":1,"username":"alice"}', { status: 200 })
    );
    await authApi.me();
    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/me", expect.any(Object));
  });

  it("calls POST /auth/login with credentials", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{"id":1,"username":"alice"}', { status: 200 })
    );
    await authApi.login("alice", "password123");
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "alice", password: "password123" }),
      })
    );
  });
});

describe("individualsApi", () => {
  const fetchSpy = jest.spyOn(global, "fetch");
  beforeEach(() => fetchSpy.mockClear());

  it("calls GET /individuals", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response("[]", { status: 200 })
    );
    await individualsApi.list();
    expect(fetchSpy).toHaveBeenCalledWith("/api/individuals", expect.any(Object));
  });

  it("calls GET /individuals/:id", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{"id":1,"gedcom_id":"I1","names":[],"events":[],"links":[]}', { status: 200 })
    );
    await individualsApi.get("I1");
    expect(fetchSpy).toHaveBeenCalledWith("/api/individuals/I1", expect.any(Object));
  });

  it("includes depth parameter for ancestors endpoint", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response("[]", { status: 200 })
    );
    await individualsApi.ancestors("I1", 5);
    expect(fetchSpy).toHaveBeenCalledWith("/api/individuals/I1/ancestors?depth=5", expect.any(Object));
  });

  it("uses default depth of 3 for ancestors", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response("[]", { status: 200 })
    );
    await individualsApi.ancestors("I1");
    expect(fetchSpy).toHaveBeenCalledWith("/api/individuals/I1/ancestors?depth=3", expect.any(Object));
  });
});

describe("searchApi", () => {
  const fetchSpy = jest.spyOn(global, "fetch");
  beforeEach(() => fetchSpy.mockClear());

  it("encodes search query in URL", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{"individuals":[],"families":[]}', { status: 200 })
    );
    await searchApi.search({ q: "John Smith" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/search?q=John%20Smith",
      expect.any(Object)
    );
  });

  it("appends treeId when provided", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{"individuals":[],"families":[]}', { status: 200 })
    );
    await searchApi.search({ q: "alice", treeId: 2 });
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/search?q=alice&treeId=2",
      expect.any(Object)
    );
  });
});

describe("statsApi", () => {
  const fetchSpy = jest.spyOn(global, "fetch");
  beforeEach(() => fetchSpy.mockClear());

  it("calls GET /stats", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{"individuals":100,"families":20,"sources":5,"media":50,"repositories":2,"notes":10}', { status: 200 })
    );
    const stats = await statsApi.get();
    expect(stats.individuals).toBe(100);
    expect(stats.media).toBe(50);
  });

  it("appends treeId when provided", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{"individuals":0,"families":0,"sources":0,"media":0,"repositories":0,"notes":0}', { status: 200 })
    );
    await statsApi.get(1);
    expect(fetchSpy).toHaveBeenCalledWith("/api/stats?treeId=1", expect.any(Object));
  });
});
