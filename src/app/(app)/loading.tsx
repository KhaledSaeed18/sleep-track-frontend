export default function Loading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="h-10 w-64 skeleton" />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="h-64 skeleton rounded-box xl:col-span-2" />
        <div className="h-64 skeleton rounded-box" />
      </div>
      <div className="h-28 skeleton rounded-box" />
    </div>
  );
}
