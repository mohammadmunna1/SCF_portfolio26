import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { LuMail, LuMailOpen, LuReply, LuTrash2 } from "react-icons/lu";
import { useOutletContext } from "react-router-dom";
import { adminApi } from "../api";
import { useAuth } from "../auth";
import { useToast } from "../Toast";
import { Badge, Button, ConfirmDialog, PageHeader, Spinner } from "../ui";

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function MessagesPage() {
  const toast = useToast();
  const { handleError } = useAuth();
  const { refreshUnread } = useOutletContext();
  const [messages, setMessages] = useState(null);
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const fail = useCallback(
    (error) => {
      handleError(error);
      toast.error(error.message);
    },
    [handleError, toast]
  );

  useEffect(() => {
    adminApi.messages().then(setMessages).catch(fail);
  }, [fail]);

  useEffect(() => {
    if (messages) refreshUnread(messages.filter((message) => !message.read).length);
  }, [messages, refreshUnread]);

  const setRead = async (message, read) => {
    setMessages((list) => list.map((entry) => (entry.id === message.id ? { ...entry, read } : entry)));
    try {
      await adminApi.markMessage(message.id, read);
    } catch (error) {
      setMessages((list) => list.map((entry) => (entry.id === message.id ? { ...entry, read: !read } : entry)));
      fail(error);
    }
  };

  const toggleOpen = (message) => {
    const opening = openId !== message.id;
    setOpenId(opening ? message.id : null);
    if (opening && !message.read) setRead(message, true);
  };

  const confirmDelete = async () => {
    try {
      await adminApi.deleteMessage(toDelete.id);
      setMessages((list) => list.filter((entry) => entry.id !== toDelete.id));
      toast.success("Message deleted");
    } catch (error) {
      fail(error);
    } finally {
      setToDelete(null);
    }
  };

  if (!messages) return <Spinner />;
  const unread = messages.filter((message) => !message.read).length;
  const visible = filter === "unread" ? messages.filter((message) => !message.read) : messages;

  return (
    <>
      <PageHeader
        title="Messages"
        description="Everything sent through the contact form on your site."
        actions={
          <div className="flex rounded-xl border border-heading/10 p-1" role="group" aria-label="Filter messages">
            {[
              ["all", `All (${messages.length})`],
              ["unread", `Unread (${unread})`],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded-lg px-3.5 py-1.5 text-sm transition-colors ${filter === key ? "bg-button text-button-text" : "text-body hover:text-heading"}`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-heading/15 px-6 py-16 text-center text-body">
          {filter === "unread" ? "You're all caught up." : "No messages yet."}
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((message) => {
            const open = openId === message.id;
            return (
              <li key={message.id} className={`rounded-2xl border bg-surface ${message.read ? "border-heading/[0.07]" : "border-heading/25"}`}>
                <button
                  type="button"
                  onClick={() => toggleOpen(message)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-4 px-4 py-4 text-left md:px-5"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${message.read ? "bg-transparent" : "bg-accent"}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className={`font-medium ${message.read ? "text-body" : "text-heading"}`}>{message.name}</span>
                      <span className="truncate text-sm text-body/80">{message.email}</span>
                      {!message.read && <Badge tone="info">New</Badge>}
                    </span>
                    {!open && <span className="mt-1 block truncate text-sm text-body/80">{message.message}</span>}
                  </span>
                  <span className="shrink-0 text-xs text-body/80">{formatDate(message.createdAt)}</span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-heading/10 px-4 pb-4 pt-4 md:px-5">
                        {message.subject && <p className="mb-2 text-sm text-body/80">Subject: {message.subject}</p>}
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-heading">{message.message}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <a
                            href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "Your message"}`)}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-button px-4 py-2.5 text-[15px] font-medium text-button-text hover:bg-button/85"
                          >
                            <LuReply className="h-4 w-4" aria-hidden="true" /> Reply
                          </a>
                          <Button variant="secondary" icon={message.read ? LuMail : LuMailOpen} onClick={() => setRead(message, !message.read)}>
                            Mark as {message.read ? "unread" : "read"}
                          </Button>
                          <Button variant="danger" icon={LuTrash2} onClick={() => setToDelete(message)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this message?"
        message={`The message from ${toDelete?.name} will be permanently deleted.`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
