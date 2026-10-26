// Seeds the default portfolio content.
//   npm run seed              → only seeds an empty, never-seeded database
//   npm run seed -- --force   → deletes ALL portfolio content and restores the defaults
import { parseArgs } from "node:util";
import { DEFAULT_COLLECTIONS } from "../../shared/default-content.js";
import { seedIfNeeded } from "../bootstrap.js";
import { connectDatabase, disconnectDatabase } from "../db.js";
import { CollectionModels, Meta, SingletonModels } from "../models/index.js";

const { values } = parseArgs({ options: { force: { type: "boolean", default: false } } });

try {
  await connectDatabase();
  if (values.force) {
    for (const name of Object.keys(DEFAULT_COLLECTIONS)) await CollectionModels[name].deleteMany({});
    await SingletonModels.profile.deleteMany({});
    await SingletonModels.theme.deleteMany({});
    await Meta.deleteOne({ key: "seed" });
    console.log("Existing portfolio content removed.");
  }
  const seeded = await seedIfNeeded();
  if (!seeded) console.log("The database was already seeded — nothing changed. Use --force to restore the defaults.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
