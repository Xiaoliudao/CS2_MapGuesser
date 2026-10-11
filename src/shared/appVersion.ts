const configuredBuildId = import.meta.env.VITE_APP_BUILD_ID;

export const APP_BUILD_ID = typeof configuredBuildId === "string" && configuredBuildId.trim()
  ? configuredBuildId.trim()
  : "development";
