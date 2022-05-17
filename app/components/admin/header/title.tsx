import { Typography } from "@mui/material";
import React from "react";

export interface AdminHeaderTitleProps {
  title: React.ReactNode;
}

export default function AdminHeaderTitle({ title }: AdminHeaderTitleProps) {
  return (
    <div className="min-w-0 flex-1">
      <Typography variant="h5">{title}</Typography>
    </div>
  );
}
