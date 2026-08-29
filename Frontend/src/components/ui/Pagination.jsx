import Icon from "./Icon";

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <div className="flex items-center justify-between p-md border-t border-outline-variant flex-wrap gap-sm">
      <span className="text-caption text-outline">
        Halaman {meta.current_page} dari {meta.last_page} ({meta.total} data)
      </span>
      <div className="flex gap-xs">
        <button
          className="px-md py-1 border border-outline-variant rounded-lg disabled:opacity-40 hover:bg-surface-container-low transition-colors"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          <Icon name="chevron_left" size="text-lg" />
        </button>
        <button
          className="px-md py-1 border border-outline-variant rounded-lg disabled:opacity-40 hover:bg-surface-container-low transition-colors"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          <Icon name="chevron_right" size="text-lg" />
        </button>
      </div>
    </div>
  );
}
