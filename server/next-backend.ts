import { resolve } from "node:path";
import { createApp, type AppInstance } from "./app";

const globalForBackend = globalThis as unknown as {
  backendApp: AppInstance | undefined;
};

export const getAppInstance = (): AppInstance => {
  if (!globalForBackend.backendApp) {
    const dbEnv = process.env.LMS_DATABASE;
    const databasePath = dbEnv
      ? resolve(/*turbopackIgnore: true*/ dbEnv)
      : resolve(process.cwd(), ".local/lms.sqlite");
    const origin = process.env.APP_ORIGIN || "http://localhost:3000";
    const uploadEnv = process.env.LMS_UPLOADS;
    globalForBackend.backendApp = createApp({
      databasePath,
      origin,
      allowSetup: process.env.LMS_ALLOW_SETUP === "1",
      uploadsPath: uploadEnv
        ? resolve(/*turbopackIgnore: true*/ uploadEnv)
        : undefined,
      enableWorkers: true,
      staticHandler: null,
    });
  }
  return globalForBackend.backendApp;
};
