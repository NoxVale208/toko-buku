import { useState } from "react";
import Icon from "./Icon";

export default function Input({
  label,
  icon,
  type = "text",
  error,
  rightAction,
  className = "",
  labelRight,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-base">
      {label && (
        <div className="flex justify-between items-center px-sm">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase">
            {label}
          </label>
          {labelRight}
        </div>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-xl">
            {icon}
          </span>
        )}
        <input
          type={inputType}
          className={`w-full ${icon ? "pl-[48px]" : "pl-md"} ${
            isPassword ? "pr-[48px]" : "pr-md"
          } py-3 bg-surface-container-lowest border rounded-auth focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50 font-body-md text-on-surface
          ${error ? "border-error" : "border-outline-variant/60"} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
          >
            <Icon name={showPassword ? "visibility_off" : "visibility"} size="text-xl" />
          </button>
        )}
      </div>
      {error && <p className="text-error text-caption font-caption px-sm">{error}</p>}
    </div>
  );
}
