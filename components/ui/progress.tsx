"use client";

import React from "react";

interface ProgressProps {
  value: number; // 0 à 100
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className }) => {
  return (
    <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-blue-600 transition-all"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
};
