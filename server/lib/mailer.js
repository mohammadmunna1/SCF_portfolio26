import { config } from "../config.js";

let transporter;

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

export const isMailerConfigured = () => Boolean(config.mail.user && config.mail.pass);

/** Emails a contact-form submission. Returns false when mail is not configured. */
export async function sendContactEmail({ name, email, subject, message }, fallbackRecipient) {
  const to = config.mail.to || fallbackRecipient;
  if (!isMailerConfigured() || !to) return false;

  // Loaded on first use, so the serverless cold start that serves every visitor's content doesn't pay for it.
  const { default: nodemailer } = await import("nodemailer");
  transporter ??= nodemailer.createTransport({
    service: config.mail.service,
    auth: { user: config.mail.user, pass: config.mail.pass },
  });

  const cleanSubject = String(subject || "New Message").replace(/[\r\n]+/g, " ");
  await transporter.sendMail({
    from: config.mail.user,
    to,
    replyTo: email,
    subject: `Portfolio Contact Form: ${cleanSubject}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h3>New message from your portfolio contact form</h3>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `,
  });
  return true;
}
