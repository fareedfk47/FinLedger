/**
 * EmptyState — shown when a list has no items.
 * Props:
 *   icon: string — Material Symbol name
 *   title: string
 *   message: string
 *   action: { label, onClick } (optional)
 */
function EmptyState({ icon = "inbox", title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
          {icon}
        </span>
      </div>

      {title && (
        <h3 className="text-base font-semibold text-on-surface mb-1">
          {title}
        </h3>
      )}

      {message && (
        <p className="text-sm text-on-surface-variant max-w-xs">{message}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold transition-transform active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
