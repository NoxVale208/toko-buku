export default function Placeholder({ title }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-md">
      <span className="material-symbols-outlined text-outline text-[64px]">construction</span>
      <h1 className="font-headline-md text-headline-md text-on-surface">{title}</h1>
      <p className="font-body-md text-body-md text-on-surface-variant">
        Halaman ini akan dibangun pada fase berikutnya.
      </p>
    </div>
  );
}
