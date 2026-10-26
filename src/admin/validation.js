import { isHexColor, isSafeUrl } from "../../shared/schema.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Mirrors server/models/index.js.
const ENTRY_MAX = { tags: 120, list: 400 };
const MAX_ENTRIES = 80;

/** Client-side checks mirroring the API's validation, for instant feedback. */
export function validateFields(fields, values) {
  const errors = {};
  for (const field of fields) {
    const value = values[field.name];
    const label = field.label || field.name;
    const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length);
    if (field.required && empty) errors[field.name] = `${label} is required`;
    else if ((field.type === "url" || field.type === "image") && !isSafeUrl(value)) {
      errors[field.name] = "Use a full link starting with https:// (or a site path starting with /)";
    } else if (field.type === "email" && value && !EMAIL_PATTERN.test(value)) errors[field.name] = "Enter a valid email";
    else if (field.type === "color" && value && !isHexColor(value)) errors[field.name] = "Use a hex colour like #232426";
    else if (ENTRY_MAX[field.type] && Array.isArray(value)) {
      if (value.length > MAX_ENTRIES) errors[field.name] = `Keep it to ${MAX_ENTRIES} entries or fewer`;
      else if (value.some((entry) => String(entry).length > ENTRY_MAX[field.type])) {
        errors[field.name] = `Keep each entry under ${ENTRY_MAX[field.type]} characters`;
      }
    } else if (field.max && typeof value === "string" && field.type !== "number" && value.length > field.max) {
      errors[field.name] = `Keep it under ${field.max} characters`;
    } else if (field.type === "number" && value !== "" && value !== undefined) {
      const number = Number(value);
      if (Number.isNaN(number)) errors[field.name] = "Enter a number";
      else if (field.min !== undefined && number < field.min) errors[field.name] = `Minimum is ${field.min}`;
      else if (field.max !== undefined && number > field.max) errors[field.name] = `Maximum is ${field.max}`;
    }
  }
  return errors;
}
