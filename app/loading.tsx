export default function Loading() {
  return (
    <div className="px-4 py-24">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-rose" />
        <p className="text-sm text-muted">Yangi gullar yig'ilmoqda…</p>
      </div>
    </div>
  );
}
