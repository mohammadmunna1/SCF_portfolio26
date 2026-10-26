import { COLLECTIONS } from "../../shared/schema.js";

/** Short names for the essential homepage sections (see ESSENTIAL_SECTIONS in shared/content-backup.js). */
export const SECTION_NAMES = {
  stats: "At a glance",
  about: "About",
  experience: "Experience",
  work: "Projects",
  sqa: "QA projects",
  education: "Education",
  courses: "Courses & certifications",
  skills: "Skills",
  contact: "Contact",
};

/** A readable name for a part the site is taking from the backup ("profile", "section:about", "projects"…). */
export function backupPartLabel(part) {
  if (part === "profile") return "Profile";
  if (part === "theme") return "Palette";
  if (part.startsWith("section:")) return `${SECTION_NAMES[part.slice(8)] || part.slice(8)} section`;
  return COLLECTIONS[part]?.label || part;
}
