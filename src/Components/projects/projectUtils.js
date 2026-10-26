import { useCallback, useState } from "react";

export const CATEGORY_LABELS = {
  fullstack: "Full Stack",
  frontend: "Frontend",
  backend: "Backend",
  other: "Other",
};

const pad = (number) => String(number).padStart(2, "0");

/** "01 / 06" — project counter. */
export const counter = (index, total) => `${pad(index + 1)} / ${pad(total)}`;

const SQA_TYPES = ["Automation", "Manual"];

/** Filter tabs (with counts) for the SQA project types that exist. */
export const sqaFilters = (projects) => [
  { key: "all", label: "All", count: projects.length },
  ...SQA_TYPES.filter((type) => projects.some((project) => project.type === type)).map((type) => ({
    key: type,
    label: type,
    count: projects.filter((project) => project.type === type).length,
  })),
];

export const filterSqa = (projects, filter) =>
  filter === "all" ? projects : projects.filter((project) => project.type === filter);

/** Filter tabs (with counts) for the development project categories that exist. */
export const categoryFilters = (projects) => [
  { key: "all", label: "All", count: projects.length },
  ...Object.keys(CATEGORY_LABELS)
    .filter((key) => projects.some((project) => project.category === key))
    .map((key) => ({
      key,
      label: CATEGORY_LABELS[key],
      count: projects.filter((project) => project.category === key).length,
    })),
];

export const filterByCategory = (projects, filter) =>
  filter === "all" ? projects : projects.filter((project) => project.category === filter);

/** Keeps the selected project mounted while the modal animates out. */
export function useProjectModal() {
  const [project, setProject] = useState(null);
  const [open, setOpen] = useState(false);
  const openProject = useCallback((next) => {
    setProject(next);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  return { project, open, openProject, close };
}
