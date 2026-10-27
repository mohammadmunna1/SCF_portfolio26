import { Reorder, useDragControls } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuChevronDown, LuChevronUp, LuEye, LuEyeOff, LuGripVertical, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import { Navigate, useParams } from "react-router-dom";
import { COLLECTIONS, defaultItem } from "../../../shared/schema.js";
import { resolveAsset } from "../../lib/api";
import { adminApi } from "../api";
import { useAuth } from "../auth";
import { FieldList } from "../fields";
import { PROJECT_PAGE_OF, projectGroup } from "../projectGroups";
import { validateFields } from "../validation";
import { useToast } from "../Toast";
import { Badge, Button, ConfirmDialog, Drawer, IconButton, PageHeader, Spinner, Switch } from "../ui";

const optionLabel = (definition, fieldName, value) => {
  const field = definition.fields.find((candidate) => candidate.name === fieldName);
  const option = field?.options?.find((candidate) => (typeof candidate === "string" ? candidate : candidate.value) === value);
  return typeof option === "object" ? option.label : value;
};

function ItemRow({ item, index, total, definition, onEdit, onToggle, onDelete, onMove, onDragEnd }) {
  const controls = useDragControls();
  const title = item[definition.titleField] || "Untitled";
  const subtitle = definition.subtitleField ? optionLabel(definition, definition.subtitleField, item[definition.subtitleField]) : "";
  const image = definition.imageField ? item[definition.imageField] : null;

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="flex items-center gap-2 rounded-2xl border border-heading/[0.07] bg-surface p-2 pr-3 sm:gap-3"
      whileDrag={{ scale: 1.02, zIndex: 10 }}
    >
      <button
        type="button"
        aria-label={`Drag to reorder ${title}`}
        onPointerDown={(event) => controls.start(event)}
        className="grid h-10 w-7 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-body/60 hover:text-heading active:cursor-grabbing"
      >
        <LuGripVertical className="h-5 w-5" aria-hidden="true" />
      </button>
      {definition.imageField && (
        <div className="hidden h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-raised sm:block">
          {image && <img src={resolveAsset(image)} alt="" className="h-full w-full object-cover" loading="lazy" />}
        </div>
      )}
      <button type="button" onClick={() => onEdit(item)} className="min-w-0 flex-1 py-1 text-left">
        <span className="flex items-center gap-2">
          <span className={`truncate text-[15px] font-medium ${item.visible === false ? "text-body/60" : "text-heading"}`}>{title}</span>
          {item.visible === false && <Badge>Hidden</Badge>}
          {item.featured === false && definition.fields.some((field) => field.name === "featured") && <Badge>Projects page only</Badge>}
          {item.current === true && <Badge tone="warning">Current</Badge>}
        </span>
        {subtitle && <span className="mt-0.5 block truncate text-[13px] text-body/80">{subtitle}</span>}
      </button>
      <div className="flex items-center">
        <span className="hidden sm:flex">
          <IconButton label="Move up" icon={LuChevronUp} disabled={index === 0} onClick={() => onMove(index, -1)} />
          <IconButton label="Move down" icon={LuChevronDown} disabled={index === total - 1} onClick={() => onMove(index, 1)} />
        </span>
        <IconButton
          label={item.visible === false ? `Show ${title}` : `Hide ${title}`}
          icon={item.visible === false ? LuEyeOff : LuEye}
          onClick={() => onToggle(item)}
        />
        <IconButton label={`Edit ${title}`} icon={LuPencil} onClick={() => onEdit(item)} />
        {!definition.fixed && (
          <IconButton label={`Delete ${title}`} icon={LuTrash2} onClick={() => onDelete(item)} className="hover:!text-danger" />
        )}
      </div>
    </Reorder.Item>
  );
}

/**
 * Lists, orders, adds, edits and deletes a collection's items — or, with `includes`, only the items it
 * picks out (one project group), new ones starting from `newItem`.
 */
