"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteAssignmentButton({
  assignmentId,
  assignmentTitle,
}: {
  assignmentId: string;
  assignmentTitle: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to delete");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Delete &quot;{assignmentTitle}&quot;?
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Yes"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
    >
      Delete
    </button>
  );
}
