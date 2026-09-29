import { useState, useCallback } from "react";
import Toast from "./Toast";

/**
 * useToast — hook to manage and render toast notifications.
 * Returns: { showToast, ToastComponent }
 */
export function useToast() {
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null;

  return { showToast, ToastComponent };
}

export default useToast;
