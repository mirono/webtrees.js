import "@testing-library/jest-dom";

const MockResponse = class MockResponse {
  body: BodyInit | null;
  init?: ResponseInit;
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body ?? null;
    this.init = init;
  }
  get ok() { return (this.init?.status ?? 200) >= 200 && (this.init?.status ?? 200) < 300; }
  get status() { return this.init?.status ?? 200; }
  get statusText() { return this.init?.statusText ?? ""; }
  async json(): Promise<unknown> { return JSON.parse(await this.text()); }
  async text(): Promise<string> {
    if (typeof this.body === "string") return this.body;
    return "";
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Response = MockResponse as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).fetch = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Headers = class Headers {
  constructor(init?: HeadersInit) {
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([k, v]) => this.set(k, v));
      } else {
        Object.entries(init).forEach(([k, v]) => this.set(k, v));
      }
    }
  }
  private data: Record<string, string> = {};
  get(k: string) { return this.data[k.toLowerCase()] ?? null; }
  has(k: string) { return k.toLowerCase() in this.data; }
  set(k: string, v: string) { this.data[k.toLowerCase()] = v; }
} as any;
