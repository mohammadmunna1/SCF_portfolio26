import { useState } from "react";
import { LuDownload, LuKeyRound, LuLogOut } from "react-icons/lu";
import { adminApi } from "../api";
import { useAuth } from "../auth";
import { inputClass } from "../fields";
import { useToast } from "../Toast";
import { Button, PageHeader, Panel } from "../ui";

const MIN_LENGTH = 10;
const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

const passwordField = (name, label, help) => ({ name, label, type: "password", required: true, help });

function PasswordInput({ field, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={field.name} className="mb-2 block text-sm font-medium text-heading">
        {field.label}
      </label>
      <input
        id={field.name}
        type="password"
        autoComplete={field.name === "currentPassword" ? "current-password" : "new-password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${field.name}-error` : undefined}
        className={inputClass}
      />
      {field.help && !error && <p className="mt-1.5 text-[13px] text-body/80">{field.help}</p>}
      {error && (
        <p id={`${field.name}-error`} className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default function AccountPage() {
  const { admin, logout, handleError } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const update = (name) => (value) => setForm((current) => ({ ...current, [name]: value }));

  const changePassword = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.currentPassword) nextErrors.currentPassword = "Enter your current password.";
    if (form.newPassword.length < MIN_LENGTH) nextErrors.newPassword = `Use at least ${MIN_LENGTH} characters.`;
    if (form.newPassword !== form.confirmPassword) nextErrors.confirmPassword = "Passwords don't match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await adminApi.changePassword(form.currentPassword, form.newPassword);
      setForm(EMPTY);
      toast.success("Password changed. Other sessions were signed out.");
    } catch (error) {
      handleError(error);
      if (error.details) setErrors(error.details);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const exportBackup = async () => {
    setExporting(true);
    try {
      await adminApi.downloadBackup();
    } catch (error) {
      handleError(error);
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader title="Account" description={`Signed in as ${admin?.email}.`} />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel as="form" onSubmit={changePassword}>
          <h2 className="text-lg font-medium text-heading">Change password</h2>
          <p className="mt-1 text-sm text-body/80">Changing it signs out every other session.</p>
          <div className="mt-6 space-y-5">
            {[
              passwordField("currentPassword", "Current password"),
              passwordField("newPassword", "New password", `At least ${MIN_LENGTH} characters — a passphrase works well.`),
              passwordField("confirmPassword", "Confirm new password"),
            ].map((field) => (
              <PasswordInput key={field.name} field={field} value={form[field.name]} onChange={update(field.name)} error={errors[field.name]} />
            ))}
          </div>
          <Button type="submit" icon={LuKeyRound} loading={saving} className="mt-6">
            Update password
          </Button>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h2 className="text-lg font-medium text-heading">Backup</h2>
            <p className="mt-1 text-sm text-body/80">Download all portfolio content as a JSON file.</p>
            <Button variant="secondary" icon={LuDownload} loading={exporting} onClick={exportBackup} className="mt-5">
              Export backup
            </Button>
          </Panel>
          <Panel>
            <h2 className="text-lg font-medium text-heading">Session</h2>
            <p className="mt-1 text-sm text-body/80">Sign out of the admin panel on this device.</p>
            <Button variant="secondary" icon={LuLogOut} onClick={logout} className="mt-5">
              Sign out
            </Button>
          </Panel>
        </div>
      </div>
    </>
  );
}

