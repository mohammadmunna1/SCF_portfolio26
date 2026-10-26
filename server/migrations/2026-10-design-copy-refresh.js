// Follow-up to 2026-10-sqa-profile-refresh, for databases that already ran it:
//  • hero introduction that names you, and a short closing line for the giant footer type
//  • job summaries removed where they only repeated the first highlight
//  • homepage sections in the new order (unless they were reordered in the admin)
//
// Same safety rule as before: a value is replaced only while it still holds the text it replaces.

import { CollectionModels, SingletonModels } from "../models/index.js";
import { applyOrder, followsOrder, same } from "./helpers.js";
import * as V1 from "./snapshots/content-v1.js";
import * as V2 from "./snapshots/content-v2.js";

// Text written by the first v2 migration that this one updates.
const PREVIOUS_HERO_INTRO =
  "Software quality assurance engineer focused on manual testing, test automation, regression, API and end-to-end testing — with a foundation in front-end and full-stack development.";

const PREVIOUS_JOB_SUMMARIES = {
  "Spectrum Software & Consulting (Pvt.) Ltd. (SSCL)":
    "Quality assurance for OptiFin, a Supply Chain Finance solution used by leading banks in Bangladesh.",
  Edistys:
    "Built responsive web applications with Svelte, Tailwind CSS and Headless CMS technologies, with hands-on involvement in manual QA.",
  "Solutya Pvt. Ltd.": "Full-stack development with MongoDB, Express.js, React.js, Node.js, Next.js and TypeScript.",
};

async function migrateProfile(log) {
  const doc = await SingletonModels.profile.findOne().lean();
  if (!doc) return;
  const replacements = {
    heroIntro: [PREVIOUS_HERO_INTRO, ""],
    ctaTitle: [V1.DEFAULT_PROFILE.ctaTitle],
    ctaButtonLabel: [V1.DEFAULT_PROFILE.ctaButtonLabel],
  };
  const changes = {};
  for (const [field, previousValues] of Object.entries(replacements)) {
    if (previousValues.some((previous) => same(doc[field], previous)) && !same(doc[field], V2.DEFAULT_PROFILE[field])) {
      changes[field] = V2.DEFAULT_PROFILE[field];
    }
  }
  if (Object.keys(changes).length) {
    await SingletonModels.profile.updateOne({ _id: doc._id }, { $set: changes });
    log(`profile: updated ${Object.keys(changes).join(", ")}`);
  }
}

async function migrateExperience(log) {
  for (const [company, previous] of Object.entries(PREVIOUS_JOB_SUMMARIES)) {
    const next = V2.DEFAULT_EXPERIENCE.find((job) => job.company === company)?.description ?? "";
    const result = await CollectionModels.experience.updateOne(
      { company, description: previous },
      { $set: { description: next } }
    );
    if (result.modifiedCount) log(`experience: tidied the summary for "${company}"`);
  }
}

async function migrateSectionOrder(log) {
  const keys = (await CollectionModels.sections.find({}, { key: 1 }).sort({ order: 1, _id: 1 }).lean()).map(
    (doc) => doc.key
  );
  const v2Order = V2.DEFAULT_SECTIONS.map((section) => section.key);
  if (followsOrder(keys, v2Order)) return;
  if (!followsOrder(keys, V1.DEFAULT_SECTIONS.map((section) => section.key))) {
    log("sections: kept the custom order set in the admin");
    return;
  }
  await applyOrder(CollectionModels.sections, "key", v2Order);
  log("sections: applied the new homepage order");
}

export default {
  id: "2026-10-design-copy-refresh",
  description: "Hero and footer copy for the new design, tidier job summaries, new section order",

  async up({ log }) {
    await migrateProfile(log);
    await migrateExperience(log);
    await migrateSectionOrder(log);
  },
};