function CollectionManager({ name, definition, includes, newItem }) {
  const toast = useToast();
  const { handleError } = useAuth();
  const [items, setItems] = useState([]);
  // Every item of the collection in its saved order: on a page showing part of it, the other items keep
  // their places when this page's items are reordered.
  const allRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { item, isNew }
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const savedOrder = useRef("");

  const fail = useCallback(
    (error) => {
      handleError(error);
      toast.error(error.message);
    },
    [handleError, toast]
  );

  useEffect(() => {
    adminApi
      .list(name)
      .then((list) => {
        allRef.current = list;
        const shown = includes ? list.filter(includes) : list;
        setItems(shown);
        savedOrder.current = shown.map((item) => item.id).join();
      })
      .catch(fail)
      .finally(() => setLoading(false));
  }, [name, includes, fail]);

  const persistOrder = async (list = itemsRef.current) => {
    const ids = list.map((item) => item.id);
    if (ids.join() === savedOrder.current) return;
    // This page's items take the new order in the places they held among all the collection's items.
    const queue = [...list];
    const full = includes ? allRef.current.map((item) => (includes(item) ? queue.shift() ?? item : item)) : list;
    try {
      await adminApi.reorder(
        name,
        full.map((item) => item.id),
      );
      allRef.current = full;
      savedOrder.current = ids.join();
      toast.success("Order saved");
    } catch (error) {
      fail(error);
    }
  };

  const move = (index, direction) => {
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(index + direction, 0, moved);
    setItems(next);
    persistOrder(next);
  };

  const toggleVisible = async (item) => {
    const visible = item.visible === false;
    setItems((list) => list.map((entry) => (entry.id === item.id ? { ...entry, visible } : entry)));
    try {
      await adminApi.update(name, item.id, { visible });
      toast.success(visible ? "Now visible on the site" : "Hidden from the site");
    } catch (error) {
      setItems((list) => list.map((entry) => (entry.id === item.id ? { ...entry, visible: !visible } : entry)));
      fail(error);
    }
  };

  const openEditor = (item, isNew = false) => {
    setEditing({ item, isNew });
    setValues(item);
    setErrors({});
  };

  const save = async () => {
    const nextErrors = validateFields(definition.fields, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      if (editing.isNew) {
        const created = await adminApi.create(name, values);
        setItems((list) => [...list, created]);
        allRef.current = [...allRef.current, created];
        savedOrder.current = [...itemsRef.current, created].map((item) => item.id).join();
        toast.success(`${definition.singular} added`);
      } else {
        const updated = await adminApi.update(name, editing.item.id, values);
        setItems((list) => list.map((entry) => (entry.id === updated.id ? updated : entry)));
        allRef.current = allRef.current.map((entry) => (entry.id === updated.id ? updated : entry));
        toast.success("Changes saved");
      }
      setEditing(null);
    } catch (error) {
      if (error.details) setErrors(error.details);
      fail(error);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.remove(name, toDelete.id);
      setItems((list) => list.filter((entry) => entry.id !== toDelete.id));
      allRef.current = allRef.current.filter((entry) => entry.id !== toDelete.id);
      savedOrder.current = itemsRef.current.filter((entry) => entry.id !== toDelete.id).map((item) => item.id).join();
      toast.success(`${definition.singular} deleted`);
      setToDelete(null);
    } catch (error) {
      fail(error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={definition.label}
        description={definition.description}
        actions={
          !definition.fixed && (
            <Button icon={LuPlus} onClick={() => openEditor({ ...defaultItem(name), ...newItem }, true)}>
              Add {definition.singular.toLowerCase()}
            </Button>
          )
        }
      />

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-heading/15 px-6 py-16 text-center">
          <p className="text-body">No {definition.label.toLowerCase()} yet.</p>
          {!definition.fixed && (
            <Button className="mt-5" icon={LuPlus} onClick={() => openEditor({ ...defaultItem(name), ...newItem }, true)}>
              Add the first one
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="mb-3 text-[13px] text-body/80">Drag the handle (or use the arrows) to reorder — the site follows this order.</p>
          <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
            {items.map((item, index) => (
              <ItemRow
                key={item.id}
                item={item}
                index={index}
                total={items.length}
                definition={definition}
                onEdit={openEditor}
                onToggle={toggleVisible}
                onDelete={setToDelete}
                onMove={move}
                onDragEnd={() => persistOrder()}
              />
            ))}
          </Reorder.Group>
        </>
      )}

      <Drawer
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing?.isNew ? `New ${definition.singular.toLowerCase()}` : `Edit ${definition.singular.toLowerCase()}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
              {editing?.isNew ? "Create" : "Save changes"}
            </Button>
          </>
        }
      >
        {editing && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <FieldList
              fields={definition.fields}
              values={values}
              errors={errors}
              onFieldChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
            />
            <div className="mt-6 flex items-center justify-between rounded-xl border border-heading/10 px-4 py-3">
              <span className="text-sm text-body">Visible on the site</span>
              <Switch
                label="Visible on the site"
                checked={values.visible !== false}
                onChange={(visible) => setValues((current) => ({ ...current, visible }))}
              />
            </div>
            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          </form>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete this ${definition.singular.toLowerCase()}?`}
        message={`“${toDelete?.[definition.titleField] || "This item"}” will be removed from your portfolio. This can't be undone.`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </>
  );
}

export default function CollectionPage() {
  const { name } = useParams();
  const definition = COLLECTIONS[name];
  if (!definition) return <Navigate to="/admin" replace />;
  // Projects are managed on their group pages (Supply Chain, QA, Development).
  if (PROJECT_PAGE_OF[name]) return <Navigate to={PROJECT_PAGE_OF[name]} replace />;
  // Keyed by name so switching collections resets all state.
  return <CollectionManager key={name} name={name} definition={definition} />;
}

/** One of the project pages — Supply Chain, QA or Development — managing only that group's projects. */
export function ProjectGroupPage() {
  const { group } = useParams();
  const view = projectGroup(group);
  if (!view) return <Navigate to={PROJECT_PAGE_OF.projects} replace />;
  return (
    <CollectionManager
      key={view.key}
      name={view.collection}
      definition={view.definition}
      includes={view.includes}
      newItem={view.newItem}
    />
  );
}
