import { useEffect } from "react";

/**
 * Toast — simple slide-up notification.
 * type: "success" | "error" | "info"
 */
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-600 text-white",
    error: "bg-error text-on-error",
    info: "bg-primary text-on-primary",
  };

  const icons = {
    success: "check_circle",
    error: "error",
    info: "info",
  };

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg max-w-[90vw] w-max ${styles[type]}`}
      role="alert"
    >
      <span className="material-symbols-outlined text-[20px]">
        {icons[type]}
      </span>
      <span className="text-sm font-medium leading-snug">{message}</span>
      <button
        onClick={onClose}
        className="ml-1 opacity-75 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}

export default Toast;
