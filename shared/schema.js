// Single source of truth for every editable content type.
// The API builds its Mongoose models and validation from these definitions,
// and the admin panel renders its forms from them — so adding a field here
// makes it editable end-to-end.

import { DEFAULT_THEME, HEX_PATTERN, THEME_TOKENS } from "./theme.js";

/**
 * Field types:
 *  text | textarea | url | email | number | boolean | select | icon | tags | list | image | color
 *  (tags = short chips; list = longer items such as bullet points, one per line in the admin)
 */

export const SAFE_URL_PATTERN = /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i;

export const isSafeUrl = (value) => !value || SAFE_URL_PATTERN.test(String(value).trim());

export const isHexColor = (value) => HEX_PATTERN.test(String(value ?? "").trim());

/** Icon keys selectable in the admin panel (resolved to components on the client). */
export const ICON_OPTIONS = [
  "award",
  "bank",
  "book",
  "bot",
  "briefcase",
  "bug",
  "building",
  "cart",
  "check",
  "clipboard",
  "code",
  "cpu",
  "database",
  "flask",
  "globe",
  "graduation-cap",
  "handshake",
  "layers",
  "lightbulb",
  "lock",
  "medal",
  "mic",
  "monitor",
  "palette",
  "puzzle",
  "rocket",
  "server",
  "shield",
  "smartphone",
  "sparkles",
  "star",
  "target",
  "terminal",
  "trophy",
  "users",
  "workflow",
  "wrench",
  "zap",
];

export const SOCIAL_PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "x", label: "X (Twitter)" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "youtube", label: "YouTube" },
  { value: "dribbble", label: "Dribbble" },
  { value: "behance", label: "Behance" },
  { value: "medium", label: "Medium" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
];

/** Homepage sections, in their default order. Admins can rename, reorder and hide them. */
export const SECTION_KEYS = [
  "about",
  "stats",
  "sqa",
  "experience",
  "work",
  "skills",
  "education",
  "testimonials",
  "faq",
  "contact",
];

