import React from "react";

export interface AdminHeaderActionsProps {
  children: React.ReactNode;
}

export default function AdminHeaderActions({
  children,
}: AdminHeaderActionsProps) {
  return <div className="ml-4 mt-2 flex-shrink-0">{children}</div>;
}
