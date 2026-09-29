/**
 * StatusBadge — renders account status as a pill chip.
 * status: "active" | "blocked" | "closed"
 */
function StatusBadge({ status }) {
  const styles = {
    active:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    blocked:
      "bg-amber-50 text-amber-700 border border-amber-200",
    closed:
      "bg-slate-100 text-slate-500 border border-slate-200",
  };

  const labels = {
    active: "Active",
    blocked: "Blocked",
    closed: "Closed",
  };

  const style = styles[status] || styles.closed;
  const label = labels[status] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${style}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
