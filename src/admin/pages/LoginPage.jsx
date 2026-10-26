import { motion } from "framer-motion";
import { useState } from "react";
import { LuArrowLeft, LuLock } from "react-icons/lu";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { SITE_NAME } from "../../../shared/site.js";
import { useAuth } from "../auth";
import { Button } from "../ui";

const inputClass =
  "w-full rounded-xl border border-heading/10 bg-canvas px-4 py-3 text-base text-heading placeholder:text-muted focus:border-heading/50 focus:outline-none";

export default function LoginPage() {
  const { admin, checking, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!checking && admin) return <Navigate to={location.state?.from || "/admin"} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-canvas px-4 py-16 text-heading">
      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 60, mass: 0.5 }}
      >
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-body hover:text-heading">
          <LuArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to site
        </Link>
        <form onSubmit={handleSubmit} className="rounded-[28px] border border-heading/10 bg-surface p-8">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-button text-button-text">
            <LuLock className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-6 text-sm text-body">{SITE_NAME}</p>
          <h1 className="mt-1 text-[1.75rem] font-normal leading-tight tracking-[-0.02em] text-heading">Admin sign in</h1>
          <p className="mt-3 text-[15px] text-body">Manage your portfolio content.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="admin-email" className="mb-2 block text-sm text-body">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-2 block text-sm text-body">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div role="alert" className="min-h-[1.5rem] pt-4 text-sm text-danger">
            {error}
          </div>
          <Button type="submit" loading={submitting} className="mt-2 w-full py-3 text-base">
            Sign in
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