export const COLLECTIONS = {
  sections: {
    label: "Sections",
    singular: "Section",
    icon: "layout",
    fixed: true,
    description: "Rename, reorder or hide the homepage sections. Drag to change their order.",
    titleField: "title",
    subtitleField: "key",
    fields: [
      { name: "key", label: "Section", type: "text", readOnly: true, max: 40 },
      {
        name: "navLabel",
        label: "Menu label",
        type: "text",
        max: 40,
        help: "Shown in the site menu. Leave empty to keep this section out of the menu.",
      },
      { name: "eyebrow", label: "Small label", type: "text", max: 60 },
      { name: "title", label: "Title", type: "text", max: 160 },
      { name: "subtitle", label: "Subtitle", type: "textarea", rows: 3, max: 600 },
      { name: "ctaLabel", label: "Button label", type: "text", max: 60 },
    ],
  },

  sqaProjects: {
    label: "SQA Projects",
    singular: "SQA project",
    icon: "bug",
    description: "Test automation and manual testing projects — the first projects section on the site.",
    titleField: "title",
    subtitleField: "type",
    imageField: "image",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 160 },
      {
        name: "type",
        label: "Type",
        type: "select",
        default: "Automation",
        options: [
          { value: "Automation", label: "Automation" },
          { value: "Manual", label: "Manual" },
        ],
      },
      { name: "summary", label: "Summary", type: "textarea", rows: 4, max: 1200 },
      {
        name: "highlights",
        label: "Highlights",
        type: "list",
        help: "One point per line — shown as a short list on the card.",
      },
      { name: "tools", label: "Tools & technologies", type: "tags" },
      { name: "framework", label: "Framework", type: "text", max: 200 },
      { name: "methodology", label: "Methodology", type: "text", max: 120 },
      { name: "testingType", label: "Testing type", type: "text", max: 200 },
      { name: "reportingTool", label: "Reporting", type: "text", max: 160 },
      { name: "browsers", label: "Browsers", type: "tags" },
      { name: "repoUrl", label: "Repository URL", type: "url" },
      { name: "liveUrl", label: "Live demo URL", type: "url", help: "Leave empty when there is no public demo." },
      {
        name: "image",
        label: "Preview image",
        type: "image",
        help: "Optional screenshot. Without one, the code snippet (or the main tool name) is shown.",
      },
      {
        name: "snippet",
        label: "Code snippet",
        type: "textarea",
        rows: 8,
        max: 2000,
        help: "A short excerpt from the repository, shown in a code-editor preview.",
      },
      { name: "snippetFile", label: "Snippet file name", type: "text", max: 160 },
      {
        name: "snippetLanguage",
        label: "Snippet language",
        type: "select",
        default: "",
        options: [
          { value: "gherkin", label: "Gherkin" },
          { value: "javascript", label: "JavaScript" },
          { value: "typescript", label: "TypeScript" },
          { value: "java", label: "Java" },
          { value: "python", label: "Python" },
          { value: "text", label: "Plain text" },
        ],
      },
      { name: "icon", label: "Icon", type: "icon", default: "bug" },
    ],
  },

  projects: {
    label: "Dev Projects",
    singular: "Project",
    icon: "folder",
    description: "Front-end and full-stack projects — shown in the Software Development section.",
    titleField: "title",
    subtitleField: "tagline",
    imageField: "image",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 120 },
      { name: "tagline", label: "Tagline", type: "text", max: 160 },
      {
        name: "context",
        label: "Context",
        type: "text",
        max: 80,
        placeholder: "Edistys · Client project",
        help: "Optional label shown above the title.",
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        default: "fullstack",
        options: [
          { value: "fullstack", label: "Full Stack" },
          { value: "frontend", label: "Frontend" },
          { value: "backend", label: "Backend" },
          { value: "other", label: "Other" },
        ],
      },
      { name: "image", label: "Screenshot", type: "image", help: "A 2:1 screenshot (e.g. 1600×800) fits best." },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        rows: 6,
        max: 4000,
        help: "Separate paragraphs with a blank line.",
      },
      { name: "technologies", label: "Technologies", type: "tags" },
      { name: "liveUrl", label: "Live URL", type: "url" },
      { name: "repoUrl", label: "Repository (client)", type: "url" },
      { name: "serverRepoUrl", label: "Repository (server)", type: "url" },
      { name: "featured", label: "Show on the homepage", type: "boolean", default: true },
    ],
  },

  experience: {
    label: "Experience",
    singular: "Experience",
    icon: "briefcase",
    description: "Work history, newest first.",
    titleField: "role",
    subtitleField: "company",
    fields: [
      { name: "role", label: "Role", type: "text", required: true, max: 160 },
      { name: "company", label: "Company", type: "text", required: true, max: 160 },
      { name: "companyUrl", label: "Company website", type: "url" },
      { name: "period", label: "Period", type: "text", max: 80, placeholder: "April 2026 – Present" },
      { name: "location", label: "Location", type: "text", max: 80 },
      { name: "employmentType", label: "Employment type", type: "text", max: 80 },
      {
        name: "track",
        label: "Track",
        type: "select",
        default: "qa",
        options: [
          { value: "qa", label: "Quality Assurance" },
          { value: "development", label: "Software Development" },
          { value: "other", label: "Other" },
        ],
      },
      { name: "current", label: "Current role", type: "boolean", default: false },
      { name: "description", label: "Summary", type: "textarea", rows: 3, max: 1200 },
      {
        name: "highlights",
        label: "Highlights",
        type: "list",
        help: "One achievement-oriented point per line.",
      },
      { name: "icon", label: "Icon", type: "icon", default: "briefcase" },
    ],
  },

  education: {
    label: "Education",
    singular: "Education",
    icon: "graduation-cap",
    description: "Degrees and schooling.",
    titleField: "degree",
    subtitleField: "institution",
    fields: [
      { name: "degree", label: "Degree", type: "text", required: true, max: 200 },
      { name: "institution", label: "Institution", type: "text", required: true, max: 200 },
      { name: "period", label: "Period", type: "text", max: 80 },
      { name: "grade", label: "Result", type: "text", max: 80, placeholder: "CGPA: 3.70 / 4.00" },
      { name: "thesis", label: "Thesis / project", type: "text", max: 200 },
      { name: "details", label: "Details", type: "textarea", rows: 3, max: 2000 },
    ],
  },

  certifications: {
    label: "Certifications",
    singular: "Certification",
    icon: "award",
    description: "Training and certificates.",
    titleField: "title",
    subtitleField: "issuer",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 160 },
      { name: "issuer", label: "Issuer / organization", type: "text", max: 160 },
      { name: "issued", label: "Issued", type: "text", max: 40, placeholder: "2025" },
      { name: "url", label: "Certificate URL", type: "url" },
      { name: "icon", label: "Icon", type: "icon", default: "award" },
    ],
  },

  achievements: {
    label: "Achievements",
    singular: "Achievement",
    icon: "trophy",
    description: "Achievements, competitions and activities.",
    titleField: "organization",
    subtitleField: "role",
    fields: [
      { name: "role", label: "Role", type: "text", required: true, max: 120, placeholder: "Participant" },
      { name: "organization", label: "Event / organization", type: "text", required: true, max: 200 },
      { name: "period", label: "Period", type: "text", max: 80 },
      { name: "description", label: "Description", type: "textarea", rows: 3, max: 800 },
    ],
  },

  skills: {
    label: "Skills",
    singular: "Skill group",
    icon: "layers",
    description: "Skill groups, shown in this order. QA groups are presented first.",
    titleField: "title",
    subtitleField: "kind",
    fields: [
      { name: "title", label: "Group title", type: "text", required: true, max: 80 },
      {
        name: "kind",
        label: "Category",
        type: "select",
        default: "qa",
        options: [
          { value: "qa", label: "Quality Assurance" },
          { value: "development", label: "Development" },
          { value: "other", label: "Technical / other" },
        ],
      },
      { name: "icon", label: "Icon", type: "icon", default: "code" },
      { name: "items", label: "Skills", type: "tags" },
    ],
  },

  stats: {
    label: "Stats",
    singular: "Stat",
    icon: "gauge",
    description: "Numbers shown in the stats row.",
    titleField: "value",
    subtitleField: "label",
    fields: [
      { name: "value", label: "Value", type: "text", required: true, max: 20, placeholder: "5+" },
      { name: "label", label: "Label", type: "text", required: true, max: 80 },
    ],
  },

  socials: {
    label: "Social Links",
    singular: "Social link",
    icon: "link",
    description: "Profiles linked from the menu, contact section and footer.",
    titleField: "label",
    subtitleField: "url",
    fields: [
      {
        name: "platform",
        label: "Platform",
        type: "select",
        required: true,
        default: "website",
        options: SOCIAL_PLATFORMS,
      },
      { name: "label", label: "Label", type: "text", required: true, max: 60 },
      { name: "url", label: "URL", type: "url", required: true },
      { name: "showInHero", label: "Show in the hero", type: "boolean", default: false },
    ],
  },

  faqs: {
    label: "FAQs",
    singular: "FAQ",
    icon: "message",
    description: "Questions and answers for the FAQ section.",
    titleField: "question",
    fields: [
      { name: "question", label: "Question", type: "text", required: true, max: 200 },
      { name: "answer", label: "Answer", type: "textarea", required: true, rows: 5, max: 2000 },
    ],
  },

  testimonials: {
    label: "Testimonials",
    singular: "Testimonial",
    icon: "quote",
    description: "Recommendations from people you have worked with. The section stays hidden until you add one.",
    titleField: "name",
    subtitleField: "role",
    imageField: "avatar",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 100 },
      { name: "role", label: "Role / company", type: "text", max: 120 },
      { name: "quote", label: "Quote", type: "textarea", required: true, rows: 5, max: 1500 },
      { name: "avatar", label: "Photo", type: "image" },
      { name: "rating", label: "Rating (1–5)", type: "number", min: 1, max: 5, default: 5 },
    ],
  },
};

