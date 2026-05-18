export default function ComprasLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12">
      <div className="h-12 w-72 bg-slate-100 rounded-2xl animate-pulse" />
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 w-32 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 sm:h-72 bg-slate-100 rounded-[32px] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
