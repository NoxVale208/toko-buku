const TONES = {
  success: "bg-green-100 text-green-700",
  error: "bg-error-container text-on-error-container",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-primary-fixed text-on-primary-fixed-variant",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

export default function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-caption font-caption font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
