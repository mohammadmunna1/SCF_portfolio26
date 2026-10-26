// The logo shows “Munna” and rolls to “QA x DEV” on hover. Applied only while the logo text is still a
// default (empty, the previous “QA x DEV M”, or already “Munna”) — a custom logo set in the admin is kept.

import { DEFAULT_PROFILE } from "../../shared/default-content.js";
import { SITE_NAME } from "../../shared/site.js";
import { SingletonModels } from "../models/index.js";
import { isEmpty, same } from "./helpers.js";

export default {
  id: "2026-10-logo-hover",
  description: "Logo text “Munna”, rolling to “QA x DEV” on hover",

  async up({ log }) {
    const doc = await SingletonModels.profile.findOne().lean();
    if (!doc) return;
    const brandIsDefault = isEmpty(doc.brand) || same(doc.brand, SITE_NAME) || same(doc.brand, DEFAULT_PROFILE.brand);
    if (!brandIsDefault) return;
    const changes = {};
    if (!same(doc.brand, DEFAULT_PROFILE.brand)) changes.brand = DEFAULT_PROFILE.brand;
    if (isEmpty(doc.brandHover)) changes.brandHover = DEFAULT_PROFILE.brandHover;
    if (Object.keys(changes).length) {
      await SingletonModels.profile.updateOne({ _id: doc._id }, { $set: changes });
      log(`profile: ${Object.entries(changes).map(([field, value]) => `${field} → “${value}”`).join(", ")}`);
    }
  },
};
