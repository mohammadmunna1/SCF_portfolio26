import mongoose from "mongoose";
import { config } from "./config.js";
import { HttpError, withTimeout } from "./lib/http.js";

mongoose.set("strictQuery", true);

// After a failed attempt, requests fail straight away for a few seconds instead of each one waiting for
// a new connection timeout — so during an outage the site switches to its backup copy quickly.
const RETRY_AFTER_MS = 10_000;
// How long a request waits for a dropped connection to come back. On serverless the connection drops
// whenever an idle instance wakes up, and reconnecting takes well under a second.
const RECONNECT_TIMEOUT_MS = 3000;

// Cached on globalThis so serverless invocations reuse one connection.
const cache =
  globalThis.__portfolioMongo ??
  (globalThis.__portfolioMongo = { conn: null, promise: null, failedAt: 0, reconnecting: null });

// Visitors only ever see this; the reason (which can name the database host) is logged on the server.
const unavailable = () => new HttpError(503, "The database is unavailable right now. Please try again shortly.");

/** Pings through the driver, which makes it reconnect at once instead of at its next scheduled check. */
function reconnect() {
  cache.reconnecting ??= withTimeout(mongoose.connection.getClient().db().command({ ping: 1 }), RECONNECT_TIMEOUT_MS)
    .then(() => {
      cache.failedAt = 0;
    })
    .catch((error) => {
      cache.failedAt = Date.now();
      console.error(`[db] Lost the database connection: ${error.message}`);
      throw unavailable();
    })
    .finally(() => {
      cache.reconnecting = null;
    });
  return cache.reconnecting;
}

export async function connectDatabase() {
  if (cache.conn) {
    if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) return cache.conn;
    // Connected before, but the connection has dropped — usually just an idle serverless instance waking
    // up. Reconnect now; only when that fails is the database really unreachable, and then requests fail
    // straight away for a while.
    if (Date.now() - (cache.failedAt || 0) < RETRY_AFTER_MS) throw unavailable();
    await reconnect();
    return cache.conn;
  }
  if (!config.mongoUri) {
    throw new HttpError(503, "The database is not configured (MONGODB_URI is missing).");
  }
  if (Date.now() - (cache.failedAt || 0) < RETRY_AFTER_MS) throw unavailable();
  cache.promise ??= mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  });
  try {
    cache.conn = await cache.promise;
    cache.failedAt = 0;
  } catch (error) {
    cache.promise = null;
    cache.failedAt = Date.now();
    console.error(`[db] Could not connect to the database: ${error.message}`);
    throw unavailable();
  }
  return cache.conn;
}

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
  cache.failedAt = 0;
  cache.reconnecting = null;
};
