// Updates a database seeded with the original (v1) content to the SQA Engineer profile (v2):
// new experience, education, certifications, achievements, CV skills, SQA and development
// projects, refreshed FAQs and section copy.
//
// Safety rules — content edited in the admin panel is never overwritten:
//  • a field is replaced only if it still holds its original v1 value
//  • a new field is filled only if it is empty
//  • items no longer in the CV are deleted only if untouched, and hidden (not deleted) when unsure

import * as V2 from "../../shared/default-content.js";
import { CollectionModels, SingletonModels } from "../models/index.js";
import { applyOrder, followsOrder, isEmpty, same } from "./helpers.js";
import * as V1 from "./snapshots/content-v1.js";

/** True when every field of the original v1 item still holds its v1 value. */
const untouched = (doc, v1Item) => Boolean(v1Item) && Object.keys(v1Item).every((field) => same(doc[field], v1Item[field]));

/** Field-level changes from `next` that are safe to apply (see rules above). */
function safeChanges(doc, v1Item, next) {
  const changes = {};
  for (const [field, value] of Object.entries(next)) {
    if (same(doc[field], value)) continue;
    if (v1Item && Object.hasOwn(v1Item, field)) {
      if (same(doc[field], v1Item[field])) changes[field] = value;
    } else if (isEmpty(doc[field])) {
      changes[field] = value;
    }
  }
  return changes;
}

/** Creates or safely updates each v2 item, matched by `keyField` (v1 counterpart matched by `v1Key`). */
async function upsertItems(name, keyField, items, log, { v1Items = [], v1Key = (item) => item[keyField] } = {}) {
  const Model = CollectionModels[name];
  for (const item of items) {
    const v1Item = v1Items.find((candidate) => v1Key(candidate) === v1Key(item)) || null;
    const doc =
      (await Model.findOne({ [keyField]: item[keyField] }).lean()) ||
      (v1Item ? await Model.findOne({ [keyField]: v1Item[keyField] }).lean() : null);
    if (!doc) {
      await Model.create({ ...item, order: 999, visible: true });
      log(`${name}: added "${item[keyField]}"`);
      continue;
    }
    const changes = safeChanges(doc, v1Item, item);
    if (Object.keys(changes).length) {
      await Model.updateOne({ _id: doc._id }, { $set: changes });
      log(`${name}: updated "${item[keyField]}" (${Object.keys(changes).join(", ")})`);
    }
  }
}

/** Deletes untouched v1 items that are no longer in the CV, or hides them when `hide` is set. */
async function retireItems(name, keyField, v1Items, keys, log, { hide = false } = {}) {
  const Model = CollectionModels[name];
  for (const key of keys) {
    const v1Item = v1Items.find((item) => item[keyField] === key);
    const doc = await Model.findOne({ [keyField]: key }).lean();
    if (!doc || !untouched(doc, v1Item)) continue;
    if (hide) {
      if (doc.visible !== false) {
        await Model.updateOne({ _id: doc._id }, { $set: { visible: false } });
        log(`${name}: hid "${key}" (no longer in the CV — re-enable it in the admin if needed)`);
      }
    } else {
      await Model.deleteOne({ _id: doc._id });
      log(`${name}: removed "${key}"`);
    }
  }
}

async function migrateProfile(log) {
  const Profile = SingletonModels.profile;
  const doc = await Profile.findOne().lean();
  if (!doc) {
    await Profile.create(V2.DEFAULT_PROFILE);
    log("profile: created");
    return;
  }
  const changes = safeChanges(doc, V1.DEFAULT_PROFILE, V2.DEFAULT_PROFILE);
  if (Object.keys(changes).length) await Profile.updateOne({ _id: doc._id }, { $set: changes });
  // Fields that only served removed UI (rotating subtitle, logo strip, code card, old chips).
  const obsolete = ["seniority", "rotatingLines", "heroTech", "specialties", "tools", "qaSkills", "devSkills"].filter(
    (field) => Object.hasOwn(doc, field)
  );
  if (obsolete.length) {
    await Profile.collection.updateOne({ _id: doc._id }, { $unset: Object.fromEntries(obsolete.map((f) => [f, ""])) });
  }
  log(`profile: updated ${Object.keys(changes).join(", ") || "nothing"}; removed ${obsolete.join(", ") || "nothing"}`);
}

