import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="py-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Skeleton */}
      <div className="p-8 rounded-3xl glass-card space-y-4">
        <div className="h-4 w-40 rounded-full skeleton-shimmer" />
        <div className="h-8 w-2/3 rounded-2xl skeleton-shimmer" />
        <div className="h-4 w-1/2 rounded-full skeleton-shimmer" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-3xl glass-card space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl skeleton-shimmer" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 rounded-full skeleton-shimmer" />
                <div className="h-5 w-36 rounded-xl skeleton-shimmer" />
              </div>
            </div>
            <div className="h-20 w-full rounded-2xl skeleton-shimmer" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 w-20 rounded-lg skeleton-shimmer" />
              <div className="h-10 w-28 rounded-xl skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* Large Bottom Skeleton */}
      <div className="p-8 rounded-3xl glass-card space-y-6">
        <div className="h-6 w-48 rounded-xl skeleton-shimmer" />
        <div className="space-y-3">
          <div className="h-12 w-full rounded-2xl skeleton-shimmer" />
          <div className="h-12 w-full rounded-2xl skeleton-shimmer" />
          <div className="h-12 w-full rounded-2xl skeleton-shimmer" />
        </div>
      </div>

    </div>
  );
};
