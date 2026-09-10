import { resolve } from "node:path";
import { createApp, type AppInstance } from "./app";

const globalForBackend = globalThis as unknown as {
  backendApp: AppInstance | undefined;
};

export const getAppInstance = (): AppInstance => {
  if (!globalForBackend.backendApp) {
    const databasePath = resolve(process.env.LMS_DATABASE || ".local/lms.sqlite");
    const origin = process.env.APP_ORIGIN || "http://localhost:3000";
    globalForBackend.backendApp = createApp({
      databasePath,
      origin,
      allowSetup: process.env.LMS_ALLOW_SETUP === "1",
      uploadsPath: process.env.LMS_UPLOADS
        ? resolve(process.env.LMS_UPLOADS)
        : undefined,
      enableWorkers: true,
      staticDir: null,
    });
  }
  return globalForBackend.backendApp;
};
