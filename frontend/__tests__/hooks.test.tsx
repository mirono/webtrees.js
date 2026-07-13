import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useIndividual,
  useAncestors,
  useFamily,
  useSearch,
  useStats,
  useTrees,
} from "@/hooks/useQueries";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useIndividual", () => {
  it("returns individual data", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new global.Response(
        JSON.stringify({ id: 1, gedcom_id: "I1", names: [], events: [], links: [] }),
      )
    );

    const { result } = renderHook(() => useIndividual("I1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.gedcom_id).toBe("I1");
  });

  it("does not fetch when id is empty", async () => {
    const { result } = renderHook(() => useIndividual(""), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useAncestors", () => {
  it("fetches with default depth", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new global.Response("[]")
    );

    renderHook(() => useAncestors("I1"), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/individuals/I1/ancestors?depth=3",
        expect.any(Object)
      );
    });
  });

  it("fetches with custom depth", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new global.Response("[]")
    );

    renderHook(() => useAncestors("I1", 5), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/individuals/I1/ancestors?depth=5",
        expect.any(Object)
      );
    });
  });
});

describe("useFamily", () => {
  it("returns family data", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new global.Response(
        JSON.stringify({ id: 1, gedcom_id: "F1", children: [] })
      )
    );

    const { result } = renderHook(() => useFamily("F1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.gedcom_id).toBe("F1");
  });
});

describe("useSearch", () => {
  it("does not fetch when query is too short", async () => {
    const { result } = renderHook(() => useSearch("a"), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("fetches when query is 2+ chars", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new global.Response(JSON.stringify({ individuals: [], families: [] }))
    );

    renderHook(() => useSearch("alice"), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/search?q=alice",
        expect.any(Object)
      );
    });
  });
});

describe("useStats", () => {
  it("returns stats data", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new global.Response(
        JSON.stringify({
          individuals: 50,
          families: 10,
          sources: 3,
          media: 20,
          repositories: 1,
          notes: 5,
        })
      )
    );

    const { result } = renderHook(() => useStats(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.individuals).toBe(50);
  });
});

describe("useTrees", () => {
  it("fetches trees list", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new global.Response(
        JSON.stringify([{ id: 1, name: "tree1", title: "My Family Tree" }])
      )
    );

    const { result } = renderHook(() => useTrees(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe("tree1");
  });
});
