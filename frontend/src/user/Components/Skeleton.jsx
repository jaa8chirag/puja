import React from 'react';

const Skeleton = ({ className = "", variant = "rounded" }) => {
  const baseClass = "animate-pulse bg-gray-200/60 dark:bg-gray-700/40";
  
  const variants = {
    circle: "rounded-full",
    rounded: "rounded-2xl",
    text: "rounded-md h-4 w-full",
    pill: "rounded-full h-6 w-24",
  };

  return (
    <div className={`${baseClass} ${variants[variant]} ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm p-4 flex flex-col gap-4">
    <Skeleton className="w-full aspect-[16/7]" />
    <div className="space-y-3 px-1">
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

export const HeroSkeleton = () => (
  <div className="w-full max-w-6xl mx-auto rounded-[28px] overflow-hidden border-2 border-orange-100 mb-12">
    <Skeleton className="w-full h-[300px] md:h-[400px]" variant="rounded" />
  </div>
);

export default Skeleton;
