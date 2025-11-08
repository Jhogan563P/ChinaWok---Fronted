const SkeletonGrid = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="animate-pulse rounded-3xl border border-gray-100 bg-white p-5">
        <div className="mb-4 h-40 rounded-2xl bg-gray-200" />
        <div className="mb-2 h-5 w-3/4 rounded-full bg-gray-200" />
        <div className="h-4 w-full rounded-full bg-gray-200" />
        <div className="mt-6 flex items-center justify-between">
          <div className="h-6 w-16 rounded-full bg-gray-200" />
          <div className="h-8 w-20 rounded-full bg-gray-200" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonGrid;
