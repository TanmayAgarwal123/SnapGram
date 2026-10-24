import { Client, Account, Databases, Storage, Avatars } from "appwrite";

// Appwrite endpoint. Defaults to Appwrite Cloud so the app can boot even if
// VITE_APPWRITE_URL is not set. Override it in your `.env` if you self-host.
const DEFAULT_APPWRITE_URL = "https://cloud.appwrite.io/v1";

export const appwriteConfig = {
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID as string,
  url: (import.meta.env.VITE_APPWRITE_URL as string) || DEFAULT_APPWRITE_URL,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID as string,
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID as string,
  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID as string,
  postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID as string,
  savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID as string,
  // New collections introduced by the upgrade (Phase 4). Optional until created.
  commentsCollectionId: import.meta.env
    .VITE_APPWRITE_COMMENTS_COLLECTION_ID as string,
  followsCollectionId: import.meta.env
    .VITE_APPWRITE_FOLLOWS_COLLECTION_ID as string,
  notificationsCollectionId: import.meta.env
    .VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID as string,
} as const;

/** True when the minimum required Appwrite settings are present. */
export const isAppwriteConfigured = Boolean(
  appwriteConfig.projectId && appwriteConfig.databaseId
);

export const client = new Client();

// Guard configuration so a missing/incomplete `.env` does not crash the whole
// app at import time (which would otherwise leave a blank screen). If the
// project id is missing we warn loudly instead — the UI still renders and API
// calls fail with a clear error until `.env` is filled in.
client.setEndpoint(appwriteConfig.url);

if (appwriteConfig.projectId) {
  client.setProject(appwriteConfig.projectId);
} else if (import.meta.env.DEV) {
  console.error(
    "[Appwrite] VITE_APPWRITE_PROJECT_ID is not set. Copy `.env.example` to " +
      "`.env`, fill in your Appwrite project values, and restart the dev server."
  );
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
