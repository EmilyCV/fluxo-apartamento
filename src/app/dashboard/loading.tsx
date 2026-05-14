export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 space-y-12">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-slate-100 rounded-full animate-pulse" />
          <div className="h-10 w-64 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
        <div className="h-14 w-32 bg-slate-100 rounded-2xl animate-pulse" />
      </div>

      {/* Bento grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 h-[340px] bg-slate-100 rounded-[32px] animate-pulse" />
        <div className="md:col-span-4 h-[340px] bg-slate-100 rounded-[32px] animate-pulse" />
        <div className="md:col-span-4 h-48 bg-slate-100 rounded-[32px] animate-pulse" />
        <div className="md:col-span-4 h-48 bg-slate-100 rounded-[32px] animate-pulse" />
        <div className="md:col-span-4 h-48 bg-slate-100 rounded-[32px] animate-pulse" />
      </div>
    </div>
  );
}
