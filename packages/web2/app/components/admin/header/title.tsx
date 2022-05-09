import React from "react";

export interface AdminHeaderTitleProps {
  title: React.ReactNode;
}

export default function AdminHeaderTitle({ title }: AdminHeaderTitleProps) {
  return (
    <div className="min-w-0 flex-1">
      <h1 className="text-xl font-medium leading-6 text-gray-900 sm:truncate">
        {title}
      </h1>
    </div>
  );
}
