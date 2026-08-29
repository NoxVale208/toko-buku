export default function Icon({ name, className = "", size = "text-xl", ...props }) {
  return (
    <span className={`material-symbols-outlined ${size} ${className}`} {...props}>
      {name}
    </span>
  );
}
