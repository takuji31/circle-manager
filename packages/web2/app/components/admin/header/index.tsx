import React from "react";

export interface AdminHeaderProps {
  children: React.ReactNode;
}

export default function AdminHeader({ children }: AdminHeaderProps) {
  return (
    <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
