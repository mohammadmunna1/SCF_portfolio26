import mongoose from "mongoose";
import { COLLECTIONS, SINGLETONS, isHexColor, isSafeUrl, singletonFields } from "../../shared/schema.js";

const { Schema } = mongoose;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTH = { textarea: 6000, url: 1000, image: 1000 };
const MAX_TAGS = 80;

/** Translates a shared field definition into a Mongoose schema path. */
function toSchemaPath(field) {
  const label = field.label || field.name;

  if (field.type === "number") {
    const path = { type: Number, default: field.default };
    if (field.min !== undefined) path.min = [field.min, `${label} must be at least ${field.min}`];
    if (field.max !== undefined) path.max = [field.max, `${label} must be at most ${field.max}`];
    return path;
  }
  if (field.type === "boolean") {
    return { type: Boolean, default: field.default ?? false };
  }
  if (field.type === "tags" || field.type === "list") {
    const itemMax = field.type === "list" ? 400 : 120;
    return {
      type: [{ type: String, trim: true, maxlength: [itemMax, `Each entry in ${label} must be under ${itemMax} characters`] }],
      default: () => [],
      validate: {
        validator: (value) => value.length <= MAX_TAGS,
        message: `${label} can have at most ${MAX_TAGS} entries`,
      },
    };
  }

  const path = {
    type: String,
    trim: true,
    default: field.default ?? "",
    maxlength: [field.max ?? MAX_LENGTH[field.type] ?? 300, `${label} is too long`],
  };
  if (field.required) path.required = [true, `${label} is required`];
  if (field.type === "url" || field.type === "image") {
    path.validate = { validator: isSafeUrl, message: `${label} must be an http(s) link or a site path` };
  }
  if (field.type === "email") {
    path.validate = { validator: (v) => !v || EMAIL_PATTERN.test(v), message: `${label} must be a valid email` };
  }
  if (field.type === "color") {
    path.validate = { validator: isHexColor, message: `${label} must be a hex colour like #232426` };
  }
  if (field.type === "select") {
    const values = field.options.map((option) => (typeof option === "string" ? option : option.value));
    path.enum = { values: field.required ? values : [...values, ""], message: `${label} has an invalid value` };
  }
  return path;
}

const buildSchema = (fields, extra = {}) =>
  new Schema(
    {
      ...Object.fromEntries(fields.map((field) => [field.name, toSchemaPath(field)])),
      ...extra,
    },
    { timestamps: true, strict: true }
  );

const model = (name, schema, collection) =>
  mongoose.models[name] || mongoose.model(name, schema, collection);

/** One model per editable collection, e.g. CollectionModels.projects */
export const CollectionModels = Object.fromEntries(
  Object.entries(COLLECTIONS).map(([name, definition]) => {
    const extra = {
      order: { type: Number, default: 0, index: true },
      visible: { type: Boolean, default: true },
    };
    if (definition.fixed) extra.key = { type: String, required: true, unique: true, trim: true };
    const fields = definition.fields.filter((field) => !(definition.fixed && field.name === "key"));
    return [name, model(`Content_${name}`, buildSchema(fields, extra), name)];
  })
);

/** Single-document settings, e.g. SingletonModels.profile */
export const SingletonModels = Object.fromEntries(
  Object.keys(SINGLETONS).map((key) => [key, model(`Singleton_${key}`, buildSchema(singletonFields(key)), key)])
);

export const Admin = model(
  "Admin",
  new Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
      tokenVersion: { type: Number, default: 0 },
      failedLogins: { type: Number, default: 0 },
      lockUntil: { type: Date, default: null },
      lastLoginAt: { type: Date, default: null },
    },
    { timestamps: true }
  ),
  "admins"
);

export const Asset = model(
  "Asset",
  new Schema(
    {
      data: { type: Buffer, required: true },
      contentType: { type: String, required: true },
      size: { type: Number, required: true },
      name: { type: String, default: "", maxlength: 200 },
    },
    { timestamps: true }
  ),
  "assets"
);

export const Message = model(
  "Message",
  new Schema(
    {
      name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 120 },
      email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        maxlength: 200,
        validate: { validator: (v) => EMAIL_PATTERN.test(v), message: "Please enter a valid email address" },
      },
      subject: { type: String, trim: true, maxlength: 200, default: "" },
      message: { type: String, required: [true, "Message is required"], trim: true, maxlength: 5000 },
      read: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
  ),
  "messages"
);

export const Meta = model(
  "Meta",
  new Schema({ key: { type: String, required: true, unique: true }, value: Schema.Types.Mixed }, { timestamps: true }),
  "meta"
);
