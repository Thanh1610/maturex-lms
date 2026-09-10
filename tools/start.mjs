process.env.NODE_ENV = "production";
process.env.SERVE_STATIC = "1";
await import("../server/index.js");
