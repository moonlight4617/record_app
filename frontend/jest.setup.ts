import "@testing-library/jest-dom";

// Next.js API routes用のグローバルmock
const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Web APIのmock
Object.defineProperty(global, "Request", {
  value: class Request {
    url: string;
    method: string;
    headers: Map<string, string>;
    body: any;

    constructor(input: any, init?: any) {
      this.url = input;
      this.method = init?.method || "GET";
      this.headers = new Map(Object.entries(init?.headers || {}));
      this.body = init?.body;
    }
  },
  writable: true,
});

Object.defineProperty(global, "Response", {
  value: class Response {
    body: any;
    status: number;
    statusText: string;
    headers: Map<string, string>;
    ok: boolean;

    constructor(body: any, init?: any) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || "OK";
      this.headers = new Map(Object.entries(init?.headers || {}));
      this.ok = this.status >= 200 && this.status < 300;
    }

    async json() {
      return JSON.parse(this.body);
    }

    async text() {
      return this.body;
    }
  },
  writable: true,
});

Object.defineProperty(global, "Headers", {
  value: Map,
  writable: true,
});

Object.defineProperty(global, "URL", {
  value: require("url").URL,
  writable: true,
});

Object.defineProperty(global, "URLSearchParams", {
  value: require("url").URLSearchParams,
  writable: true,
});
