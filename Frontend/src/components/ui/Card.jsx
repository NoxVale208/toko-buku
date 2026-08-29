export default function Card({ children, className = "", padded = true, ...props }) {
  return (
    <div
      className={`bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-level1 ${
        padded ? "p-lg" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
