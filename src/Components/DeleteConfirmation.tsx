import { AlertTriangle, X } from "lucide-react";

interface Props {
  title?: string;
  message?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteConfirmation({
  title = "Delete this item?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  onCancel,
  onConfirm,
  loading = false,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Confirm action</h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="p-1 rounded-full bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex items-start gap-4 px-6 py-5 border-b border-slate-200">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
            <AlertTriangle size={22} />
          </span>
          <div>
            <h4 className="font-bold text-slate-900">{title}</h4>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-slate-300 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}
