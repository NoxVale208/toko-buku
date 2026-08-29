import Icon from "./Icon";

const VARIANTS = {
  primary:
    "bg-primary text-white shadow-level1 hover:bg-primary/90 active:scale-95",
  secondary:
    "bg-white border border-outline-variant/60 text-primary hover:bg-surface-container-low active:scale-95",
  ghost:
    "bg-transparent text-primary hover:bg-surface-container-low active:scale-95",
  danger:
    "bg-error text-white hover:bg-error/90 active:scale-95",
};

const SIZES = {
  sm: "py-2 px-4 text-body-md",
  md: "py-3 px-5 text-title-md",
  lg: "py-4 px-6 text-title-md",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  fullWidth = false,
  loading = false,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-sm rounded-auth font-title-md transition-all hover:scale-[0.99]
        ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""}
        ${disabled || loading ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Icon name="sync" className="animate-spin" size="text-lg" />
      ) : (
        <>
          {icon && iconPosition === "left" && <Icon name={icon} size="text-lg" />}
          {children && <span>{children}</span>}
          {icon && iconPosition === "right" && <Icon name={icon} size="text-lg" />}
        </>
      )}
    </button>
  );
}
