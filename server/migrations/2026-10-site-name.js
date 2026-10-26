// Names the site “QA x DEV M” (logo text and browser title) in databases that still use an
// earlier default. A name chosen in the admin panel is left alone.

import { SITE_NAME } from "../../shared/site.js";
import { SingletonModels } from "../models/index.js";
import { isEmpty, same } from "./helpers.js";
import * as V1 from "./snapshots/content-v1.js";

const PREVIOUS_DEFAULTS = {
  brand: [V1.DEFAULT_PROFILE.brand, "MUNNA."],
  siteTitle: [V1.DEFAULT_PROFILE.siteTitle, "Mohammad Munna — SQA Engineer"],
};

export default {
  id: "2026-10-site-name",
  description: "Site name “QA x DEV M” for the logo and browser title",

  async up({ log }) {
    const doc = await SingletonModels.profile.findOne().lean();
    if (!doc) return;
    const changes = {};
    for (const [field, previous] of Object.entries(PREVIOUS_DEFAULTS)) {
      if (isEmpty(doc[field]) || previous.some((value) => same(doc[field], value))) changes[field] = SITE_NAME;
    }
    if (Object.keys(changes).length) {
      await SingletonModels.profile.updateOne({ _id: doc._id }, { $set: changes });
      log(`profile: ${Object.keys(changes).join(" and ")} set to “${SITE_NAME}”`);
    }
  },
};