async function migrateSections(log) {
  const Sections = CollectionModels.sections;
  const docs = await Sections.find().sort({ order: 1, _id: 1 }).lean();
  // Sections added or removed since don't count as a reorder — only a changed relative order does.
  const reorderedByAdmin = !followsOrder(
    docs.map((doc) => doc.key),
    V1.DEFAULT_SECTIONS.map((s) => s.key)
  );

  for (const doc of docs) {
    const next = V2.DEFAULT_SECTIONS.find((section) => section.key === doc.key);
    if (!next) {
      await Sections.deleteOne({ _id: doc._id });
      log(`sections: removed "${doc.key}" (certifications are now part of Education)`);
      continue;
    }
    const { key, ...copy } = next;
    const changes = safeChanges(doc, V1.DEFAULT_SECTIONS.find((section) => section.key === key), copy);
    if (Object.keys(changes).length) {
      await Sections.updateOne({ _id: doc._id }, { $set: changes });
      log(`sections: updated "${key}" (${Object.keys(changes).join(", ")})`);
    }
  }
  for (const section of V2.DEFAULT_SECTIONS) {
    if (!docs.some((doc) => doc.key === section.key)) {
      await Sections.create({ ...section, order: 999 });
      log(`sections: added "${section.key}"`);
    }
  }
  // Section photos were removed (the portrait now appears once, in the hero).
  await Sections.collection.updateMany({ image: { $exists: true } }, { $unset: { image: "" } });
  if (!reorderedByAdmin) await applyOrder(Sections, "key", V2.DEFAULT_SECTIONS.map((s) => s.key));
}

export default {
  id: "2026-10-sqa-profile-refresh",
  description: "SQA Engineer profile: CV experience, education, skills, projects and section copy",

  async up({ log }) {
    await migrateProfile(log);
    await migrateSections(log);

    // Experience: SSCL added, Edistys & Solutya updated; older roles hidden rather than deleted.
    await upsertItems("experience", "company", V2.DEFAULT_EXPERIENCE, log, { v1Items: V1.DEFAULT_EXPERIENCE });
    await retireItems("experience", "company", V1.DEFAULT_EXPERIENCE, ["genZsoft.Cloud", "Shopnojoyee Academy Care"], log, {
      hide: true,
    });
    await applyOrder(CollectionModels.experience, "company", V2.DEFAULT_EXPERIENCE.map((e) => e.company));

    // Education: IUBAT updated from the CV; HSC hidden.
    await upsertItems("education", "institution", V2.DEFAULT_EDUCATION, log, { v1Items: V1.DEFAULT_EDUCATION });
    await retireItems("education", "institution", V1.DEFAULT_EDUCATION, ["Nawab Habibullah Model School & College"], log, {
      hide: true,
    });
    await applyOrder(CollectionModels.education, "institution", V2.DEFAULT_EDUCATION.map((e) => e.institution));

    // Certifications: EDGE renamed (matched by its original title), Ostad added, Launchpad hidden.
    const certificateKey = (item) => item.url || item.title;
    await upsertItems("certifications", "title", V2.DEFAULT_CERTIFICATIONS, log, {
      v1Items: V1.DEFAULT_CERTIFICATIONS,
      v1Key: certificateKey,
    });
    await retireItems("certifications", "title", V1.DEFAULT_CERTIFICATIONS, ["SQA Career Launchpad for Beginners"], log, {
      hide: true,
    });
    await applyOrder(CollectionModels.certifications, "title", V2.DEFAULT_CERTIFICATIONS.map((c) => c.title));

    // Achievements are new.
    if ((await CollectionModels.achievements.estimatedDocumentCount()) === 0) {
      await CollectionModels.achievements.insertMany(
        V2.DEFAULT_ACHIEVEMENTS.map((item, order) => ({ ...item, order, visible: true }))
      );
      log(`achievements: added ${V2.DEFAULT_ACHIEVEMENTS.length}`);
    }

    // Skills are replaced by the CV's categories (untouched original groups are removed).
    await retireItems("skills", "title", V1.DEFAULT_SKILLS, V1.DEFAULT_SKILLS.map((s) => s.title), log);
    await upsertItems("skills", "title", V2.DEFAULT_SKILLS, log);
    await applyOrder(CollectionModels.skills, "title", V2.DEFAULT_SKILLS.map((s) => s.title));

    // Projects: new SQA automation repos and Edistys projects first.
    await upsertItems("sqaProjects", "title", V2.DEFAULT_SQA_PROJECTS, log, { v1Items: V1.DEFAULT_SQA_PROJECTS });
    await applyOrder(CollectionModels.sqaProjects, "title", V2.DEFAULT_SQA_PROJECTS.map((p) => p.title));
    await upsertItems("projects", "title", V2.DEFAULT_PROJECTS, log, { v1Items: V1.DEFAULT_PROJECTS });
    await applyOrder(CollectionModels.projects, "title", V2.DEFAULT_PROJECTS.map((p) => p.title));

    // FAQs: untouched answers are refreshed for the SQA role.
    await retireItems("faqs", "question", V1.DEFAULT_FAQS, V1.DEFAULT_FAQS.map((f) => f.question), log);
    await upsertItems("faqs", "question", V2.DEFAULT_FAQS, log);
    await applyOrder(CollectionModels.faqs, "question", V2.DEFAULT_FAQS.map((f) => f.question));
  },
};
