import { COLLECTIONS } from "../../shared/schema.js";

const SUPPLY_CHAIN = "supply-chain";
const { fields: PROJECT_FIELDS } = COLLECTIONS.projects;

/**
 * The admin's three project pages — Supply Chain, QA and Development — each listing, adding, ordering and
 * editing only its own projects. Supply chain and development projects share the projects collection (told
 * apart by their category); QA projects have their own. On the site they're the projects page's three tabs,
 * and supply chain projects are also the homepage's case studies.
 */
export const PROJECT_GROUPS = [
  {
    key: "supply-chain",
    label: "Supply Chain",
    collection: "projects",
    includes: (project) => project.category === SUPPLY_CHAIN,
    newItem: { category: SUPPLY_CHAIN },
    definition: {
      ...COLLECTIONS.projects,
      label: "Supply chain projects",
      singular: "Supply chain project",
      description:
        "Procurement, inventory and other supply chain systems — the case studies in the homepage's Projects section, and the first tab of the projects page.",
      // Their category is the page they're on
      fields: PROJECT_FIELDS.filter((field) => field.name !== "category"),
    },
  },
  {
    key: "qa",
    label: "QA",
    collection: "sqaProjects",
    definition: {
      ...COLLECTIONS.sqaProjects,
      label: "QA projects",
      description: "Test automation and manual testing projects — the QA tab of the projects page.",
    },
  },
  {
    key: "development",
    label: "Development",
    collection: "projects",
    includes: (project) => project.category !== SUPPLY_CHAIN,
    newItem: { category: "fullstack" },
    definition: {
      ...COLLECTIONS.projects,
      label: "Development projects",
      singular: "Development project",
      description:
        "Software, web and automation projects — the Development tab of the projects page, which the homepage's “View more projects” leads to.",
      fields: PROJECT_FIELDS
        // The homepage shows only supply chain projects, so "Show on the homepage" doesn't apply here
        .filter((field) => field.name !== "featured")
        .map((field) =>
          field.name === "category"
            ? {
                ...field,
                label: "Type",
                required: true,
                default: "fullstack",
                options: field.options.filter((option) => option.value !== SUPPLY_CHAIN),
                help: "Shown as a badge on the project's card.",
              }
            : field,
        ),
    },
  },
];

export const projectGroup = (key) => PROJECT_GROUPS.find((group) => group.key === key);

/** The page that manages a collection's items, for the collections that are split into project groups. */
export const PROJECT_PAGE_OF = { projects: "/admin/projects/supply-chain", sqaProjects: "/admin/projects/qa" };
