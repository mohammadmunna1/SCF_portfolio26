import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { LuSave } from "react-icons/lu";
import { SINGLETONS, singletonFields } from "../../../shared/schema.js";
import { adminApi } from "../api";
import { useAuth } from "../auth";
import { FieldList } from "../fields";
import { validateFields } from "../validation";
import { useToast } from "../Toast";
import { Button, PageHeader, Panel, Spinner } from "../ui";

const KEY = "profile";

export default function ProfilePage() {
  const definition = SINGLETONS[KEY];
  const toast = useToast();
  const { handleError } = useAuth();
  const [saved, setSaved] = useState(null);
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fail = useCallback(
    (error) => {
      handleError(error);
      toast.error(error.message);
    },
    [handleError, toast]
  );

  useEffect(() => {
    adminApi
      .getSingleton(KEY)
      .then((data) => {
        setSaved(data);
        setValues(data);
      })
      .catch(fail);
  }, [fail]);

  const dirty = values && saved && JSON.stringify(values) !== JSON.stringify(saved);

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const save = async () => {
    const nextErrors = validateFields(singletonFields(KEY), values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      const data = await adminApi.saveSingleton(KEY, values);
      setSaved(data);
      setValues(data);
      toast.success("Profile saved");
    } catch (error) {
      if (error.details) setErrors(error.details);
      fail(error);
    } finally {
      setSaving(false);
    }
  };

  if (!values) return <Spinner />;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      className="pb-28"
    >
      <PageHeader title={definition.label} description={definition.description} />
      <div className="space-y-6">
        {definition.groups.map((group) => (
          <Panel key={group.title}>
            <h2 className="text-lg font-medium text-heading">{group.title}</h2>
            {group.description && <p className="mt-1 text-sm text-body/80">{group.description}</p>}
            <div className="mt-6">
              <FieldList
                fields={group.fields}
                values={values}
                errors={errors}
                onFieldChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
              />
            </div>
          </Panel>
        ))}
      </div>

      <AnimatePresence>
        {dirty && (
          <motion.div
            className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center justify-between gap-4 rounded-2xl border border-heading/15 bg-surface-raised px-5 py-3 shadow-2xl lg:left-[calc(260px+2rem)]"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
          >
            <span className="text-sm text-body">You have unsaved changes</span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setValues(saved)} disabled={saving}>
                Discard
              </Button>
              <Button type="submit" icon={LuSave} loading={saving}>
                Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