export const SINGLETONS = {
  profile: {
    label: "Profile",
    icon: "user",
    description: "Your identity, hero, about text, contact details and SEO.",
    groups: [
      {
        title: "Identity",
        fields: [
          { name: "name", label: "Full name", type: "text", required: true, max: 100 },
          { name: "brand", label: "Logo text", type: "text", max: 40, help: "Shown top-left, e.g. “Munna”." },
          {
            name: "brandHover",
            label: "Logo text on hover",
            type: "text",
            max: 40,
            help: "Rolls into place when the logo is hovered, e.g. “QA x DEV”. Leave empty to repeat the logo text.",
          },
          { name: "role", label: "Current role", type: "text", max: 80 },
          {
            name: "portrait",
            label: "Portrait",
            type: "image",
            help: "Shown once, in the hero card. A cut-out photo (transparent background) looks best.",
          },
          { name: "availableForWork", label: "Show “Available for work”", type: "boolean", default: true },
        ],
      },
      {
        title: "Hero",
        fields: [
          {
            name: "headline",
            label: "Headline",
            type: "text",
            max: 60,
            help: "The oversized headline; the portrait sits after the first word. Keep it short — e.g. “SQA Engineer”.",
          },
          { name: "heroIntro", label: "Introduction", type: "textarea", rows: 3, max: 400, help: "Shown in capitals under the headline." },
        ],
      },
      {
        title: "About",
        fields: [
          {
            name: "about",
            label: "About text",
            type: "textarea",
            rows: 10,
            max: 6000,
            help: "Separate paragraphs with a blank line.",
          },
          { name: "focusAreas", label: "Current focus", type: "tags", help: "Your QA focus areas." },
          {
            name: "devBackground",
            label: "Development background",
            type: "tags",
            help: "Earlier development experience, shown as your foundation.",
          },
        ],
      },
      {
        title: "Contact",
        fields: [
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone", type: "text", max: 40 },
          { name: "location", label: "Location", type: "text", max: 120 },
          { name: "resumeUrl", label: "Resume URL", type: "url" },
        ],
      },
      {
        title: "Footer",
        fields: [
          {
            name: "ctaTitle",
            label: "Closing line",
            type: "text",
            max: 120,
            help: "Shown in huge letters above the footer — keep it short, e.g. “Let's work together!”",
          },
          {
            name: "ctaButtonLabel",
            label: "Contact button label",
            type: "text",
            max: 60,
            help: "Used for the “Get in touch” buttons in the hero and footer.",
          },
        ],
      },
      {
        title: "SEO",
        fields: [
          { name: "siteTitle", label: "Browser title", type: "text", max: 120, help: "The name shown in browser tabs, e.g. “QA x DEV M”." },
          { name: "siteDescription", label: "Meta description", type: "textarea", rows: 3, max: 320 },
        ],
      },
    ],
  },

  theme: {
    label: "Theme",
    icon: "palette",
    description: "The site's colour palette.",
    groups: [
      {
        title: "Colours",
        fields: THEME_TOKENS.map((token) => ({
          name: token.key,
          label: token.label,
          type: "color",
          required: true,
          default: DEFAULT_THEME[token.key],
        })),
      },
    ],
  },
};

export const singletonFields = (key) => SINGLETONS[key].groups.flatMap((group) => group.fields);

/** Defaults for a brand-new item (used by the admin "Add" form). */
export const defaultItem = (collection) => {
  const item = { visible: true };
  for (const field of COLLECTIONS[collection].fields) {
    if (field.default !== undefined) item[field.name] = field.default;
    else if (field.type === "tags" || field.type === "list") item[field.name] = [];
    else if (field.type === "boolean") item[field.name] = false;
    else if (field.type !== "number") item[field.name] = "";
  }
  return item;
};
