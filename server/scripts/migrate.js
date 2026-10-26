// Applies pending content migrations (they also run automatically when the API starts).
//   npm run migrate
import { connectDatabase, disconnectDatabase } from "../db.js";
import { runPendingMigrations } from "../migrations/index.js";

try {
  await connectDatabase();
  await runPendingMigrations();
  console.log("Migrations up to date.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
